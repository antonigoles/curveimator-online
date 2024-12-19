import express from "express";

export default class Route {
    method: string;
    path: string;
    handler: (req: express.Request, res: express.Response) => void;

    constructor(
        method: string,
        path: string,
        handler: (req: express.Request, res: express.Response) => void
    ) {
        this.method = method;
        this.path = path;
        this.handler = handler;
    }

    static POST(
        path: string,
        handler: (req: express.Request, res: express.Response) => void
    ) {
        return new Route("POST", path, handler);
    }

    static GET(
        path: string,
        handler: (req: express.Request, res: express.Response) => void
    ) {
        return new Route("GET", path, handler);
    }
}
