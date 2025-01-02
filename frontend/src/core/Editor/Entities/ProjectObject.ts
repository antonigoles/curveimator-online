import Keyframe from './Keyframe.ts'
import v2 from "../../Math/v2.tsx";
import KeyframeableProperty from "./KeyframeableProperty.ts";
import RenderableObject from "../../Render/RenderableObject.ts";
import {ObjectInTime} from "../../Render/ObjectInTime.ts";
import {angle} from "../../Math/utils.ts";

export default abstract class ProjectObject implements RenderableObject {
    protected id: number;
    protected name: string;
    protected type: string;
    protected position: v2;
    protected rotation: number;
    protected scale: number;
    protected keyframes: Keyframe[];
    protected keyframeMap: {[key: string]: Keyframe[]} = {}; // keyframes by id
    protected keyframeableProperyMap: {[key: string]: KeyframeableProperty} = {}; // keyframeables by path
    protected keyframeableProperies: KeyframeableProperty[] = []; // keyframeable list

    constructor(
        id: number,
        name: string,
        type: string,
        position: v2,
        rotation: number,
        scale: number,
        keyframes: Keyframe[],
    ) {
        this.name = name;
        this.id = id;
        this.type = type;
        this.position = position
        this.rotation = rotation
        this.scale = scale
        this.keyframes = keyframes;
        this.initKeyframeables();
        this.rebuildKeyframeMap();
    }

    private rebuildKeyframeMap(): void
    {
        for (const keyframe of this.keyframes) {
            this.keyframeMap[keyframe.getPropertyPath()] = [
                ...(this.keyframeMap[keyframe.getPropertyPath()] ?? []),
                keyframe
            ];
        }
    }

    private initKeyframeables(): void
    {
        this.keyframeableProperies = [
            ...this.keyframeableProperies,
            new KeyframeableProperty('x'),
            new KeyframeableProperty('y'),
            new KeyframeableProperty('scale'),
            new KeyframeableProperty('rotation'),
        ]

        // TODO: Remake it
        // for (const keyframeable of this.keyframeableProperies) {
        //     this.keyframeableProperyMap[keyframeable.getFullPropertyPath()] = keyframeable;
        // }
    }

    getId(): number {
        return this.id;
    }

    getName(): string {
        return this.name;
    }

    setName(name: string): void {
        this.name = name;
    }

    getKeyframableProperties(): KeyframeableProperty[] {
        return this.keyframeableProperies;
    }

    getFramesForPath(path: string): Keyframe[] {
        return this.keyframeMap[path] ?? [];
    }

    getType(): string {
        return this.type;
    }

    getPosition(): v2 {
        return this.position;
    }

    setPosition(position: v2) {
        this.position = position;
    }

    getScale(): number {
        return this.scale;
    }

    setScale(scale: number) {
        this.scale = scale;
    }

    getRotation(): number {
        return this.rotation;
    }

    setRotation(rotation: number) {
        this.rotation = rotation;
    }

    updateDataWith(object: ProjectObject) {
        Object.assign(this, object);
    }

    abstract getBoundaryPolygon(): v2[];

    abstract getObjectInTime(time: number): ObjectInTime;

    positionInsideObjectBoundaryPolygon(position: v2): boolean {
        const polygon = this.getBoundaryPolygon();
        let angleSum = 0;
        for ( let i = 0; i<polygon.length; i++ ) {
            angleSum += Math.abs(angle(
                polygon[i].minus(position),
                polygon[(i + 1) % polygon.length].minus(position),
            ))
        }
        return angleSum > 1.8 * Math.PI;
    }

    positionInsideObjectBoundarySquare(position: v2, padding: number = 12): boolean {
        const polygon = this.getBoundaryPolygon();
        const maxX = Math.max(...(polygon.map(v => v.x))) + padding;
        const maxY = Math.max(...(polygon.map(v => v.y))) + padding;
        const minX = Math.min(...(polygon.map(v => v.x))) - padding;
        const minY = Math.min(...(polygon.map(v => v.y))) - padding;
        return position.x > minX && position.x < maxX && position.y > minY && position.y < maxY;
    }

    abstract getMassCenter(): v2;
}