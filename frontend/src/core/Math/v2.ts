import VectorBase from "./vector.ts";

export default class v2 extends VectorBase<v2>
{
    constructor(x: number, y: number)
    {
        super([x,y]);
    }

    public static rotateBy(v: v2, angle: number): v2 {
        return new v2(
            v.x * Math.cos(angle) - v.y * Math.sin(angle),
            v.x * Math.sin(angle) + v.y * Math.cos(angle)
        );
    }
}