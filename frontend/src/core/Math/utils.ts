import v2 from "./v2.ts";

export function uuid(): string {
    return crypto.randomUUID();
}

export function randomChoice<T>(list: T[]): T {
    return list[ Math.floor(Math.random() * list.length) ];
}

export function angle(u: v2, v: v2) {
    return Math.atan2(u.x*v.y - u.y * v.x, u.x * v.x + u.y * v.y);
}

export function clamp(min: number, max: number, value: number): number {
    return Math.min(max, Math.max(value, min));
}