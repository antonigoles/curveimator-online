import ProjectObjectResponse from "./ProjectObjectResponse.ts";

type ProjectResponse = {
    id: number,
    name: string,
    objects: ProjectObjectResponse[],
}

export default ProjectResponse;