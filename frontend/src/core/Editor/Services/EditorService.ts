import ProjectRepository from "../Repositories/ProjectRepository.ts";
import {Project, ProjectObjectTypes} from "../Entities/Project.ts";
import {ScreenRenderEngine} from "../../Render/ScreenRenderEngine.ts";
import Bezier from "../Entities/Bezier.ts";
import v2 from "../../Math/v2.tsx";
import {randomName} from "../../UI/utils.ts";
import APIService from "../../Network/APIService.ts";
import {UpdateResult} from "../DTO/UpdateResult.ts";
import {EditorContextData} from "../../../contexts/EditorContext.tsx";
import RenderableObject from "../../Render/RenderableObject.ts";
import {ObjectInTime, Primitive} from "../../Render/ObjectInTime.ts";
import Color from "../../Math/color.tsx";
import Shape from "../../Render/Shape.ts";

export default class EditorService
{
    private selectionObject: RenderableObject = {
        getObjectInTime: this.renderUISelectionObject.bind(this)
    }
    private onEditorUpdateCallbacks: ((editorContextData: Partial<EditorContextData>) => void)[] = []
    private selectedObjectId: number|null = null;
    private currentProject: Project|null = null;
    private projectRepository: ProjectRepository;
    private screenRenderEngine: ScreenRenderEngine;
    private apiService: APIService;

    constructor(
        projectRepository: ProjectRepository,
        screenRenderEngine: ScreenRenderEngine,
        apiService: APIService
    ) {
        this.projectRepository = projectRepository;
        this.screenRenderEngine = screenRenderEngine;
        this.apiService = apiService;
    }

    getCurrentProject(): Project|null {
        return this.currentProject;
    }

    private resendProjectToRenderer(): void {
        if(!this.currentProject) throw new Error("No project to send");
        this.screenRenderEngine.clearRenderObjects();
        for (const object of this.currentProject.getObjects()) {
            this.addObjectToRenderer(object);
        }
        this.addObjectToRenderer(this.selectionObject);
    }

    private renderUISelectionObject(): ObjectInTime {
        const selectedObject = this.getSelectedObject();
        const primitivesToRender: Primitive[] = [];
        const padding = 12;
        if (selectedObject) {
            let minX = 4096, minY = 4096, maxX = 0, maxY = 0;
            for (const cp of selectedObject.getControlPoints()) {
                minX = Math.min(minX, cp.x);
                minY = Math.min(minY, cp.y);
                maxX = Math.max(maxX, cp.x);
                maxY = Math.max(maxY, cp.y);
            }
            const shape: {type: 'Shape'} & Shape = {
                type: 'Shape',
                points: [
                    new v2(minX - padding, minY - padding),
                    new v2(maxX + padding, minY - padding),
                    new v2(maxX + padding, maxY + padding),
                    new v2(minX - padding, maxY + padding),
                    new v2(minX - padding, minY - padding)
                ],
                strokeThickness: 1,
                strokeColor: new Color(255, 255, 255, 1),
                dashedLine: [15, 5]
            }

            primitivesToRender.push(shape);

            for ( let i = 0; i<4; i++ ) {
                primitivesToRender.push({
                    type: "Arc",
                    center: shape.points[i],
                    radius: 6,
                    strokeThickness: 0,
                    fillColor: new Color(250, 201, 52, 1),
                    angle: 2 * Math.PI
                });
            }


            return {
                primitivesToRender
            }
        }

        return {
            primitivesToRender: []
        }
    }

    private addObjectToRenderer(object: RenderableObject): void {
        this.screenRenderEngine.addRenderableObject(object);
    }

    async changeProject(project: Project): Promise<void> {
        this.currentProject = project;
        this.resendProjectToRenderer();
        await this.apiService.connectSocket();
        await this.apiService.joinRoom({ projectId: project.getId() });
        this.apiService.handleProjectUpdated((response: { source: string, result: UpdateResult }) => {
            if (response.result.objectType === 'bezier') {
                const object = Bezier.fromProjectObjectResponse(response.result.newState);
                switch (response.result.action) {
                    case "create":
                        this.createNewObjectLocal(object);
                        break;
                    case "update":
                        this.updateObjectLocal(object);
                        break;
                    case "delete":
                        this.deleteObjectLocal(object.getId());
                        break;
                }
            }
        })
    }

