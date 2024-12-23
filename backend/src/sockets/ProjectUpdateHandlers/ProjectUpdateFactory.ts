import CreateBezier from "./CreateBezier.ts";
import {ProjectUpdate} from "./ProjectUpdate.ts";
import CreateKeyframe from "./CreateKeyframe.ts";
import UpdateKeyframe from "./UpdateKeyframe.ts";
import UpdateBezier from "./UpdateBezier.ts";

interface CreatePayload {
    type: 'create'
    data: {
        type: 'bezier',
        controlPoints: number[][];
        name: string;
        position?: number[],
        scale?: number,
        rotation?: number,
    } | {
        type: 'keyframe',
        objectId: number,
        propertyPath: string,
        time: number,
        value: number,
    }
}

interface UpdatePayload {
    type: 'update'
    data: {
        type: 'bezier',
        id: number,
        controlPoints?: number[][];
        name?: string;
        position?: number[],
        scale?: number,
        rotation?: number,
    } | {
        type: 'keyframe',
        id: number,
        propertyPath?: string,
        time?: number,
        value?: number
    }
}

export type ProjectUpdatePayload<T> = T &
{
    projectId: number;
}

export default class ProjectUpdateFactory {
    private static createActionFromPayload(
        payload: ProjectUpdatePayload<CreatePayload>
    ): ProjectUpdate {
        if ( payload.data.type === 'bezier' ) {
            return new CreateBezier({
                projectId: payload.projectId,
                controlPoints: payload.data.controlPoints,
                name: payload.data.name
            });
        }

        if ( payload.data.type === 'keyframe' ) {
            return new CreateKeyframe({
                objectId: payload.data.objectId,
                time: payload.data.time,
                value: payload.data.value,
                propertyPath: payload.data.propertyPath
            });
        }

        throw new Error('Incorrect payload passed to the factory')
    }

    private static updateActionFromPayload(
        payload: ProjectUpdatePayload<UpdatePayload>
    ): ProjectUpdate {
        if ( payload.data.type === 'bezier' ) {
            return new UpdateBezier({
                id: payload.data.id,
                controlPoints: payload.data.controlPoints,
                name: payload.data.name
            });
        }

        if ( payload.data.type === 'keyframe' ) {
            return new UpdateKeyframe({
                id: payload.data.id,
                time: payload.data.time,
                value: payload.data.value,
                propertyPath: payload.data.propertyPath
            });
        }

        throw new Error('Incorrect payload passed to the factory')
    }

    public static fromPayload(
        payload: ProjectUpdatePayload<UpdatePayload|CreatePayload>
    ): ProjectUpdate {
        // Assume data has been verified
        if (payload.type === 'create') return this.createActionFromPayload(payload);
        if (payload.type === 'update') return this.updateActionFromPayload(payload);
        throw new Error('Incorrect payload passed to the factory')
    }
}