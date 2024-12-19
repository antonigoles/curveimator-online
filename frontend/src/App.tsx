import {useEffect, useState} from "react";
import {Home} from "./views/Home.tsx";
import {Editor} from "./views/Editor.tsx";
import {RouteContext, ViewDataType, Views} from "./contexts/RouterContext.tsx";

function viewByRoute(route: Views): JSX.Element
{
    const views: {[Views: string]: JSX.Element} = {
        [Views.Home]: <Home/>,
        [Views.Editor]: <Editor/>,
    }
    return views[route] ?? <Home/>;
}

function evaluateRouteByURL(): Views
{
    const paths: {[key: string]: Views} = {
        "/": Views.Home,
        "/editor": Views.Editor
    }

    return paths[window.location.pathname] ?? Views.Home;
}


export default function App() {
    const [view, setView] = useState<Views>(Views.Home);
    const [viewData, setViewData] = useState<ViewDataType>();

    useEffect(()=>{
        setView(evaluateRouteByURL());
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
