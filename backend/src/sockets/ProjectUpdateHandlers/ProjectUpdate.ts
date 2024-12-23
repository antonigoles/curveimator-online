export interface UpdateResult
{
    objectType: 'bezier' | 'project' | 'keyframe';
    action: 'create' | 'update',
    objectId: number;
    newState: object;
}

export interface ProjectUpdate {
    perform: () => Promise<UpdateResult>;
}