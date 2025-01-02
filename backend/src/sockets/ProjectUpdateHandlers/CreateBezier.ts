import {ProjectUpdate, UpdateResult} from "./ProjectUpdate.ts";
import ProjectObject from "../../models/projectObject.model.ts";

interface CreateBezierPayload
{
    projectId: number;
    controlPoints: number[][];
    name: string;
    position?: number[];
    rotation?: number;
    scale?: number;
    color?: number[];
    strokeProgress?: number;
    strokeThickness?: number;
}

export default class CreateBezier implements ProjectUpdate {
    projectId: number;
    controlPoints: number[][];
    name: string;
    position?: number[];
    rotation?: number;
    scale?: number;
    color?: number[];
    strokeProgress?: number;
    strokeThickness?: number;

    constructor(payload: CreateBezierPayload) {
        this.projectId = payload.projectId;
        this.controlPoints = payload.controlPoints;
        this.name = payload.name;
        this.position = payload.position;
        this.rotation = payload.rotation;
        this.scale = payload.scale;
        this.color = payload.color;
        this.strokeProgress = payload.strokeProgress
        this.strokeThickness = payload.strokeThickness;
    }

    async perform(): Promise<UpdateResult> {
        const bezier = await ProjectObject.create({
            projectId: this.projectId,
            name: this.name,
            type: 'bezier',
            serializedData: {
                controlPoints: this.controlPoints,
                color: this.color ?? [255, 255, 255, 1],
                strokeProgress: this.strokeProgress ?? 1,
                strokeThickness: this.strokeThickness ?? 4
            },
            position: this.position ?? [0,0],
            scale: this.scale ?? 1.0,
            rotation: this.rotation ?? 0.0,
        })

        return {
            objectType: 'bezier',
            objectId: bezier.id,
            action: 'create',
            newState: bezier.toJSON()
        };
    }
}