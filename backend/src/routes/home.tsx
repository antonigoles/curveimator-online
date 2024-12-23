import express from "npm:express";
import Route from "./Route.ts";

function handleRequest(req: express.Request, res: express.Response) {
    res.status(200).json({ "status": "okie dokie" })
}

export default Route.GET('/', handleRequest);