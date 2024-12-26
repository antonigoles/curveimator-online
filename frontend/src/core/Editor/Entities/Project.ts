import ProjectResponse from "../../Network/Responses/ProjectResponse.ts";
import Bezier from "./Bezier.ts";

type ProjectObjectTypes = Bezier

export default class Project {
    private readonly name: string;
    private readonly id: number;
    private readonly projectObjects: ProjectObjectTypes[]
    private readonly projectObjectsMap: { [key: number]: ProjectObjectTypes } = {}

    constructor(id: number, name: string, projectObjects: ProjectObjectTypes[]) {
        this.name = name;
        this.id = id;
        this.projectObjects = projectObjects;
        this.rebuildProjectObjectsMap();
    }

    rebuildProjectObjectsMap(): void {
        for(const obj of this.projectObjects) {
            this.projectObjectsMap[obj.getId()] = obj;
        }
    }

    getName(): string {
        return this.name;
    }

    getId(): number {
        return this.id;
    }

    getObjects(): ProjectObjectTypes[] {
        return this.projectObjects;
    }

    getObjectById(id: number): ProjectObjectTypes {
        return this.projectObjectsMap[id];
    }

    static fromProjectResponse(response: ProjectResponse) {
        const objects: ProjectObjectTypes[] = [];
        for ( const object of response.objects) {
            if (object.type === 'bezier') {
                objects.push(Bezier.fromProjectObjectResponse(object));
            }
        }
        return new Project(response.id, response.name, objects);
    }
}