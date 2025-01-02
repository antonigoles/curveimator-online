import Shape from "./Shape.ts";
import Arc from "./Arc.ts";

export type Primitive = (({type: 'Arc'} & Arc) | ({type: 'Shape'} & Shape))

export type ObjectInTime = {
    primitivesToRender: Primitive[]
}