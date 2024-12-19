import v2 from "./v2.tsx";
import VectorBase from "./vector.tsx";

export default class v3 extends VectorBase<v3>
{
    constructor(x: number, y: number, z: number)
    {
        super([x,y,z]);
    }

    public perspectiveToV2(): v2 {
        return new v2(this.values[0] / this.values[2], this.values[1] / this.values[2]);
    }

    public cutToV2(): v2 {
        return new v2(this.values[0], this.values[1]);
    }
}