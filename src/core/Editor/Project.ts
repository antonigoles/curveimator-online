import ProjectSignature from "./ProjectSignature.ts";
import {uuid} from "../Math/utils.ts";

export default class Project {
    private readonly signature: ProjectSignature;

    constructor(uid: string|null) {
        if (!uid) uid = uuid();
        this.signature = new ProjectSignature(uid);
    }

    getSignature(): ProjectSignature {
        return this.signature;
    }
}