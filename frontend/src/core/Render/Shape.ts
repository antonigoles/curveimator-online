import v2 from "../Math/v2.ts";
import color from "../Math/color.ts";

export default interface Shape {
    points: v2[];
    strokeThickness: number,
    dashedLine?: number[];
    fillColor?: color,
    strokeColor?: color,
    strokeProgress?: number
}