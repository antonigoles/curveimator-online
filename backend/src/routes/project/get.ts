import express from "npm:express";
import Route from "../Route.ts";
import Project from "../../models/project.model.ts";
import validateRequest from "../../utils/validateRequest.ts";
import env from "../../env.ts";

async function handleRequest(req: express.Request, res: express.Response) {
    const validation = validateRequest([
        !isNaN(Number(req?.params?.id)),
    ]);
    if (!validation) {
        res.status(400).json({ "error": "Request body error" });
    }
    try {
        const project = await Project.findByPk(Number(req.params.id));
        if ( project === null ) {
            res.status(404).json({ "error": "Project not found." });
        } else {
            res.status(200).json(project.toJSON());
        }
    } catch(err: any) {
        res.status(400).json({"Error": env.DEV_MODE ? err.message : "Internal" });
    }
}

export default Route.GET('/project/:id', handleRequest);