import { io, Socket } from "npm:socket.io-client@4.7.5";
import env from "../src/env.ts";
import { DefaultEventsMap } from "https://deno.land/x/socket_io@0.1.1/packages/event-emitter/mod.ts";

const server_url = `http://${env.HOST}:${env.PORT}`

export async function httpPost(path: string, body: object) {
    const result = await fetch(`${server_url}${path}`,
    {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
        },
        body: JSON.stringify(body)
    });

    const data = await result.json();
    if ( result.status < 200 || result.status >= 300 ) throw data;
    return data;
}

export async function httpGet(path: string) {
    const result = await fetch(`${server_url}${path}`,
    {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
        }
    });

    const data = await result.json();
    if ( result.status < 200 || result.status >= 300 ) throw data;
    return data;
}

export async function waitForSocket(socket: Socket, event: string, handler: (data: object) => void) {
    return new Promise((resolve) => {
        socket.once(event, (data) => {
            handler(data)
            resolve(true);
        });
    });
}

export async function waitForDisconnect(socket: Socket) {
    return new Promise((resolve) => {
        socket.once("disconnect", resolve);
        socket.disconnect();
    });
}

export async function waitForEmit(socket: Socket, event: string, data: object, handler?: (data: object) => void) {
    return new Promise((resolve) => {
        socket.emit(event, (data: object) => {
            if ( handler ) handler(data)
            resolve(true);
        });
    });
}