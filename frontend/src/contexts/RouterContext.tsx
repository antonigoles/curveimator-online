import {createContext} from "react";

export enum Views {
    Home = 1,
    Editor
}

export type EditorViewData = {
    isNewProject: boolean,
    projectName: string,
}

export type ViewDataType = null | undefined | EditorViewData

export type RouteContextData = {
    view: Views;
    viewData: ViewDataType;
    updateRoute: (view: Views, viewData: ViewDataType) => void;
}

export const RouteContext = createContext<RouteContextData>({
    view: Views.Home,
    viewData: null,
    updateRoute: () => {
        throw new Error('Route Context running on default value; somehow was not initialized')
    }
})
