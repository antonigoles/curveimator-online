import APIService from "./Network/APIService.ts";
import ProjectRepository from "./Editor/Repositories/ProjectRepository.ts";
import EditorService from "./Editor/Services/EditorService.ts";
import {ScreenRenderEngine} from "./Render/ScreenRenderEngine.ts";

// POOR MAN'S DI CONTAINER

const screenRenderEngine = new ScreenRenderEngine();
const apiService = new APIService();
const projectRepository = new ProjectRepository(apiService)
const editorService = new EditorService(projectRepository, screenRenderEngine, apiService);

export { editorService, projectRepository, apiService, screenRenderEngine };