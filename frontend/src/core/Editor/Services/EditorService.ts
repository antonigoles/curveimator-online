import ProjectRepository from "../Repositories/ProjectRepository.ts";
import {Project, ProjectObjectTypes} from "../Entities/Project.ts";
import {ScreenRenderEngine} from "../../Render/ScreenRenderEngine.ts";
import Bezier from "../Entities/Bezier.ts";
import v2 from "../../Math/v2.ts";
import {randomName} from "../../UI/utils.ts";
import APIService from "../../Network/APIService.ts";
import {UpdateResult} from "../DTO/UpdateResult.ts";
import {EditorContextData} from "../../../contexts/EditorContext.tsx";
import RenderableObject from "../../Render/RenderableObject.ts";
import {ObjectInTime, Primitive} from "../../Render/ObjectInTime.ts";
import Color from "../../Math/color.ts";
import Shape from "../../Render/Shape.ts";
import Keyframe from "../Entities/Keyframe.ts";

import {editorService} from "../../DIContainer.tsx";

export default class EditorService
{
    private selectionObject: RenderableObject = {
        // getObjectInTime: this.renderUISelectionObject.bind(this),
        getObjectInCurrentState: this.renderUISelectionObject.bind(this)
    }
    private onEditorUpdateCallbacks: ((editorContextData: Partial<EditorContextData>) => void)[] = []
    private selectedObjectId: number|null = null;
    private currentProject: Project|null = null;
    private syncTimeoutMap: {[key: string]: NodeJS.Timeout|null} = {};

    private projectRepository: ProjectRepository;
    private screenRenderEngine: ScreenRenderEngine;
    private apiService: APIService;

    private isAutoPlaying: boolean = false;
    private exporting: boolean = false;
    private autoPlaybackProgress: number = 0;
    private playbackUpdateInterval: NodeJS.Timeout|null = null;

    private temporaryPointTarget: ProjectObjectTypes|null = null;

    constructor(
        projectRepository: ProjectRepository,
        screenRenderEngine: ScreenRenderEngine,
        apiService: APIService
    ) {
        this.projectRepository = projectRepository;
        this.screenRenderEngine = screenRenderEngine;
        this.apiService = apiService;
    }

    refreshEditor(): void {
        this.setPlayback(this.autoPlaybackProgress)
    }

    isExporting(): boolean {
        return this.exporting;
    }

    isAutoPlayingEnabled(): boolean {
        return this.isAutoPlaying;
    }

    private lastFrameTimestamp: number = 0;
    progressPlayback(timestamp: number): void {
        if(this.lastFrameTimestamp === 0) {
            this.lastFrameTimestamp = timestamp;
            requestAnimationFrame(this.progressPlayback.bind(this))
        }
        if(!this.isAutoPlaying) return;
        if(!this.currentProject) throw new Error('No project loaded')
        this.autoPlaybackProgress += (timestamp - (this.lastFrameTimestamp??timestamp))/1000;
        this.autoPlaybackProgress=Math.min(this.autoPlaybackProgress, 60)

        for ( const obj of this.currentProject.getObjects() ) {
            obj.updateObjectWithValuesAtTime(this.autoPlaybackProgress);
        }

        if(this.autoPlaybackProgress>=60.0) {
            this.stopAutoPlayback();
        } else {
            this.callEditorUpdateCallbacks({
                previewTimestamp: this.autoPlaybackProgress
            })
        }

        this.lastFrameTimestamp = timestamp;
        requestAnimationFrame(this.progressPlayback.bind(this))
    }

    startAutoPlaybackFrom(timestamp: number): void {
        this.isAutoPlaying = true;
        this.autoPlaybackProgress = timestamp;
        this.lastFrameTimestamp = 0;
        requestAnimationFrame(this.progressPlayback.bind(this));
    }

    stopAutoPlayback(): void {
        this.isAutoPlaying = false;
        if(this.playbackUpdateInterval) {
            clearTimeout(this.playbackUpdateInterval)
        }
        this.callEditorUpdateCallbacks({
            isAutoplaying: false
        })
    }

    setPlayback(timestamp: number): void {
        if(!this.currentProject) throw new Error('No project loaded')
        // this.stopAutoPlayback();
        this.autoPlaybackProgress = timestamp;
        for ( const obj of this.currentProject.getObjects() ) {
            obj.updateObjectWithValuesAtTime(timestamp);
        }
        // this.screenRenderEngine.setProgress(timestamp);
    }

