import {createContext} from "react";
import {uuid} from "../core/Math/utils.ts";
import Project from "../core/Editor/Project.ts";
import {randomName} from "../core/UI/utils.ts";

export enum EditorTools {
    Select = 0,
    Bezier = 1,
}

export type EditorContextData = {
    currentTool: EditorTools,
    project: Project
}

export type EditorContext = {
    editorContextData: EditorContextData;
    updateEditorContext: (editorContextData: Partial<EditorContextData>) => void
}

export const EditorContext = createContext<EditorContext>({
    editorContextData: {
        currentTool: EditorTools.Select,
        project: new Project(uuid(), randomName()),
    },
    updateEditorContext: () => {}
})
