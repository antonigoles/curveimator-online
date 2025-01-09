import ProjectObjectResponse from "../../Network/Responses/ProjectObjectResponse.ts";
import v2 from "../../Math/v2.ts";
import ProjectObject from "./ProjectObject.ts";
import Keyframe from "./Keyframe.ts";
import {ObjectInTime} from "../../Render/ObjectInTime.ts";
import Color from "../../Math/color.ts";
import KeyframeableProperty from "./KeyframeableProperty.ts";

export default class Bezier extends ProjectObject {
    protected controlPoints: v2[];
    protected controlPointType: number[];
    protected strokeProgress: number;
    protected strokeThickness: number;
    protected strokeColor: Color;

    protected temporaryControlPoint: { position: v2, type: number }|null = null;

    constructor(
        id: number,
        name: string,
        type: string,
        position: v2,
        rotation: number,
        scale: number,
        keyframes: Keyframe[],
        controlPoints: v2[],
        controlPointType: number[],
        strokeProgress: number,
        strokeThickness: number,
        strokeColor: Color
    ) {
        super(id, name, type, position, rotation, scale, keyframes);
        this.controlPoints = controlPoints;
        this.controlPointType = controlPointType;
        this.strokeProgress = strokeProgress;
        this.strokeColor = strokeColor;
        this.strokeThickness = strokeThickness;
        this.rebuildKeyframes();
    }

    updateDataWith(object: Bezier)
    {
        this.id = object.id;
        this.name = object.name;
        this.type = object.type;
        this.scale = object.scale;
        this.rotation = object.rotation;
        this.position = object.position;
        this.controlPoints = object.controlPoints;
        this.strokeProgress = object.strokeProgress;
        this.strokeThickness = object.strokeThickness;
        this.strokeColor = object.strokeColor
    }

    protected rebuildKeyframes(): void
    {
        this.keyframeableProperies = [
            new KeyframeableProperty('x'),
            new KeyframeableProperty('y'),
            new KeyframeableProperty('s','scale'),
            new KeyframeableProperty('r', 'rotation'),
        ]

        const colorGroup = new KeyframeableProperty('color', 'Color')
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
            new KeyframeableProperty('sp', 'Stroke progress'),
            new KeyframeableProperty('st', 'Stroke thickness')
        ]

        this.keyframeMap = {};
        for (const keyframe of this.keyframes) {
            this.keyframeMap[keyframe.getPropertyPath()] = [
                ...(this.keyframeMap[keyframe.getPropertyPath()] ?? []),
                keyframe
            ];
        }

        for (const path in this.keyframeMap) {
            this.keyframeMap[path] = this.keyframeMap[path].sort(
                (a,b) => a.getTime() - b.getTime()
            )
        }

