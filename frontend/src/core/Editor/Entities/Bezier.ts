import ProjectObjectResponse from "../../Network/Responses/ProjectObjectResponse.ts";
import v2 from "../../Math/v2.tsx";
import ProjectObject from "./ProjectObject.ts";
import Keyframe from "./Keyframe.ts";
import KeyframeableProperty from "./KeyframeableProperty.ts";

export default class Bezier extends ProjectObject {
    protected controlPoints: v2[];

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
        this.initAdditionalKeyframeables();
    }

    private initAdditionalKeyframeables(): void
    {
        const controlPointPropGroup = new KeyframeableProperty('cp', 'Control Points');
        for ( let i = 0; i<this.controlPoints.length; i++ ) {
            const controlPointProp = new KeyframeableProperty(`${i}`, );
            controlPointProp.assignParent(controlPointPropGroup)
            const xProp = new KeyframeableProperty('x', 'x', controlPointProp);
            xProp.assignParent(controlPointProp)
            const yProp = new KeyframeableProperty('y', 'y', controlPointProp);
            yProp.assignParent(controlPointProp)
        }

        this.keyframeableProperies = [...this.keyframeableProperies, controlPointPropGroup]
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