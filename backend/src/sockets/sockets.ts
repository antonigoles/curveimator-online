import { serve } from "https://deno.land/std@0.150.0/http/server.ts";
import { Server } from "https://deno.land/x/socket_io@0.1.1/mod.ts";
import env from "../env.ts";
import Project from "../models/project.model.ts";
import { validateProjectUpdate } from "../utils/socketValidators.ts";
import ProjectUpdateFactory from "./ProjectUpdateHandlers/ProjectUpdateFactory.ts";
import ProjectRepository from "../repository/ProjectRepository.ts";

// TODO: Refactor this file


/// very safe cors settings™
const io = new Server({
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    },
});


io.on("connection", (socket) => {
    console.log(`socket ${socket.id} connected`);

    socket.on("join-room", async (data, ack) => {
        if (!ack) {
            console.log("Received ACK request without ACK")
            return;
        }
        if (!data.projectId) return ack({ success: false, msg: "No project with id " + socket.id })
        // const project = await Project.findByPk(data.projectId)
        // if (!project) return ack({ success: false, msg: "Project not found" })
        // const objects = await ProjectObject.findAll({ where: { projectId: data.projectId } });
        // const projectResult =  Object(project.toJSON());
        // projectResult['objects'] = objects.map( obj => obj.toJSON() );
        try {
            const project = await ProjectRepository.fullById(data.projectId)
            if(!project) return ack({ success: false, msg: 'Project not found' });
            console.log(project.toJSON())
            const roomAsString = `${data.projectId}`;
            socket.join(roomAsString);
            io.to(roomAsString).emit("user-joined", { userId: socket.id });
            ack({ success: true, project: project })
        } catch(err: any) {
            return ack({ success: false, msg: err.message });
        }
    })

    socket.on("project-update", async (data, ack) => {
        if (!ack) {
            console.log("Received ACK request without ACK")
            return;
        }
        if (!data.projectId) return ack({ success: false, msg: "No project with id " + socket.id })
        const project = await Project.findByPk(data.projectId)
        if (!project) return ack({ success: false, msg: "Project not found" })

        const validation = validateProjectUpdate(data);
        console.log(validation)
        if (!validation.result) return ack({ success: false, msg: validation.message })
        let result;
        try {
            const projectUpdate = ProjectUpdateFactory.fromPayload(data);
            result = await projectUpdate.perform();
        } catch(err: any) {
            return ack({ success: false, msg: err.message });
        }

        const roomAsString = `${data.projectId}`;
        io.to(roomAsString).emit("project-updated", {
            source: socket.id,
            result: result,
        });
        ack({ success: true })
    })

    socket.on("disconnect", (reason) => {
        console.log(`socket ${socket.id} disconnected due to ${reason}`);
    });
});

serve(io.handler(), {
    port: env.SOCKETS_PORT,
});