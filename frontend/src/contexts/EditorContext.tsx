import {createContext} from "react";
import Project from "../core/Editor/Entities/Project.ts";
import {randomName} from "../core/UI/utils.ts";

export enum EditorTools {
    Select = 0,
    Bezier = 1,
}

export type EditorContextData = {
    currentTool: EditorTools,
    project: Project,
    selectedObjectId: null|number;
}

export type EditorContextType = {
    editorContextData: EditorContextData;
    updateEditorContext: (editorContextData: Partial<EditorContextData>) => void
}

export const EditorContext = createContext<EditorContextType>({
    editorContextData: {
        currentTool: EditorTools.Select,
        project: new Project(0, randomName(), []),
        selectedObjectId: null,
    },
    updateEditorContext: () => {
        throw new Error('Editor Context running on default value; somehow was not initialized')
    }
})
