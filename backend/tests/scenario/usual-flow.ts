import { expect } from "jsr:@std/expect";
import { io } from "npm:socket.io-client@4.7.5";
import {httpPost, httpGet, waitForSocket, waitForDisconnect, writeTestLogs} from "../testUtils.ts";
import env from "../../src/env.ts";

Deno.test("0. Test API Connetion", async () => {
    await httpGet('/')
});

let projectId = 0;


Deno.test("1. USER A creates a PROJECT and saves it to database", async () => {
    const result = await httpPost('/project/create', { name: "example-project" })
    expect(result).toHaveProperty("id")
    projectId = result.id;
    writeTestLogs(result)
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
    let response = await clientASocket.emitWithAck("join-room", { projectId })
    expect(response).toHaveProperty('success');
    expect(response.success).toBe(true);

    // 2. USER A adds an OBJECT and emits it as an event
    const projectDataToEmit = {
        projectId: projectId,
        type: "create",
        data: {
            type: 'bezier',
            controlPoints: [[1,0], [2,3], [3,1], [4,0]],
            position: [0, 2],
            rotation: 0.2,
            scale: 0.7,
            name: 'Bezier Curve #1'
        },
    }
    response = await clientASocket.emitWithAck("project-update", projectDataToEmit);
    expect(response).toHaveProperty('success');
    expect(response.success).toBe(true);

    // 2b. USER A emits INCORRECT OBJECT and expects the request to fail
    const badProjectDataToEmit =  {...projectDataToEmit};
    badProjectDataToEmit["type"] = "cerate"
    response = await clientASocket.emitWithAck("project-update", badProjectDataToEmit);
    expect(response).toHaveProperty('success');
    expect(response.success).toBe(false);

    // 3. USER B joins the project through URL and receives all PROJECT data correctly
    const clientBSocket = io(`ws://${env.HOST}:${env.SOCKETS_PORT}`);
    await waitForSocket(clientBSocket, "connect", () => {});
    response = await clientBSocket.emitWithAck("join-room", { projectId })
    writeTestLogs(response)

    expect(response).toHaveProperty('success');
    expect(response.success).toBe(true);
    expect(response).toHaveProperty('project');
    expect(response.project.id).toBe(projectId);
    expect(response.project).toHaveProperty('objects');
    expect(response.project.objects.length).toBe(1)
    expect(response.project.objects[0]).toHaveProperty('serializedData');
    expect(response.project.objects[0].serializedData.toString()).toBe(projectDataToEmit.data.controlPoints.toString());

    const createdObjectId = response.project.objects[0].id;

    // 4a. USER B adds a keyframe to the OBJECT
    response = await clientBSocket.emitWithAck("project-update", {
        projectId: projectId,
        type: "create",
        data: {
            type: 'keyframe',
            objectId: createdObjectId,
            propertyPath: `cp.0.x`,
            time: 0.123,
            value: 1.2,
        },
    });
    writeTestLogs(response)
    expect(response.success).toBe(true);


    // 4b. USER B adds a keyframe to the OBJECT and this changes gets emitted to USER A
    clientBSocket.emitWithAck("project-update", {
        projectId: projectId,
        type: "create",
        data: {
            type: 'keyframe',
            objectId: createdObjectId,
            propertyPath: `cp.1.x`,
            time: 2.0,
            value: 13.0,
        },
    });

    const result = await waitForSocket<{ result: { objectId: number } }>(clientASocket, 'project-updated');
    writeTestLogs(result);

    expect(result).toHaveProperty('result');
    expect(result['result']).toHaveProperty('objectId');

    // 5a. USER B adds updates a keyframe

    clientBSocket.emitWithAck("project-update", {
        projectId: projectId,
        type: "update",
        data: {
            type: 'keyframe',
            id: result.result.objectId,
            propertyPath: `cp.0.y`,
            time: 6.123,
            value: 2.2,
        },
    });
    const result1 = await waitForSocket<{ result: { objectId: number } }>(clientASocket, 'project-updated');
    writeTestLogs(result1);

    // 5b. USER B adds updates an object

    clientBSocket.emitWithAck("project-update", {
        projectId: projectId,
        type: "update",
        data: {
            type: 'bezier',
            id: createdObjectId,
            name: 'New bezier name #90',
            controlPoints: [[1.7, 2.3], [2.1,32], [31,12], [324,-0.2]],
            position: [0.7, 2.3],
            rotation: 0.9,
            scale: 0.1,
        },
    });
    const result2 = await waitForSocket<{ result: { objectId: number } }>(clientASocket, 'project-updated');
    writeTestLogs(result2);

    // 6. Delete object and/or keyframe to test

    // clientBSocket.emitWithAck("project-update", {
    //     projectId: projectId,
    //     type: "delete",
    //     data: {
    //         type: 'bezier',
    //         id: createdObjectId,
    //     },
    // });
    // const result3 = await waitForSocket<{ result: { objectId: number } }>(clientASocket, 'project-updated');
    // writeTestLogs(result3);

    // X. USER B connection gets interrupted, meanwhile USER A adds another KEYFRAME to the OBJECT
    // X. USER B should signal synchronization issues

    // will not implement this, for the sake of this project lets just assume that user that disconnects needs to download
    // the entire project again : )


    await waitForDisconnect(clientASocket);
},
sanitizeResources: false,
sanitizeOps: false,
});




