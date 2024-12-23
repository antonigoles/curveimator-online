import express from "npm:express";

type RouteHandler = (req: express.Request, res: express.Response) => void

export default class Route {
    method: "POST" | "GET";
    path: string;
    handler: RouteHandler;

    constructor(method: "POST" | "GET", path: string, handler: RouteHandler) {
        this.method = method;
        this.path = path;
        this.handler = function(req: express.Request, res: express.Response) {
            try {
                handler(req, res);
            } catch (err: any) {
                res.status(500).json({ "error": "Internal Error!", ...err})
            }
        };
    }

    static POST(path: string, handler: RouteHandler): Route {
        return new Route("POST", path, handler);
    }

    static GET(path: string, handler: RouteHandler): Route {
        return new Route("GET", path, handler);
    }
}
