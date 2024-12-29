export interface UpdateResult
{
    objectType: 'bezier' | 'project' | 'keyframe';
    action: 'create' | 'update' | 'delete',
    objectId: number;
    newState: object;
}

export interface ProjectUpdate {
    perform: () => Promise<UpdateResult>;
}