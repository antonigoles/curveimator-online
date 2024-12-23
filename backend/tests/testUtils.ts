import env from "../src/env.ts";

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