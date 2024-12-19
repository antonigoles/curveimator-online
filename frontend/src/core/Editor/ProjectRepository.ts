import Project from "./Project.ts";
import ProjectSignature from "./ProjectSignature.ts";

export default class ProjectRepository {
    constructor() {}

    getAllSavedSignatures(): void {

    }

    getProjectBySignature(signature: ProjectSignature): Promise<Project> {
        // TODO: Implement
    }

    saveProject(project: Project): Promise<void> {

    }
}