import ObjectProperties from "../components/Editor/ObjectProperties/ObjectProperties.tsx";
import WorkingWindow from "../components/Editor/WorkingWindow/WorkingWindow.tsx";
import {useContext, useEffect, useState} from "react";
import useWindowDimensions from "../components/useWindowDimensions.tsx";
import Timeline from "../components/Editor/Timeline/Timeline.tsx";
import {RouteContext, RouteContextData} from "../contexts/RouterContext.tsx";
import { editorService } from '../core/DIContainer.tsx'

type DraggableLineParameters = {
    setValue: React.Dispatch<React.SetStateAction<number>>,
    direction: 'x' | 'y'
}

function DraggableLine({ setValue, direction }: DraggableLineParameters): JSX.Element {
    const {height, width} = useWindowDimensions()

    function handleMouseMove(event: React.DragEvent) {
        if(direction == 'x') setValue(event.clientX/width);
        if(direction == 'y') setValue(event.clientY/height);
    }
    return (
        <div
            onDrag={handleMouseMove}
            onDragEnd={handleMouseMove}
            style={{
                width: direction == 'x' ? '2px' : `100%`,
                height: direction == 'x' ? `100%` : '2px',
            }}
            className={`bg-lightGray ${direction == 'x' ? 'hover:cursor-w-resize' : 'hover:cursor-n-resize'}`}
        ></div>
    )
}

export function Editor(): JSX.Element {
    const {view, viewData, updateRoute} = useContext<RouteContextData>(RouteContext);
    const {height, width} = useWindowDimensions()
    const [horizontalSplit, setHorizontalSplit] = useState(2/3);
    const [verticalSplit, setVerticalSplit] = useState(2/5);

    async function initNewProject(projectName: string) {
        await editorService.createNewProject(projectName);
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
                <DraggableLine setValue={setVerticalSplit} direction={'x'}/>
                <WorkingWindow height={height*horizontalSplit-1} width={width - width*verticalSplit-2}/>
            </div>
            <div className={"w-full"}>
                <DraggableLine setValue={setHorizontalSplit} direction={'y'}/>
                <Timeline width={width} height={height - height*horizontalSplit-4}/>
            </div>
        </div>
    );
}