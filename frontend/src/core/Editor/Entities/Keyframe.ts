import KeyframeResponse from "../../Network/Responses/KeyframeResponse.ts";

export default class Keyframe {
    private id: number;
    private projectObjectId: number;
    private propertyPath: string;
    private time: number;
    private value: number;

    constructor(
        id: number,
        projectObjectId: number,
        propertyPath: string,
        time: number,
        value: number
    ) {
        this.id = id;
        this.projectObjectId = projectObjectId;
        this.propertyPath = propertyPath;
        this.time = time;
        this.value = value;
    }

    public getProjectObjectId(): number {
        return this.projectObjectId;
    }

    public getId(): number {
        return this.id;
    }

    public getPropertyPath(): string {
        return this.propertyPath;
    }

    public getTime(): number {
        return this.time;
    }

    public getValue(): number {
        return this.value;
    }

    public setValue(value: number) {
        this.value = value;
    }

    static fromKeyframeResponse(response: KeyframeResponse) {
        return new Keyframe(response.id, response.projectObjectId, response.propertyPath, response.time, response.value)
    }
}