    private createNewObjectLocal(object: ProjectObjectTypes): void {
        if (!this.currentProject) throw new Error("No project loaded");
        const objs = this.currentProject.getObjects();
        objs.push(object);
        this.currentProject.updateObjects(objs);
        this.selectedObjectId = object.getId();
        this.addObjectToRenderer(object);

        // this should cause the UI list to update
        this.callEditorUpdateCallbacks({
            selectedObjectId: this.selectedObjectId,
        });
    }

    private updateObjectLocal(object: ProjectObjectTypes): void {
        if (!this.currentProject) throw new Error("No project loaded");
        const objs = this.currentProject.getObjects();
        const targetIndex = objs.findIndex(obj=>obj.getId() === object.getId());
        if(targetIndex === -1) throw new Error("Index not in local array")
        // objs[targetIndex] = object;
        objs[targetIndex].updateDataWith(object);
        // this.currentProject.updateObjects(objs);
        this.callEditorUpdateCallbacks({});
    }

    private deleteObjectLocal(objectId: number): void {
        if (!this.currentProject) throw new Error("No project loaded");
        const objs = this.currentProject.getObjects();
        const index = objs.findIndex(obj=>obj.getId() === objectId);
        if(index === -1) throw new Error("Index not in local array")
        objs.splice(index, 1);
        this.currentProject.updateObjects(objs);
        this.resendProjectToRenderer()
        this.selectedObjectId = null;
        this.callEditorUpdateCallbacks({
            selectedObjectId: null
        });
    }

    changeSelectedObjectId(selectedObjectId: number): void {
        this.selectedObjectId = selectedObjectId;
    }

    unselectObject(): void {
        this.selectedObjectId = null;
    }

    getSelectedObject(): ProjectObjectTypes|null {
        if(!this.selectedObjectId) return null;
        if(!this.currentProject) return null;
        return this.currentProject.getObjectById(this.selectedObjectId);
    }

    handleAddControlPoint(object: ProjectObjectTypes, position: v2): void {
        if(object.getType() === 'bezier') {
            (object as Bezier).addControlPoint(position);
            this.updateBezier(object as Bezier); // this should be fired to everyone
        }
    }

    async createNewProject(name: string): Promise<Project> {
        return await this.projectRepository.createProjectByName(name);
    }

    async updateBezier(bezier: Bezier): Promise<void> {
        if(!this.currentProject) throw new Error('No current project');
        await this.apiService.projectUpdate({
            projectId: this.currentProject.getId(),
            type: "update",
            data: {
                type: 'bezier',
                id: bezier.getId(),
                name: bezier.getName(),
                controlPoints: bezier.getControlPoints().map( e => e.values ),
                position: bezier.getPosition(),
                rotation: bezier.getRotation(),
                scale: bezier.getScale(),
            },
        })
    }

    async updateObjectUniversal(object: ProjectObjectTypes): Promise<void> {
        if(!this.currentProject) throw new Error('No current project');
        await this.apiService.projectUpdate({
            projectId: this.currentProject.getId(),
            type: "update",
            data: {
                type: 'bezier',
                id: object.getId(),
                name: object.getName(),
                position: object.getPosition(),
                rotation: object.getRotation(),
                scale: object.getScale(),
            },
        })
    }

    async deleteObjectUniversal(object: ProjectObjectTypes): Promise<void> {
        if(!this.currentProject) throw new Error('No current project');
        await this.apiService.projectUpdate({
            projectId: this.currentProject.getId(),
            type: "delete",
            data: {
                type: object.getType(),
                id: object.getId(),
            },
        })
    }

    async createNewBezier(startingPosition: v2): Promise<void> {
        if(!this.currentProject) throw new Error('No current project');
        await this.apiService.projectUpdate({
            projectId: this.currentProject.getId(),
            type: "create",
            data: {
                type: 'bezier',
                controlPoints: [startingPosition.values],
                position: startingPosition.values,
                rotation: 0,
                scale: 1,
                name: randomName()
            },
        })
    }

    async getProjectById(id: number): Promise<Project> {
        return await this.projectRepository.getById(id);
    }

    onEditorUpdate(callback: (editorContextData: Partial<EditorContextData>) => void): void {
        this.onEditorUpdateCallbacks.push(callback);
    }

    private callEditorUpdateCallbacks(editorContextData: Partial<EditorContextData>): void {
        for ( const cb of this.onEditorUpdateCallbacks ) {
            cb(editorContextData);
        }
    }
}