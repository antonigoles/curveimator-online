import {useEffect, useState} from "react";
import {Home} from "./views/Home.tsx";
import {Editor} from "./views/Editor.tsx";

enum Views {
    Home = 1,
    Editor
}

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
    const [route, setRoute] = useState<Views>(Views.Home)
    useEffect(()=>{
        setRoute(evaluateRouteByURL());
    },[])
    return viewByRoute(route);
}
