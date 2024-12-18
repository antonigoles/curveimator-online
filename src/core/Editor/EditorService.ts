import ProjectRepository from "./ProjectRepository.ts";

export default class EditorService
{
    private projectRepository: ProjectRepository;

    constructor(projectRepository: ProjectRepository) {
        this.projectRepository = projectRepository;
    }

    createNewProject(name: string) {
        // TODO: Implement
    }
}