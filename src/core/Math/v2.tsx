import VectorBase from "./vector.tsx";

export default class v2 extends VectorBase<v2>
{
    constructor(x: number, y: number)
    {
        super([x,y]);
    }

    public rotateBy(angle: number): v2 {
        return new v2(
            this.x * Math.cos(angle) - this.y * Math.sin(angle),
            this.x * Math.sin(angle) + this.y * Math.cos(angle)
        );
    }
}