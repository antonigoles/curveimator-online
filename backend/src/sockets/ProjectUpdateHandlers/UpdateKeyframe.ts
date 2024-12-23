import {ProjectUpdate, UpdateResult} from "./ProjectUpdate.ts";
import Keyframe from "../../models/keyframe.model.ts";

interface UpdateKeyframePayload
{
    id: number;
    time?: number;
    value?: number;
    propertyPath?: string;
}

export default class UpdateKeyframe implements ProjectUpdate {
    id: number;
    time?: number;
    value?: number;
    propertyPath?: string;

    constructor(payload: UpdateKeyframePayload) {
        this.id = payload.id;
        this.time = payload.time;
        this.value = payload.value;
        this.propertyPath = payload.propertyPath;
    }

    async perform(): Promise<UpdateResult> {
        const keyframe = await Keyframe.findByPk(this.id);
        if(!keyframe) throw new Error('Keyframe does not exist');
        keyframe.time = this.time ?? keyframe.time;
        keyframe.value = this.value ?? keyframe.value;
        keyframe.propertyPath = this.propertyPath ?? keyframe.propertyPath;
        await keyframe.save()
        return {
            objectType: 'keyframe',
            objectId: keyframe.id,
            action: 'update',
            newState: keyframe.toJSON()
        };
    }
}