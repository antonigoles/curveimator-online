import {ProjectUpdate, UpdateResult} from "./ProjectUpdate.ts";
import Keyframe from "../../models/keyframe.model.ts";

interface DeleteObjectPayload
{
    objectId: number;
}

export default class DeleteKeyframe implements ProjectUpdate {
    objectId: number;

    constructor(payload: DeleteObjectPayload) {
        this.objectId = payload.objectId;
    }

    async perform(): Promise<UpdateResult> {
        const keyframe = await Keyframe.findByPk(this.objectId)
        if(!keyframe) throw new Error('Not found');
        await keyframe.destroy();

        return {
            objectType: 'keyframe',
            objectId: keyframe.id,
            action: 'delete',
            newState: keyframe.toJSON()
        };
    }
}