import {ProjectUpdate, UpdateResult} from "./ProjectUpdate.ts";
import ProjectObject from "../../models/projectObject.model.ts";

interface UpdateBezierPayload
{
    id: number;
    name?: string;
    controlPoints?: number[][];
    position?: number[];
    rotation?: number;
    scale?: number;
    color?: number[],
    strokeProgress?: number;
    strokeThickness?: number;
}

export default class UpdateBezier implements ProjectUpdate {
    id: number;
    name?: string;
    controlPoints?: number[][];
    position?: number[];
    rotation?: number;
    scale?: number;
    color?: number[];
    strokeProgress?: number;
    strokeThickness?: number;

    constructor(payload: UpdateBezierPayload) {
        this.id = payload.id;
        this.name = payload.name;
        this.controlPoints = payload.controlPoints;
        this.scale = payload.scale;
        this.position = payload.position;
        this.rotation = payload.rotation;
        this.color = payload.color;
        this.strokeProgress = payload.strokeProgress
        this.strokeThickness = payload.strokeThickness;
    }

    async perform(): Promise<UpdateResult> {
        const bezier = await ProjectObject.findByPk(this.id);
        if(!bezier) throw new Error('Bezier does not exist');
        bezier.name = this.name ?? bezier.name;
        bezier.serializedData = {
            controlPoints: this.controlPoints ?? bezier.serializedData.controlPoints,
            color: this.color ?? bezier.serializedData.color,
            strokeProgress: this.strokeProgress ?? bezier.serializedData.strokeProgress,
            strokeThickness: this.strokeThickness ?? bezier.serializedData.strokeThickness
        };
        bezier.scale = this.scale ?? bezier.scale;
        bezier.rotation = this.rotation ?? bezier.rotation;
        bezier.position = this.position ?? bezier.position;
        await bezier.save()
        return {
            objectType: 'bezier',
            objectId: bezier.id,
            action: 'update',
            newState: bezier.toJSON()
        };
    }
}