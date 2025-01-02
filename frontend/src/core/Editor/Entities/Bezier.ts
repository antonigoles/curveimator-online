import ProjectObjectResponse from "../../Network/Responses/ProjectObjectResponse.ts";
import v2 from "../../Math/v2.tsx";
import ProjectObject from "./ProjectObject.ts";
import Keyframe from "./Keyframe.ts";
import {ObjectInTime} from "../../Render/ObjectInTime.ts";
import Color from "../../Math/color.tsx";

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


        // Let's deprecate control point animations for now : )
        //
        // const controlPointPropGroup = new KeyframeableProperty('cp', 'Control Points');
        // for ( let i = 0; i<this.controlPoints.length; i++ ) {
        //     const controlPointProp = new KeyframeableProperty(`${i}`, );
        //     controlPointProp.assignParent(controlPointPropGroup)
        //     const xProp = new KeyframeableProperty('x', 'x', controlPointProp);
        //     xProp.assignParent(controlPointProp)
        //     const yProp = new KeyframeableProperty('y', 'y', controlPointProp);
        //     yProp.assignParent(controlPointProp)
        // }
        //
        // this.keyframeableProperies = [...this.keyframeableProperies, controlPointPropGroup]
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

    addControlPoint(point: v2): void {
        // hacky way of getting what i want
        let p = point.minus(this.getPosition());
        const center = this.getMassCenter();
        p = v2.rotateBy( p.minus(center), -this.getRotation() ).plus(center)
        this.controlPoints.push(p);
    }

    baseCurve(precision: number = 120): v2[] {
        if (this.controlPoints.length <= 0) return [];
        const result: v2[] = [];
        for ( let t = 0; t <= 1; t+= 1/precision ) {
            let pt = this.controlPoints[this.controlPoints.length-1];
            for ( let i = this.controlPoints.length-1; i>=0; i-- ) {
                pt = pt.scale((1 - t)).plus(this.controlPoints[i].scale(t));
            }
            result.push(pt);
        }
        return result;
    }

    curvePostTransform(precision: number = 120): v2[] {
        if (this.controlPoints.length <= 0) return [];
        const result: v2[] = this.baseCurve(precision);

        const massCenter = this.getMassCenter();
        return result.map(
            v => v2.rotateBy(v.minus(massCenter), this.getRotation()).plus(massCenter).plus(this.getPosition())
        );
    }

    getControlPoints(): v2[] {
        return this.controlPoints;
    }

    getObjectInTime(time: number): ObjectInTime {
        // TODO: Calculate Bezier
        // this.setRotation( time / 1000 )
        return {
            primitivesToRender: [{
                type: 'Shape',
                points: this.curvePostTransform(),
                strokeThickness: 4,
                strokeColor: new Color(255,255,255,1)
            }],
        };
    }

    getBoundaryPolygon(): v2[] {
        return this.curvePostTransform(12);
    }

    // this should be static over Bezier's entire lifetime
    getMassCenter(): v2 {
        return this.controlPoints[0];
    }
}