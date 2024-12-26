import Project from "../Entities/Project.ts";
import APIService from "../../Network/APIService.ts";

export default class ProjectRepository {
    apiService: APIService;

    constructor(apiService: APIService) {
        this.apiService = apiService;
    }

    async createProjectByName(name: string): Promise<Project> {
        const projectResponse = await this.apiService.createNewProject(name);
        return Project.fromProjectResponse(projectResponse);
    }

    async getById(id: number): Promise<Project> {
        const projectResponse = await this.apiService.getProjectById(id);
        return Project.fromProjectResponse(projectResponse);
    }
}