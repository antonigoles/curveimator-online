import v2 from "../Math/v2.ts";
import color from "../Math/color.ts";

export default interface Arc {
    center: v2;
    radius: number,
    angle: number
    strokeThickness: number,
    fillColor?: color,
    strokeColor?: color,
}