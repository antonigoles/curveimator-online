import APIService from "./Network/APIService.ts";
import ProjectRepository from "./Editor/Repositories/ProjectRepository.ts";
import EditorService from "./Editor/Services/EditorService.ts";

// POOR MAN'S DI CONTAINER

const apiService = new APIService();
const projectRepository = new ProjectRepository(apiService)
const editorService = new EditorService(projectRepository);


export { editorService, projectRepository, apiService };