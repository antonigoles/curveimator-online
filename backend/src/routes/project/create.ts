import express from "express";
import Route from "../Route";

function handleRequest(req: express.Request, res: express.Response) {
    res.send(":)")
}

export default Route.POST('/project/create', handleRequest);