import ProjectRepository from "../Repositories/ProjectRepository.ts";
import {Project, ProjectObjectTypes} from "../Entities/Project.ts";
import {ScreenRenderEngine} from "../../Render/ScreenRenderEngine.ts";
import Bezier from "../Entities/Bezier.ts";
import v2 from "../../Math/v2.tsx";
import {randomName} from "../../UI/utils.ts";
import APIService from "../../Network/APIService.ts";

export default class EditorService
{
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

    private resendProjectToRenderer(): void
    {
        if(!this.currentProject) throw new Error("No project to send");
        for (const object of this.currentProject.getObjects()) {
            this.addObjectToRenderer(object);
        }
    }

    private addObjectToRenderer(object: ProjectObjectTypes): void
    {
        this.screenRenderEngine.addRenderableObject(object);
    }

    async changeProject(project: Project): Promise<void> {
        this.currentProject = project;
        this.resendProjectToRenderer();
        await this.apiService.connectSocket();
        await this.apiService.joinRoom({ projectId: project.getId() });
        this.apiService.handleProjectUpdated(object => {
            console.log(object)
        })
    }

    async handleCreateBezier(data: object): Promise<void> {
        throw new Error("Not implemented");
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
}