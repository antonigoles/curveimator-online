import ProjectRepository from "./ProjectRepository.ts";
import Project from "./Project.ts";
import {uuid} from "../Math/utils.ts";

export default class EditorService
{
    private projectRepository: ProjectRepository;

    constructor(projectRepository: ProjectRepository) {
        this.projectRepository = projectRepository;
    }

    async createNewProject(name: string): Promise<Project> {
        const project = new Project(uuid(), name);
        await this.projectRepository.saveProject(project);
        return project;
    }
}