    exportToVideoAndGetURL(from: number = 0, to: number = 60000, bitrate: number = 3500): Promise<string> {
        const canvas = this.screenRenderEngine.getCanvas();
        if(!canvas) throw new Error('No canvas loaded')
        this.stopAutoPlayback();
        this.setPlayback(from * 1000);
        // this.setPlaybackRate(60);
        this.exporting = true;
        const recordedChunks: Blob[] = [];
        return new Promise((resolve) => {
            const stopExporting = () => {
                this.exporting = false;
                this.stopAutoPlayback();
            }
            const stream = canvas.captureStream(60);
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: "video/mp4;codecs:h.265",
                bitsPerSecond: bitrate
            })

            mediaRecorder.start(to - from);
            this.startAutoPlaybackFrom(from);
            mediaRecorder.ondataavailable = function(event) {
                recordedChunks.push(event.data);
                if (mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
            }

            mediaRecorder.onstop = function () {
                const blob = new Blob(recordedChunks, {type: "video/mp4;codecs:h.265" });
                const url = URL.createObjectURL(blob);
                stopExporting();
                resolve(url);
            }
        })
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
            for (const cp of selectedObject.getBoundaryPolygon()) {
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

            primitivesToRender.push({
                type: "Arc",
                center: selectedObject.getMassCenter().plus(selectedObject.getPosition()),
                radius: 6,
                strokeThickness: 0,
                fillColor: new Color(240, 10, 10, 1),
                angle: 2 * Math.PI
            })

            const controlPoints = selectedObject.getControlPointsCurrentTransformed();

            primitivesToRender.push({
                type: 'Shape',
                points: controlPoints,
                strokeThickness: 1,
                strokeColor: new Color(235, 180, 52, 0.4),
                dashedLine: [5, 5]
            })

            for ( let i = 0; i<controlPoints.length; i++ ) {
                primitivesToRender.push({
                    type: "Arc",
                    center: controlPoints[i],
                    radius: 4,
                    strokeThickness: 0,
                    fillColor: new Color(250, 12, 52, 1),
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

    public resolveObjectIdsFromV2AtTime(position: v2, time: number): number[] {
        if(!this.currentProject) throw new Error('No project loaded')
        const objects = this.currentProject.getObjects();
        const resolved = [];
        for ( const object of objects ) {
            // we assume these points are sorted by angle towards the middle (required by the Domain)
            if(object.positionInsideObjectBoundaryPolygonAtTime(position, time)) {
                resolved.push(object.getId())
            }
        }
        return resolved;
    }

    public resolveObjectIdsFromV2(position: v2): number[] {
        if(!this.currentProject) throw new Error('No project loaded')
        const objects = this.currentProject.getObjects();
        const resolved = [];
        for ( const object of objects ) {
            // we assume these points are sorted by angle towards the middle (required by the Domain)
            if(object.positionInsideObjectBoundaryPolygon(position)) {
                resolved.push(object.getId())
            }
        }
        return resolved;
    }

    private addObjectToRenderer(object: RenderableObject): void {
        this.screenRenderEngine.addRenderableObject(object);
    }

    async changeProject(project: Project): Promise<void> {
        this.currentProject = project
        this.setPlayback(0);
        this.resendProjectToRenderer();
        await this.apiService.connectSocket();
        await this.apiService.joinRoom({ projectId: project.getId() });
        this.apiService.handleProjectUpdated((response: { source: string, result: UpdateResult }) => {
            if (response.result.objectType === 'bezier') {
                const object = Bezier.fromProjectObjectResponse(response.result.newState);
                // console.log(object)
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
            } else if (response.result.objectType === 'keyframe') {
                if (!this.currentProject) throw new Error("I shouldn't be able to receive this update!");
                const keyframe = Keyframe.fromKeyframeResponse(response.result.newState);
                const targetObject = this.currentProject.getObjectById(keyframe.getProjectObjectId());
                if(!targetObject) throw new Error("What");
                switch (response.result.action) {
                    case "create":
                        targetObject.insertKeyframe(keyframe);
                        this.callEditorUpdateCallbacks({
                            selectedObjectId: this.selectedObjectId,
                        });
                        editorService.refreshEditor();
                        break;
                    case "update":
                        targetObject.updateKeyframe(keyframe);
                        this.callEditorUpdateCallbacks({
                            selectedObjectId: this.selectedObjectId,
                        });
                        editorService.refreshEditor();
                        break;
                    case "delete":
                        throw new Error('Keyframe delete handler not implemented')
                        break;
                }
            }
        })
    }

    private waitForTimeToSyncObject(object: ProjectObjectTypes, time: number): void {
        if (object.getId().toString() in this.syncTimeoutMap) {
            const timeout = this.syncTimeoutMap[object.getId().toString()]
            if(timeout) clearTimeout(timeout);
        }
        this.syncTimeoutMap[object.getId().toString()] = setTimeout(() => {
            this.updateObjectUniversal(object);
            this.syncTimeoutMap[object.getId().toString()] = null;
        }, time)
    }

    private waitForTimeToSendKeyframe(
        objectId: number,
        path: string,
        time: number,
        value: number,
        waitTime: number,
    ): void {
        const id: string = `${objectId}-${path}-${time}`;
        if (id in this.syncTimeoutMap) {
            const timeout = this.syncTimeoutMap[id]
            if(timeout) clearTimeout(timeout);
        }
        this.syncTimeoutMap[id] = setTimeout(() => {
            this.sendKeyframe(objectId, path, value, time);
            this.syncTimeoutMap[id] = null;
        }, waitTime)
    }

    insertKeyframe(objectId: number, path: string, value: number, time: number): void {
        if (!this.currentProject) throw new Error('No project loaded')
        this.waitForTimeToSendKeyframe(objectId, path, time, value, 200);
    }

    moveControlPointTo(objectId: number, controlPointIndex: number, position: v2) {
        if (!this.currentProject) throw new Error('No project loaded')
        const target = this.currentProject.getObjectById(objectId);
        if(!target) throw new Error(`Object with id ${objectId} does not exit`)
        target.updateControlPoint(controlPointIndex, position);
    }

    moveObjectTo(objectId: number, position: v2): void {
        if (!this.currentProject) throw new Error('No project loaded')
        const target = this.currentProject.getObjectById(objectId);
        if(!target) throw new Error(`Object with id ${objectId} does not exit`)
        target.setPosition(position);

        // make the server react after some time
        // this.waitForTimeToSyncObject(target, 200);
    }

    rotateObjectTo(objectId: number, rotation: number): void {
        if (!this.currentProject) throw new Error('No project loaded')
        const target = this.currentProject.getObjectById(objectId);
        if(!target) throw new Error(`Object with id ${objectId} does not exit`)
        target.setRotation(rotation);

        // make the server react after some time
        this.waitForTimeToSyncObject(target, 200);
    }

    scaleObjectTo(objectId: number, scale: number): void {
        if (!this.currentProject) throw new Error('No project loaded')
        const target = this.currentProject.getObjectById(objectId);
        if(!target) throw new Error(`Object with id ${objectId} does not exit`)
        target.setScale(scale);

        // make the server react after some time
        this.waitForTimeToSyncObject(target, 200);
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
        // console.log(object.getPosition().toString())
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

    handleAddControlPoint(object: ProjectObjectTypes, position: v2, type: number = 0): void {
        if(object.getType() === 'bezier') {
            (object as Bezier).addControlPoint(position, type);
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
                controlPoints: bezier.getControlPointsFullPayload(),
                position: bezier.getPosition().values,
                rotation: bezier.getRotation(),
                scale: bezier.getScale(),
            },
        })
    }

    async sendKeyframe(objectId: number, path: string, value: number, time: number): Promise<void> {
        if(!this.currentProject) throw new Error('No current project');
        await this.apiService.projectUpdate({
            projectId: this.currentProject.getId(),
            type: "create",
            data: {
                type: 'keyframe',
                objectId: objectId,
                propertyPath: path,
                time: time,
                value: value,
            },
        })
    }

    async updateKeyframe(keyframe: Keyframe): Promise<void> {
        if(!this.currentProject) throw new Error('No current project');
        await this.apiService.projectUpdate({
            projectId: this.currentProject.getId(),
            type: "update",
            data: {
                type: 'keyframe',
                id: keyframe.getId(),
                propertyPath: keyframe.getPropertyPath(),
                time: keyframe.getTime(),
                value: keyframe.getValue(),
            },
        })
    }

    async updateObjectUniversal(object: ProjectObjectTypes): Promise<void> {
        if(!this.currentProject) throw new Error('No current project');
        await this.apiService.projectUpdate({
            projectId: this.currentProject.getId(),
            type: "update",
            data: {
                type: object.getType(),
                id: object.getId(),
                name: object.getName(),
                position: object.getPosition().values,
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
                controlPoints: [[...startingPosition.values, 0]],
                position: [0,0],
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

    offEditorUpdate(callback: (editorContextData: Partial<EditorContextData>) => void): void {
        this.onEditorUpdateCallbacks = this.onEditorUpdateCallbacks.filter(
            cb => cb !== callback
        )
    }

    private callEditorUpdateCallbacks(editorContextData: Partial<EditorContextData>): void {
        for ( const cb of this.onEditorUpdateCallbacks ) {
            cb(editorContextData);
        }
    }

    handleAddTemporaryPoint(object: ProjectObjectTypes, position: v2, type: number): void {
        if (this.temporaryPointTarget) this.temporaryPointTarget.removeTemporaryPoint()
        this.temporaryPointTarget = object;
        object.setTemporaryPoint(position, type);
    }

    handleRemoveTemporaryPoint(): void {
        if (this.temporaryPointTarget) this.temporaryPointTarget.removeTemporaryPoint()
    }
}