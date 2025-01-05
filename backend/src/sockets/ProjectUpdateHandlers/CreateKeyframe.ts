// deno-lint-ignore-file prefer-const
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
        let target = null;
        const keyframes = await Keyframe.findAll({
            where: {
                projectObjectId: this.objectId,
                propertyPath: this.propertyPath,
            }
        });

        const epsilon = 1/32; // should be enough
        for (const keyframe of keyframes) {
            if ( Math.abs(keyframe.time - this.time) < epsilon ) {
                // same keyframe
                target = keyframe;
                break;
            }
        }

        if (!target) {
            target = await Keyframe.create({
                projectObjectId: this.objectId,
                propertyPath: this.propertyPath,
                value: this.value,
                time: this.time,
            })
        } else {
            target.value = this.value;
            await target.save();
        }

        return {
            objectType: 'keyframe',
            objectId: target.id,
            action: 'create',
            newState: target.toJSON()
        };
    }
}