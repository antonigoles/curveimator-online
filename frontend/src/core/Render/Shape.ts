import v2 from "../Math/v2.tsx";
import color from "../Math/color.tsx";

export default interface Shape {
    points: v2[];
    strokeThickness: number,
    dashedLine?: number[];
    fillColor?: color,
    strokeColor?: color,
}