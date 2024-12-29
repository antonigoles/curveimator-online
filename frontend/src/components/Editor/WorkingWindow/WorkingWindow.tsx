import ComponentWithDimensions from "../../ParameterTypes/ComponentWithDimensions.ts";
import {useContext, useEffect, useRef, useState} from "react";
import {editorService, screenRenderEngine} from "../../../core/DIContainer.tsx";
import {EngineState} from "../../../core/Render/ScreenRenderEngine.ts";
import {PlayArrow, Stop} from "@mui/icons-material";
import v2 from "../../../core/Math/v2.tsx";
import {EditorContext, EditorContextType, EditorTools} from "../../../contexts/EditorContext.tsx";


export default function WorkingWindow({width, height}: ComponentWithDimensions): JSX.Element {
    const {editorContextData, updateEditorContext} = useContext<EditorContextType>(EditorContext);

    let canvasHeight = (width * 0.98) * 9/16;
    let canvasWidth = width * 0.98;
    if (canvasHeight > height * 0.9) {
        canvasHeight = height * 0.9;
        canvasWidth = canvasHeight * 16/9
    }

    const [loading, setLoading] = useState<boolean>(true);
    const [isPlaying, setPlaying] = useState<boolean>(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    function handleWindowClick(event: MouseEvent) {
        if(!event.target) return;
        if(!(event.target instanceof HTMLElement)) return;

        // scale to 1280x720
        const rect = event.target.getBoundingClientRect();
        const position = new v2((event.offsetX/rect.width)*1280, (event.offsetY/rect.height)*720);
        if (editorContextData.currentTool === EditorTools.Select) {
            // default behaviour if you randomly click on the background
            editorService.unselectObject()
            updateEditorContext({
                selectedObjectId: null
            })
        }

        if (editorContextData.currentTool === EditorTools.Bezier) {
            const selectedObject = editorService.getSelectedObject()
            if(selectedObject) {
                // add to existing object
                editorService.handleAddControlPoint(selectedObject, position);
            } else {
                // create new object
                editorService.createNewBezier(position);
            }
        }
    }

    useEffect(() => {
        let refCopy=null;
        if(canvasRef.current) {
            refCopy=canvasRef.current;
            if (screenRenderEngine.getState() === EngineState.WAITING_FOR_INJECT) {
                setLoading(false);
                screenRenderEngine.injectCanvas(canvasRef.current);
            }

            // init events
            refCopy.addEventListener("click", handleWindowClick)
        } else {
            setLoading(true);
        }

        return () => {
            if (refCopy) {
                refCopy.removeEventListener("click", handleWindowClick)
            }
        }
    }, [canvasRef, editorContextData, canvasHeight, canvasWidth]);



    return (
        <div style={{width: `${width}px`, height: `${height}px` }} className={`bg-darkGray flex flex-col`}>
            { loading ?? 'Loading...' }
            <div className={'w-full h-[95%] border-b-lightGray border-b-[1px] flex justify-center items-center'}>
                <canvas
                    style={{
                        width: `${canvasWidth}px`,
                        height: `${canvasHeight}px`,
                    }}
                    className={'border-1 border-lightGray'}
                    height={720}
                    width={1280}
                    ref={canvasRef}
                />
            </div>
            <div className={'w-full flex-1 flex justify-center items-center'}>
                <div
                    onClick={() => setPlaying(!isPlaying)}
                    className={'flex justify-center items-center hover:cursor-pointer'}
                >
                    {isPlaying ? <Stop fontSize={"large"} /> : <PlayArrow fontSize={"large"} />}
                </div>
            </div>
        </div>
    )
}