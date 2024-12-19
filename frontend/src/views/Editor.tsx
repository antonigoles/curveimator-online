import ObjectProperties from "../components/Editor/ObjectProperties/ObjectProperties.tsx";
import WorkingWindow from "../components/Editor/WorkingWindow/WorkingWindow.tsx";
import {DragEvent, useContext, useEffect, useState} from "react";
import useWindowDimensions from "../components/useWindowDimensions.tsx";
import Timeline from "../components/Editor/Timeline/Timeline.tsx";
import {RouteContext, RouteContextData} from "../contexts/RouterContext.tsx";
import { editorService } from '../core/DIContainer.tsx'


export function Editor(): JSX.Element {
    const { view, viewData, updateRoute } = useContext<RouteContextData>(RouteContext);
    const { height, width } = useWindowDimensions()
    const [horizontalSplit, setHorizontalSplit] = useState(2/3);
    const [verticalSplit, setVerticalSplit] = useState(2/5);

    async function initNewProject(projectName: string) {
        await editorService.createNewProject(projectName);
    }

    function handleDragVertical(event: DragEvent<HTMLDivElement>) {
        setVerticalSplit(event.clientX/width)
    }

    function handleDragVerticalStop(event: DragEvent<HTMLDivElement>) {
        setVerticalSplit(event.clientX/width)
    }

    function handleDragHorizontal(event: DragEvent<HTMLDivElement>) {
        setHorizontalSplit(event.clientY/height)
    }

    function handleDragHorizontalStop(event: DragEvent<HTMLDivElement>) {
        setHorizontalSplit(event.clientY/height)
    }

    useEffect(() => {
        if(viewData?.isNewProject) {
            viewData.isNewProject = false;
            updateRoute(view, viewData)
            initNewProject(viewData.projectName);
        }
    }, []);

    return (
        <div className={"w-full h-full flex flex-col content-stretch"}>
            <div className={"w-full flex flex-row content-stretch"}>
                <ObjectProperties height={height*horizontalSplit} width={width*verticalSplit-2}/>
                <div
                    onDrag={handleDragVertical}
                    onDragEnd={handleDragVerticalStop}
                    className={`w-[2px] h-full bg-lightGray hover:cursor-w-resize`}
                ></div>
                <WorkingWindow height={height*horizontalSplit-1} width={width - width*verticalSplit-2}/>
            </div>
            <div className={"w-full"}>
                <div
                    onDrag={handleDragHorizontal}
                    onDragEnd={handleDragHorizontalStop}
                    className={"w-full h-[2px] bg-lightGray hover:cursor-n-resize move:cursor-n-resize"}
                ></div>
                <Timeline width={width} height={height - height*horizontalSplit-4}/>
            </div>
        </div>
    );
}