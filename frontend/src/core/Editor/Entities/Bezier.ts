import ProjectObjectResponse from "../../Network/Responses/ProjectObjectResponse.ts";
import v2 from "../../Math/v2.ts";
import ProjectObject from "./ProjectObject.ts";
import Keyframe from "./Keyframe.ts";
import {ObjectInTime} from "../../Render/ObjectInTime.ts";
import Color from "../../Math/color.ts";
import KeyframeableProperty from "./KeyframeableProperty.ts";

export default class Bezier extends ProjectObject {
    protected controlPoints: v2[];
    protected strokeProgress: number;
    protected strokeThickness: number;
    protected strokeColor: Color;

    constructor(
        id: number,
        name: string,
        type: string,
        position: v2,
        rotation: number,
        scale: number,
        keyframes: Keyframe[],
        controlPoints: v2[],
        strokeProgress: number,
        strokeThickness: number,
        strokeColor: Color
    ) {
        super(id, name, type, position, rotation, scale, keyframes);
        this.controlPoints = controlPoints;
        this.strokeProgress = strokeProgress;
        this.strokeColor = strokeColor;
        this.strokeThickness = strokeThickness;
        this.initAdditionalKeyframeables();
    }

    private initAdditionalKeyframeables(): void
    {
        const colorGroup = new KeyframeableProperty('strokeColor', 'Color')
        const rProp = new KeyframeableProperty('r', 'R', colorGroup)
        rProp.assignParent(colorGroup);
        const gProp = new KeyframeableProperty('g', 'G', colorGroup)
        gProp.assignParent(colorGroup);
        const bProp = new KeyframeableProperty('b', 'B', colorGroup)
        bProp.assignParent(colorGroup);
        const aProp = new KeyframeableProperty('a', 'A', colorGroup)
        aProp.assignParent(colorGroup);

        this.keyframeableProperies = [
            ...this.keyframeableProperies,
            colorGroup,
            new KeyframeableProperty('strokeProgress', 'Stroke progress')
        ]
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
        if(!('controlPoints' in response.serializedData)) {
            throw new Error(`Serialized data for object ${response.id} does not match expected data type`)
        }

        if(!('strokeThickness' in response.serializedData)) {
            throw new Error(`Serialized data for object ${response.id} does not match expected data type`)
        }

        if(!('strokeProgress' in response.serializedData)) {
            throw new Error(`Serialized data for object ${response.id} does not match expected data type`)
        }

        if(!('color' in response.serializedData)) {
            throw new Error(`Serialized data for object ${response.id} does not match expected data type`)
        }

        if(!(response.serializedData.controlPoints instanceof Array)) {
            throw new Error(`Serialized data for object ${response.id} does not match expected data type`)
        }

        if(!(response.serializedData.color instanceof Array)) {
            throw new Error(`Serialized data for object ${response.id} does not match expected data type`)
        }

        const points: v2[] = response.serializedData.controlPoints.map(point => new v2(point[0], point[1]));
        const cArr = response.serializedData.color;
        const color: Color = new Color(cArr[0], cArr[1], cArr[2], cArr[3]);
        const strokeProgress: number = Number(response.serializedData.strokeProgress);
        const strokeThickness: number = Number(response.serializedData.strokeThickness);


        return new Bezier(
            response.id,
            response.name,
            response.type,
            new v2(response.position[0], response.position[1]),
            response.rotation,
            response.scale,
            response.keyframes.map( response => Keyframe.fromKeyframeResponse(response) ),
            points,
            strokeProgress,
            strokeThickness,
            color
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
                strokeThickness: this.strokeThickness,
                strokeColor: this.strokeColor
            }],
        };
    }

    getBoundaryPolygon(): v2[] {
        return this.curvePostTransform(12);
    }

    // this should be static over Bezier's entire lifetime
    // TODO: Think of a good massCenter prediction to make this value possibly dynamic
    getMassCenter(): v2 {
        return this.controlPoints[0];
    }
}