import ProjectSignature from "./ProjectSignature.ts";
import {uuid} from "../Math/utils.ts";

export default class Project {
    private readonly signature: ProjectSignature;
    private readonly name: string;

    constructor(uid: string|null, name: string) {
        if (!uid) uid = uuid();
        this.signature = new ProjectSignature(uid);
        this.name = name;
    }

    getSignature(): ProjectSignature {
        return this.signature;
    }
}