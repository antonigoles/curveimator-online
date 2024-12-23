import { Socket } from "npm:socket.io-client@4.7.5";
import {existsSync} from "https://deno.land/std/fs/mod.ts";
import env from "../src/env.ts";

const server_url = `http://${env.HOST}:${env.PORT}`
const LOGS_PATH = `./test-logs/${Date.now()}.log`

export function writeTestLogs(data: string | object) {
    const prefix = `[${(new Date()).toISOString()}] `
    const logExists = existsSync(LOGS_PATH);
    if (data instanceof String) {
        Deno.writeTextFileSync(LOGS_PATH, `${prefix} ${data}\n`, {
            append: logExists,
            create: !logExists,
            createNew: !logExists
        })
    } else {
        Deno.writeTextFileSync(LOGS_PATH, `${prefix} ${JSON.stringify(data, null, 4)}\n`, {
            append: logExists,
            create: !logExists,
            createNew: !logExists
        })
    }
}

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

export function waitForSocket<T>(socket: Socket, event: string, handler?: (data: T) => void) {
    return new Promise<T>((resolve) => {
        socket.once(event, (data: T) => {
            if(handler) handler(data);
            resolve(data);
        });
    });
}

export function waitForDisconnect(socket: Socket) {
    return new Promise((resolve) => {
        socket.once("disconnect", resolve);
        socket.disconnect();
    });
}

export function waitForEmit<T>(socket: Socket, event: string, data: object, handler?: (data: T) => void) {
    return new Promise<T>((resolve) => {
        socket.emitWithAck(event, data, (data: T) => {
            if (handler) handler(data)
            resolve(data);
        });
    });
}