import express from "npm:express";
import Route from "../Route.ts";
import Project from "../../models/project.model.ts";
import validateRequest from "../../utils/validateRequest.ts";
import env from "../../env.ts";

async function handleRequest(req: express.Request, res: express.Response) {
    const validation = validateRequest([
        req?.body?.name?.length > 3
    ]);
    if (!validation) {
        res.status(400).json({ "error": "Request body error" });
    }
    try {
        const project = await Project.create({
            name: req.body.name,
        });

        res.status(200).json(project.toJSON());
    } catch(err: any) {
        res.status(400).json({"Error": env.DEV_MODE ? err.message : "Internal" });
    }
}

export default Route.POST('/project/create', handleRequest);