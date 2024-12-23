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
}

export default class CreateBezier implements ProjectUpdate {
    projectId: number;
    controlPoints: number[][];
    name: string;
    position?: number[];
    rotation?: number;
    scale?: number;

    constructor(payload: CreateBezierPayload) {
        this.projectId = payload.projectId;
        this.controlPoints = payload.controlPoints;
        this.name = payload.name;
        this.position = payload.position;
        this.rotation = payload.rotation;
        this.scale = payload.scale;
    }

    async perform(): Promise<UpdateResult> {
        const bezier = await ProjectObject.create({
            projectId: this.projectId,
            name: this.name,
            serializedData: this.controlPoints,
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