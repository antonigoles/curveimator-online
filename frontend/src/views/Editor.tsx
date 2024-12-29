import WorkingWindow from "../components/Editor/WorkingWindow/WorkingWindow.tsx";
import {useContext, useEffect, useRef, useState} from "react";
import useWindowDimensions from "../components/useWindowDimensions.tsx";
import Timeline from "../components/Editor/Timeline/Timeline.tsx";
import {RouteContext, RouteContextData} from "../contexts/RouterContext.tsx";
import {editorService} from '../core/DIContainer.tsx'
import {LoadingFullScreen} from "../components/LoadingFullScreen.tsx";
import InfoWindowModal from "../components/InfoWindowModal.tsx";
import {waitFor} from "../core/UI/utils.ts";
import {EditorContext, EditorContextData, EditorTools} from "../contexts/EditorContext.tsx";
import {Project} from "../core/Editor/Entities/Project.ts";
import LeftPanel from "../components/Editor/LeftPanel/LeftPanel.tsx";

type DraggableLineParameters = {
    setValue: React.Dispatch<React.SetStateAction<number>>,
    direction: 'x' | 'y'
}

function DraggableLine({ setValue, direction }: DraggableLineParameters): JSX.Element {
    const {height, width} = useWindowDimensions()
    const lineRef = useRef<HTMLDivElement>(null);

    // function handleMouseMove(event: React.DragEvent) {
    //     if(direction == 'x') setValue(event.clientX/width);
    //     if(direction == 'y') setValue(event.clientY/height);
    // }

    let isMouseDown = false;

    function handleMoseMove(event: MouseEvent) {
        if ( lineRef.current ) {
            const rect: DOMRect  = lineRef.current.getBoundingClientRect();
            if(direction === 'x') {
                const dist = Math.abs(event.clientX - rect.left);
                if (dist < 20) {
                    document.body.style.cursor = "ew-resize";
                    if(isMouseDown) {
                        setValue(event.clientX/width)
                    }
                } else {
                    document.body.style.cursor = "inherit";
                }
            }

            if(direction === 'y') {
                const dist = Math.abs(event.clientY - rect.top);
                if (dist < 20) {
                    document.body.style.cursor = "ns-resize";
                    if(isMouseDown) {
                        setValue(event.clientY/height)
                    }
                } else {
                    if (document.body.style.cursor !== "ew-resize")
                        document.body.style.cursor = "inherit";
                }
            }
        }

    }

    function handleMoseUp() {
        isMouseDown=false;
    }

    function handleMoseDown() {
        isMouseDown=true;
    }

    // useEffect(() => {
    //     window.addEventListener("mousemove", handleMoseMove);
    //     window.addEventListener("mousedown", handleMoseDown);
    //     window.addEventListener("mouseleave", handleMoseDown);
    //     window.addEventListener("mouseup", handleMoseUp);
    //
    //     return () => {
    //         window.removeEventListener("mousemove", handleMoseMove);
    //         window.removeEventListener("mousedown", handleMoseDown);
    //         window.removeEventListener("mouseleave", handleMoseDown);
    //         window.removeEventListener("mouseup", handleMoseUp);
    //
    //     }
    // }, []);

    return (
        <div
            ref={lineRef}
            style={{
                width: direction == 'x' ? '2px': `100%`,
                height: direction == 'x' ? `100%` : '2px',
            }}
            className={`bg-lightGray`}
        ></div>
    )
}

