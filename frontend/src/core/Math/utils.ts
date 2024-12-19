export function uuid(): string {
    return crypto.randomUUID();
}

export function randomChoice<T>(list: T[]): T {
    return list[ Math.floor(Math.random() * list.length) ];
}