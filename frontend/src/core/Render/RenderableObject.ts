import ObjectInTime from "./ObjectInTime.ts";

export default interface RenderableObject {
    getObjectInTime(time: number): ObjectInTime
}