export function Editor(): JSX.Element {
    const {view, viewData, updateRoute} = useContext<RouteContextData>(RouteContext);
    const {height, width} = useWindowDimensions()
    const [horizontalSplit, setHorizontalSplit] = useState(2/3);
    const [verticalSplit, setVerticalSplit] = useState(1/5);
    const [loading, setLoading] = useState(true);

    const [popupVisible, setPopupVisible] = useState<boolean>(false);
    const [popupContent, setPopupContent] = useState<JSX.Element|string>("");
    const [onClose, setOnClose] = useState<()=>void>(()=> (() => {}));
    const [popupTitle, setPopupTitle] = useState<JSX.Element|string>("");

    const [currentProject, setCurrentProject] = useState<Project|null>(null);
    const [currentTool, setCurrentTool] = useState<EditorTools>(EditorTools.Select);
    const [selectedObject, setSelectedObject] = useState<number|null>(null);
    const [previewTimestamp, setPreviewTimestamp] = useState<number>(0);

    async function initNewProject(projectName: string) {
        const project = await editorService.createNewProject(projectName);
        await editorService.changeProject(project);
        window.location.href = `/editor?p=${project.getId()}`;
    }

    async function loadProject(id: number): Promise<void> {
        const project = await editorService.getProjectById(id);
        await editorService.changeProject(project);
        updateEditorContext({
            project: project
        });
    }

    function updateEditorContext(editorContextData: Partial<EditorContextData>) {
        if(editorContextData.selectedObjectId !== undefined) {
            setSelectedObject(editorContextData.selectedObjectId)
        }

        if(editorContextData.previewTimestamp !== undefined) {
            setPreviewTimestamp(editorContextData.previewTimestamp)
        }

        if(editorContextData.currentTool !== undefined) {
            setCurrentTool(editorContextData.currentTool)
        }

        if(editorContextData.project !== undefined) {
            setCurrentProject(editorContextData.project)
        }
    }

    function showPopup(
        title: JSX.Element|string,
        content: JSX.Element|string,
        callback?: () => void
    ) {
        setPopupVisible(true)
        setPopupContent(content)
        setPopupTitle(title)
        if(callback) {
            setOnClose(() => callback)
        }
    }

    function fatalErrorWithReturnPopup(errorMessage: string) {
        showPopup(
            'Oh nie!',
            <div className={'w-[20vw]'}>
                <p>Wystąpił tragiczny błąd!</p>
                <div className={'mt-2 p-2 border-1'}>
                    {errorMessage}
                </div>
            </div>,
            function()  {
                setPopupVisible(false)
                window.location.href = "/";
            }
        )
    }

    function lightErrorWithReturnPopup(errorMessage: string) {
        showPopup(
            'Whoops!',
            <div className={'w-[20vw]'}>
                <p>Wygląda na to że:</p>
                <div className={'mt-2 p-2 border-1'}>
                    {errorMessage}
                </div>
            </div>,
            function()  {
                setPopupVisible(false)
                window.location.href = "/";
            }
        )
    }

    useEffect(() => {
        (async () => {
            if(viewData?.isNewProject && viewData.projectName) {
                setLoading(true);
                updateRoute(view, viewData);
                try {
                    await waitFor(500);
                    await initNewProject(viewData.projectName);
                } catch(err) {
                    fatalErrorWithReturnPopup(err instanceof Error ? err.toString() : '🤔😧📝');
                }
                setLoading(false);
            } else {
                // try to pull by id
                if (viewData?.projectId) {
                    try {
                        setLoading(true);
                        await loadProject(viewData.projectId);
                    } catch(err) {
                        lightErrorWithReturnPopup(err instanceof Error ? err.toString() : '🤔😧📝');
                    }
                    setLoading(false)
                } else {
                    window.location.href = "/";
                }
            }
        })();

    }, []);

    return (
        <div className={"w-full h-full flex flex-col content-stretch"}>

            {
                currentProject &&
                <EditorContext.Provider value={{
                    editorContextData: {
                        project: currentProject,
                        currentTool: currentTool,
                        selectedObjectId: selectedObject,
                        previewTimestamp: previewTimestamp,
                    },
                    updateEditorContext: updateEditorContext,
                }}>
                    <div className={"w-full flex flex-row content-stretch"}>
                        <LeftPanel height={height*horizontalSplit} width={width*verticalSplit-2}/>
                        <DraggableLine setValue={setVerticalSplit} direction={'x'}/>
                        <WorkingWindow height={height*horizontalSplit-1} width={width - width*verticalSplit-2}/>
                    </div>
                    <div className={"w-full"}>
                        <DraggableLine setValue={setHorizontalSplit} direction={'y'}/>
                        <Timeline keyframeTableWidth={width - width*verticalSplit-2} width={width} height={height - height*horizontalSplit-4}/>
                    </div>
                </EditorContext.Provider>
            }
            {(loading) && <LoadingFullScreen />}
            {<InfoWindowModal show={popupVisible} content={popupContent} onClose={onClose} title={popupTitle}/>}
        </div>
    );
}