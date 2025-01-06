import ProjectResponse from "./Responses/ProjectResponse.ts";
import APIError from "./Responses/APIError.ts";
import {io, Socket} from "socket.io-client";
import {UpdateResult} from "../Editor/DTO/UpdateResult.ts";
import config from "../../../config.json"

export default class APIService
{
    static REST_API_URL = config.backendUrl; // 'http://localhost:3001'
    static SOCKET_IO_URL = config.wsUrl; // 'ws://localhost:2115'

    private socket: Socket|null = null;
    private isAwaitingConnection: boolean = false;

    constructor() {}

    private async httpPost<T>(endpoint: string, body: object={}): Promise<T> {
        const result = (await (await fetch(
            `${APIService.REST_API_URL}${endpoint}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            }
        )).json()) as T & APIError
        if (result.error) throw new Error(result.error)
        return result as T;
    }

    private async httpGet<T>(endpoint: string, body: object={}): Promise<T> {
        const params = Object.entries(body).map(([k, v]) => `${k}=${v}`).join('&');
        const result = (await (await fetch(
            `${APIService.REST_API_URL}${endpoint}?${params}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )).json()) as T & APIError;
        if (result.error) throw new Error(result.error);
        return result as T;
    }

    isSocketConnected(): boolean {
        return !!this.socket && this.socket.connected;
    }

    awaitingConnection(): boolean {
        return this.isAwaitingConnection;
    }

    async connectSocket(): Promise<void> {
        return new Promise((resolve) => {
            if (!this.socket) {
                this.socket = io(APIService.SOCKET_IO_URL, {transports: ['websocket']});
            } else {
                if (!this.socket.connected) this.socket.connect()
                else return resolve();
            }

            this.socket.off('connect')
            this.socket.once('connect', () => {
                console.log("Successfully connected")
                this.isAwaitingConnection = false;
                resolve()
            })
        })
    }

    handleProjectUpdated(callback: (response: { source: string, result: UpdateResult }) => void): void {
        if(!this.socket || !this.socket.connected) throw new Error('Not connected');
        this.socket.on('project-updated', callback)
    }

    async joinRoom(data: object): Promise<void> {
        if(!this.socket || !this.socket.connected) throw new Error('Not connected');
        const result = await this.socket.emitWithAck("join-room", data);
        if (!result.success) throw new Error(`[SERVER ERROR]: ${result.msg}`);
    }

    async projectUpdate(data: object): Promise<void> {
        if(!this.socket || !this.socket.connected) throw new Error('Not connected');
        const result = await this.socket.emitWithAck("project-update", data);
        if (!result.success) throw new Error(`[SERVER ERROR]: ${result.msg}`);
    }

    async createNewProject(name: string): Promise<ProjectResponse> {
        return await this.httpPost<ProjectResponse>('/project/create', { name })
    }

    async getProjectById(id: number): Promise<ProjectResponse> {
        return await this.httpGet<ProjectResponse>(`/project/${id}`, )
    }
}