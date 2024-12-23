import { expect } from "jsr:@std/expect";
import { io, Socket } from "npm:socket.io-client@4.7.5";
import {httpPost, httpGet, waitForSocket, waitForDisconnect, waitForEmit} from "../testUtils.ts";
import env from "../../src/env.ts";

Deno.test("0. Test API Connetion", async () => {
    await httpGet('/')
});

let projectId = 0;


Deno.test("1. USER A creates a PROJECT and saves it to database", async () => {
    const result = await httpPost('/project/create', { name: "example-project" })
    expect(result).toHaveProperty("id")
    projectId = result.id;
});

Deno.test("1b. We should be able to fetch the project", async () => {
    const result = await httpGet(`/project/${projectId}`)
    expect(result.id).toEqual(projectId);
});

Deno.test({
name:"2. Test Socket Connection",
fn: async() => {

    // 1. USER A joins the project
    const clientASocket = io(`ws://${env.HOST}:${env.SOCKETS_PORT}`);
    await waitForSocket(clientASocket, "connect", () => {});

    const response = await clientASocket.emitWithAck("join-room", { projectId })

    console.log(response)

    // 2. USER A adds an OBJECT and emits it as an event


    // 3. USER B joins the project through URL and receives all PROJECT data correctly


    // 4. USER B adds a keyframe to the OBJECT and this changes gets emmited to all connected USERS


    // 5. USER B connection gets interrupted, meanwhile USER A adds another KEYFRAME to the OBJECT


    // 6. USER B should signal synchronization issues

    await waitForDisconnect(clientASocket);
},
sanitizeResources: false,
sanitizeOps: false,
});




