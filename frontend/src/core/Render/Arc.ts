import v2 from "../Math/v2.tsx";
import color from "../Math/color.tsx";

export default interface Arc {
    center: v2;
    radius: number,
    angle: number
    strokeThickness: number,
    fillColor?: color,
    strokeColor?: color,
}