        // Let's deprecate control point animations for now : )
        //
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
        const controlPointType: number[] = response.serializedData.controlPoints.map(point => point[2] ?? 0);
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
            controlPointType,
            strokeProgress,
            strokeThickness,
            color
        );
    }

    addControlPoint(point: v2, type: number = 0): void {
        // hacky way of getting what i want
        let p = point.minus(this.getPosition());
        const center = this.getMassCenter();
        p = v2.rotateBy( p.minus(center), -this.getRotation() ).plus(center)
        this.controlPoints.push(p);
        this.controlPointType.push(type);
    }

    baseCurve(precision: number = 120): v2[] {
        if (this.controlPoints.length <= 0) return [];
        const components: v2[][] = [[]];
        for ( let i = 0; i<this.controlPoints.length; i++ ) {
            if(this.controlPointType[i] === 1) {
                components.push([this.controlPoints[i]]);
            } else {
                components[components.length - 1].push(this.controlPoints[i]);
            }
        }
        if (this.temporaryControlPoint) {
            if (this.temporaryControlPoint.type === 1) {
                components.push([this.temporaryControlPoint.position])

            } else {
                components[components.length - 1].push(this.temporaryControlPoint.position)
            }
        }
        if (components[components.length - 1].length === 0) components.pop()
        // if(components.length > 1) console.log(components)

        const result: v2[] = [];
        for ( const comp of components ) {
            let temp = [];
            for ( let t = 0; t <= 1; t += 1/precision ) {
                let pt = comp[comp.length-1];
                for ( let i = comp.length-1; i>=0; i-- ) {
                    pt = pt.scale((1 - t)).plus(comp[i].scale(t));
                }
                temp.push(pt);
            }
            temp = temp.reverse();
            result.push(...temp);
        }
        return result;
    }

    curvePostTransform(
        precision: number = 120,
        position: v2|null = null,
        rotation: number|null = null,
        scale: number|null = null,
    ): v2[] {
        if (this.controlPoints.length <= 0) return [];
        const result: v2[] = this.baseCurve(precision);

        if(position === null) position = this.getPosition()
        if(rotation === null) rotation = this.getRotation()
        if(scale === null) scale = this.getScale()

        const massCenter = this.getMassCenter();
        return result.map(
            v => v2.rotateBy(v.minus(massCenter), rotation).scale(scale).plus(massCenter).plus(position)
        );
    }

    getControlPoints(): v2[] {
        return this.controlPoints;
    }

    getControlPointTypes(): number[] {
        return this.controlPointType;
    }

    getControlPointsCurrentTransformed(): v2[] {
        const mc = this.getMassCenter();
        return this.controlPoints.map(
            p => v2.rotateBy(p.minus(mc), this.getRotation())
                .scale(this.getScale())
                .plus(mc)
                .plus(this.getPosition())
        );
    }

    resolveDefaultValueFromPath(path: string): number {
        const toGetterMap: {[key: string]: number} = {
            'x': this.getPosition().x,
            'y': this.getPosition().y,
            's': this.getScale(),
            'r': this.getRotation(),
            'sp': this.strokeProgress,
            'st': this.strokeThickness,
            'color.r': this.strokeColor.r,
            'color.g': this.strokeColor.g,
            'color.b': this.strokeColor.b,
            'color.a': this.strokeColor.a,
        }

        for (let i = 0; i<this.controlPoints.length; i++) {
            toGetterMap[`cp.${i}.x`] = this.controlPoints[i].x;
            toGetterMap[`cp.${i}.y`] = this.controlPoints[i].y;
        }

        if (path in toGetterMap) return toGetterMap[path];
        return 0;
        // throw new Error(`Property ${path} not found`)
    }

    getValueFromProperyPathAndTime(path: string, time: number): number|null {
        if (!(path in this.keyframeMap)) return null;
        // should be sorted
        const keyframes = this.keyframeMap[path];
        let leftFrame: Keyframe|null = null;

        const epsilon = 1 / 32;

        for ( let i = 0; i < keyframes.length; i++ ) {
            if(keyframes[i].getTime() <= time - epsilon) leftFrame = keyframes[i];
        }
        let rightFrame: Keyframe|null = null;
        for ( let i = keyframes.length-1; i >= 0; i-- ) {
            if(keyframes[i].getTime() + epsilon >= time) rightFrame = keyframes[i];
        }
        if(leftFrame && !rightFrame) {
            return leftFrame.getValue();
        }

        if(!leftFrame && rightFrame) {
            return rightFrame.getValue();
        }

        if(!leftFrame && !rightFrame) {
            // resolve default value
            return null;
        }

        // not sure why LTS says it can be null, it will never be null
        const lt = leftFrame?.getTime() ?? 0;
        const rt = rightFrame?.getTime() ?? 1;
        const lv = leftFrame?.getValue() ?? 1;
        const rv = rightFrame?.getValue() ?? 1;
        return lv + (time-lt)/(rt-lt) * (rv-lv)
    }

    getValueFromProperyPathAndTimeOrResolveToDefault(path: string, time: number): number {
        if (this.forceLocalPosition) return this.resolveDefaultValueFromPath(path);
        return this.getValueFromProperyPathAndTime(path, time) ?? this.resolveDefaultValueFromPath(path)
    }

    updateObjectWithValuesAtTime(time: number): void {
        this.position = new v2(
            this.getValueFromProperyPathAndTimeOrResolveToDefault('x', time),
            this.getValueFromProperyPathAndTimeOrResolveToDefault('y', time)
        )
        this.rotation = this.getValueFromProperyPathAndTimeOrResolveToDefault('r', time);
        this.scale = this.getValueFromProperyPathAndTimeOrResolveToDefault('s', time);
        this.strokeColor = new Color(
            this.getValueFromProperyPathAndTimeOrResolveToDefault('color.r', time),
            this.getValueFromProperyPathAndTimeOrResolveToDefault('color.g', time),
            this.getValueFromProperyPathAndTimeOrResolveToDefault('color.b', time),
            this.getValueFromProperyPathAndTimeOrResolveToDefault('color.a', time),
        )
        this.strokeProgress = this.getValueFromProperyPathAndTimeOrResolveToDefault('sp', time);
        this.strokeThickness = this.getValueFromProperyPathAndTimeOrResolveToDefault('st', time);
        for (let i = 0; i < this.controlPoints.length; i++) {
            this.controlPoints[i].x = this.getValueFromProperyPathAndTimeOrResolveToDefault(`cp.${i}.x`, time);
            this.controlPoints[i].y = this.getValueFromProperyPathAndTimeOrResolveToDefault(`cp.${i}.y`, time);
        }
    }

    // TODO: Refactor this
    getObjectInTime(time: number): ObjectInTime {
        // console.log(time)
        // TODO: If we have any keyframes for any prop, we should overwrite the prop with keys
        // for the sake of rendering process

        const resolvedPosition = new v2(
            this.getValueFromProperyPathAndTimeOrResolveToDefault('x', time),
            this.getValueFromProperyPathAndTimeOrResolveToDefault('y', time)
        )
        const resolvedRotation = this.getValueFromProperyPathAndTimeOrResolveToDefault('r', time);
        const resolvedScale = this.getValueFromProperyPathAndTimeOrResolveToDefault('s', time);
        const resolvedColor = new Color(
            this.getValueFromProperyPathAndTimeOrResolveToDefault('color.r', time),
            this.getValueFromProperyPathAndTimeOrResolveToDefault('color.g', time),
            this.getValueFromProperyPathAndTimeOrResolveToDefault('color.b', time),
            this.getValueFromProperyPathAndTimeOrResolveToDefault('color.a', time),
        )
        const resolvedStrokeProgress = this.getValueFromProperyPathAndTimeOrResolveToDefault('sp', time);
        const resolvedStrokeThickness = this.getValueFromProperyPathAndTimeOrResolveToDefault('st', time);

        // this.setRotation( time / 1000 )
        return {
            primitivesToRender: [{
                type: 'Shape',
                points: this.curvePostTransform(
                    120, resolvedPosition, resolvedRotation, resolvedScale
                ),
                strokeThickness: resolvedStrokeThickness,
                strokeColor: resolvedColor,
                strokeProgress: resolvedStrokeProgress
            }],
        };
    }

    getObjectInCurrentState(): ObjectInTime {
        return {
            primitivesToRender: [{
                type: 'Shape',
                points: this.curvePostTransform(120),
                strokeThickness: this.strokeThickness,
                strokeColor: this.strokeColor,
                strokeProgress: this.strokeProgress
            }],
        };
    }

    getBoundaryPolygonAtTime(time: number): v2[] {
        const resolvedPosition = new v2(
            this.getValueFromProperyPathAndTimeOrResolveToDefault('x', time),
            this.getValueFromProperyPathAndTimeOrResolveToDefault('y', time)
        )
        const resolvedRotation = this.getValueFromProperyPathAndTimeOrResolveToDefault('r', time);
        const resolvedScale = this.getValueFromProperyPathAndTimeOrResolveToDefault('s', time);

        return this.curvePostTransform(12, resolvedPosition, resolvedRotation, resolvedScale);
    };


    getBoundaryPolygon(): v2[] {
        return this.curvePostTransform(12);
    }

    // this should be static over Bezier's entire lifetime
    // TODO: Think of a good massCenter prediction to make this value possibly dynamic
    getMassCenter(): v2 {
        return this.controlPoints[0];
    }

    getPositionAtTime(time: number): v2 {
        return new v2(
            this.getValueFromProperyPathAndTimeOrResolveToDefault('x', time),
            this.getValueFromProperyPathAndTimeOrResolveToDefault('y', time)
        )
    };

    updateControlPoint(index: number, position: v2, type?: number): void {
        if (!this.controlPoints[index]) throw new Error("Out of index")
        this.controlPoints[index] = position;
        this.controlPointType[index] = type === undefined ? this.controlPointType[index] : type;
    }

    updateKeyframe(keyframe: Keyframe): void {
        const frameIndex = this.keyframes.findIndex(e => e.getId() === keyframe.getId());
        if(frameIndex === -1) {
            // this frame does not exist yet
            this.insertKeyframe(keyframe);
            return;
        }
        this.keyframes[frameIndex].setTime(keyframe.getTime());
        this.keyframes[frameIndex].setValue(keyframe.getValue());
        this.rebuildKeyframes();
    }

    insertKeyframe(keyframe: Keyframe) {
        // this check should also be done on the server
        if (keyframe.getPropertyPath() in this.keyframeMap) {
            // 1. check if we already have a keyframe at this timestamp
            const keyframes = this.keyframeMap[keyframe.getPropertyPath()];
            let foundKeyframe: Keyframe|null = null
            for ( const localKeyframe of keyframes ) {
                // lets hope JS does this by reference!
                const epsilon = 1 / 32;
                if ( Math.abs(localKeyframe.getTime() - keyframe.getTime()) < epsilon ) {
                    // merge 2 these keyframes
                    foundKeyframe = localKeyframe;
                }
            }
            if (foundKeyframe) {
                foundKeyframe.setValue(keyframe.getValue())
                return;
            }
        }

        this.keyframes.push(keyframe);
        this.rebuildKeyframes();
    }

    getControlPointsFullPayload(): number[][] {
        const result = [];
        for ( let i = 0; i<this.controlPoints.length; i++ ) {
            result.push([...(this.controlPoints[i].values), this.controlPointType[i]]);
        }
        return result;
    }

    setTemporaryPoint(position: v2, type: number): void {
        this.temporaryControlPoint = {
            position, type
        }
    }

    removeTemporaryPoint(): void {
        this.temporaryControlPoint = null;
    }
}