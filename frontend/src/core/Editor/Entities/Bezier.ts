import ProjectObjectResponse from "../../Network/Responses/ProjectObjectResponse.ts";
import v2 from "../../Math/v2.tsx";
import ProjectObject from "./ProjectObject.ts";
import Keyframe from "./Keyframe.ts";


export default class Bezier extends ProjectObject {
    controlPoints: v2[];

    constructor(
        id: number,
        name: string,
        type: string,
        position: v2,
        rotation: number,
        scale: number,
        keyframes: Keyframe[],
        controlPoints: v2[],
    ) {
        super(id, name, type, position, rotation, scale, keyframes);
        this.controlPoints = controlPoints;
    }

    static fromProjectObjectResponse(response: ProjectObjectResponse): Bezier {
        if(!(response.serializedData instanceof Array)) {
            throw new Error(`Serialized data for object ${response.id} does not match expected data type`)
        }
        const points: v2[] = response.serializedData.map(point => new v2(point[0], point[1]));

        return new Bezier(
            response.id,
            response.name,
            response.type,
            new v2(response.position[0], response.position[1]),
            response.rotation,
            response.scale,
            response.keyframes.map( response => Keyframe.fromKeyframeResponse(response) ),
            points
        );
    }
}