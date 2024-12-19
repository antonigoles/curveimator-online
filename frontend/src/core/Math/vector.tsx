export default class VectorBase<T extends VectorBase<T>>
{
    values: number[];

    constructor(values: number[])
    {
        this.values = [...values];
    }

    public get x() {
        return this.values[0];
    }

    public get y() {
        return this.values[1];
    }

    public get z() {
        if (this.values.length < 3)
            throw new Error(`Looking up z prop on a vector with size ${this.values.length}`);
        return this.values[2];
    }

    public set x(value: number) {
        this.values[0] = value;
    }

    public set y(value: number) {
        this.values[1] = value;
    }

    public set z(value: number) {
        if (this.values.length < 3)
            throw new Error(`Setting z prop on a vector with size ${this.values.length}`);
        this.values[2] = value;
    }

    length(): number {
        return Math.sqrt(this.values.reduce((acc, v) => acc + (v**2), 0));
    }

    minus(other: T): T {
        return (new VectorBase(this.values.map((v, i) => v - other.values[i]))) as T;
    }

    plus(other: T): T {
        return (new VectorBase(this.values.map((v, i) => v + other.values[i]))) as T;
    }

    scale(scalar: number): T {
        return (new VectorBase(this.values.map((v) => v * scalar))) as T;
    }

    toString(): string {
        return this.values.toString();
    }
}