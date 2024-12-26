import Keyframe from './Keyframe.ts'
import v2 from "../../Math/v2.tsx";

export default abstract class ProjectObject {
    private id: number;
    private name: string;
    private type: string;
    private position: v2;
    private rotation: number;
    private scale: number;
    private keyframes: Keyframe[];

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
    }

    getId(): number {
        return this.id;
    }

    getName(): string {
        return this.name;
    }
}