import {useEffect, useState} from "react";
import {Home} from "./views/Home.tsx";
import {Editor} from "./views/Editor.tsx";
import {EditorViewData, RouteContext, ViewDataType, Views} from "./contexts/RouterContext.tsx";

function viewByRoute(route: Views): JSX.Element
{
    const views: {[Views: string]: JSX.Element} = {
        [Views.Home]: <Home/>,
        [Views.Editor]: <Editor/>,
    }
    return views[route] ?? <Home/>;
}

function evaluateRouteByURL(): {view: Views, viewData: ViewDataType} {
    const paths: {[key: string]: Views} = {
        "/": Views.Home,
        "/editor": Views.Editor
    }

    let view = paths[window.location.pathname] ?? Views.Home;
    let viewData = null;
    if (view === Views.Editor) {
        const params = new URLSearchParams(document.location.search);
        const pParam = params.get("p");
        if(pParam && !isNaN(Number(pParam))) {
            viewData = {
                projectId: Number(pParam)
            } as EditorViewData
        } else {
            view = Views.Home
        }
    }

    return {view, viewData};
}


export default function App() {
    const [view, setView] = useState<Views>(Views.Home);
    const [viewData, setViewData] = useState<ViewDataType>();

    useEffect(()=> {
        const routeData = evaluateRouteByURL();
        setView(routeData.view);
        setViewData(routeData.viewData)
    },[])

    function updateRoute(view: Views, viewData: ViewDataType): void {
        setView(view);
        setViewData(viewData);
    }

    return (
        <RouteContext.Provider value={{view, viewData, updateRoute}}>
            {viewByRoute(view)}
        </RouteContext.Provider>
    );
}
