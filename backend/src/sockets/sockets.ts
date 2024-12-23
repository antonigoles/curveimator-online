import { serve } from "https://deno.land/std@0.150.0/http/server.ts";
import { Server } from "https://deno.land/x/socket_io@0.1.1/mod.ts";
import env from "../env.ts";

const io = new Server();

io.on("connection", (socket) => {
    console.log(`socket ${socket.id} connected`);

    socket.on("join-room", (data, ack) => {
        // 1. Check if room exists
        // 2. Join
        if (ack) ack({ joined: "successfully" })
    })

    socket.on("disconnect", (reason) => {
        console.log(`socket ${socket.id} disconnected due to ${reason}`);
    });
});

serve(io.handler(), {
    port: env.SOCKETS_PORT,
});