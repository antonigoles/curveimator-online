import {ProjectUpdate, UpdateResult} from "./ProjectUpdate.ts";
import ProjectObject from "../../models/projectObject.model.ts";

interface DeleteObjectPayload
{
    objectId: number;
}

export default class DeleteObject implements ProjectUpdate {
    objectId: number;

    constructor(payload: DeleteObjectPayload) {
        this.objectId = payload.objectId;
    }

    async perform(): Promise<UpdateResult> {
        const object = await ProjectObject.findByPk(this.objectId)
        if(!object) throw new Error('Not found');
        await object.destroy();

        return {
            objectType: object.type,
            objectId: object.id,
            action: 'delete',
            newState: object.toJSON()
        };
    }
}