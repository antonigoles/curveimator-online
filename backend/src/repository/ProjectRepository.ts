import Project from "../models/project.model.ts";
import ProjectObject from "../models/projectObject.model.ts";
import Keyframe from "../models/keyframe.model.ts";

export default class ProjectRepository {
    static async fullById(id: number): Promise<Project|null> {
        const project = await Project.findByPk(id)
        if (!project) return null;
        project['objects'] = await ProjectObject.findAll({where: {projectId: id}});
        for ( const object of project.objects ) {
            object['keyframes'] = await Keyframe.findAll({where: {projectObjectId: object.id}});
        }
        return project;
    }
}