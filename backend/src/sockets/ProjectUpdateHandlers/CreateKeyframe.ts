import {ProjectUpdate, UpdateResult} from "./ProjectUpdate.ts";
import Keyframe from "../../models/keyframe.model.ts";

interface CreateKeyframePayload
{
    objectId: number;
    time: number;
    value: number;
    propertyPath: string;
}

export default class CreateKeyframe implements ProjectUpdate {
    objectId: number;
    time: number;
    value: number;
    propertyPath: string;

    constructor(payload: CreateKeyframePayload) {
        this.objectId = payload.objectId;
        this.time = payload.time;
        this.value = payload.value;
        this.propertyPath = payload.propertyPath;
    }

    async perform(): Promise<UpdateResult> {
        const keyframe = await Keyframe.create({
            projectObjectId: this.objectId,
            time: this.time,
            value: this.value,
            propertyPath: this.propertyPath
        })

        return {
            objectType: 'keyframe',
            objectId: keyframe.id,
            action: 'create',
            newState: keyframe.toJSON()
        };
    }
}