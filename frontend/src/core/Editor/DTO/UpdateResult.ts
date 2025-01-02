import ProjectResponse from "../../Network/Responses/ProjectResponse.ts";
import ProjectObjectResponse from "../../Network/Responses/ProjectObjectResponse.ts";
import KeyframeResponse from "../../Network/Responses/KeyframeResponse.ts";

export type UpdateResult =
{
    objectType: 'bezier';
    action: 'create' | 'update' | 'delete',
    objectId: number;
    newState: ProjectObjectResponse;
} |
{
    objectType: 'project';
    action: 'create' | 'update' | 'delete',
    objectId: number;
    newState: ProjectResponse;
} |
{
    objectType: 'keyframe';
    action: 'create' | 'update' | 'delete',
    objectId: number;
    newState: KeyframeResponse;
}