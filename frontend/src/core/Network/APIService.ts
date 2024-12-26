import ProjectResponse from "./Responses/ProjectResponse.ts";
import APIError from "./Responses/APIError.ts";

export default class APIService
{
    static REST_API_URL = 'http://localhost:3001'

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

    async createNewProject(name: string): Promise<ProjectResponse> {
        return await this.httpPost<ProjectResponse>('/project/create', { name })
    }

    async getProjectById(id: number): Promise<ProjectResponse> {
        return await this.httpGet<ProjectResponse>(`/project/${id}`, )
    }
}