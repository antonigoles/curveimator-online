export interface SessionServiceInterface
{
    keyExists(key: string): boolean;
    saveData(key: string, data: object): void;
    readData(key: string): object;
}