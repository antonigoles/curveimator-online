import ProjectRepository from "../Repositories/ProjectRepository.ts";
import Project from "../Entities/Project.ts";

export default class EditorService
{
    private projectRepository: ProjectRepository;

    constructor(projectRepository: ProjectRepository) {
        this.projectRepository = projectRepository;
    }

    async createNewProject(name: string): Promise<Project> {
        return await this.projectRepository.createProjectByName(name);
    }

    async getProjectById(id: number): Promise<Project> {
        return await this.projectRepository.getById(id);
    }
}