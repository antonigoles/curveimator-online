import EditorService from "./Editor/EditorService.ts";
import ProjectRepository from "./Editor/ProjectRepository.ts";

const projectRepository = new ProjectRepository()
const editorService = new EditorService(projectRepository);


export default { editorService, projectRepository };