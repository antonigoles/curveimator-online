import {SessionServiceInterface} from "./SessionServiceInterface.tsx";

export class SessionService implements SessionServiceInterface
{
    keyExists(key: string): boolean {
        return !!localStorage.getItem(key);
    }

    saveData(key: string, data: object) {
        const objectSerialized: string = JSON.stringify(data);
        localStorage.setItem(key, objectSerialized);
    }

    readData(key: string): object
    {
        const objectSerialized: string|null = localStorage.getItem(key);
        if(!objectSerialized) {
            throw new Error(`${key} does not exist in localStorage`);
        }
        return JSON.parse(objectSerialized);
    }
}