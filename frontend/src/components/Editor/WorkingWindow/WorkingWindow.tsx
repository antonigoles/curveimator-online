import ComponentWithDimensions from "../../ParameterTypes/ComponentWithDimensions.ts";
import {useContext, useEffect, useRef, useState} from "react";
import {editorService, screenRenderEngine} from "../../../core/DIContainer.tsx";
import {EngineState} from "../../../core/Render/ScreenRenderEngine.ts";
import {PlayArrow, Stop} from "@mui/icons-material";
import v2 from "../../../core/Math/v2.ts";
import {EditorContext, EditorContextType, EditorTools} from "../../../contexts/EditorContext.tsx";
import {angle} from "../../../core/Math/utils.ts";


export default function WorkingWindow({width, height}: ComponentWithDimensions): JSX.Element {
    const {editorContextData, updateEditorContext} = useContext<EditorContextType>(EditorContext);

    let canvasHeight = (width * 0.98) * 9/16;
    let canvasWidth = width * 0.98;
    if (canvasHeight > height * 0.9) {
        canvasHeight = height * 0.9;
        canvasWidth = canvasHeight * 16/9
    }

    const [loading, setLoading] = useState<boolean>(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    let isMouseDown = false;
    let hasGrabbed = false
    let beginGrabPosition: v2|null = null;
    let beginGrabObjectPosition: v2|null = null;
    let beginGrabObjectRotation = 0;

    function handleMouseDown() {
        isMouseDown = true;
    }

    function handleMouseUp() {
        isMouseDown = false;
        hasGrabbed = false;
        beginGrabPosition = null;
        beginGrabObjectPosition = null;
        beginGrabObjectRotation = 0;
        const selected = editorService.getSelectedObject();
        if(!selected) return;
        // selected.setForceLocalPosition(false);
    }

    function handleMouseMove(event: MouseEvent) {
        if(!isMouseDown) return;
        if(!event.target) return;
        if(!(event.target instanceof HTMLElement)) return;

        // scale to 1280x720
        const rect = event.target.getBoundingClientRect();
        const position = new v2((event.offsetX/rect.width)*1280, (event.offsetY/rect.height)*720);
        const selected = editorService.getSelectedObject();
        if(!selected) return;

        if (editorContextData.currentTool === EditorTools.Transform) {
            if (!hasGrabbed && selected.positionInsideObjectBoundarySquare(position)) {
                beginGrabPosition = position;
                beginGrabObjectPosition = selected.getPosition();
                hasGrabbed = true;
                // selected.setForceLocalPosition(true);
            } else if (hasGrabbed && beginGrabPosition && beginGrabObjectPosition) {
                const nextPosition = beginGrabObjectPosition.plus(position).minus(beginGrabPosition);
                editorService.moveObjectTo(selected.getId(), nextPosition);
                editorService.insertKeyframe(selected.getId(), 'x', nextPosition.x, editorContextData.previewTimestamp);
                editorService.insertKeyframe(selected.getId(), 'y', nextPosition.y, editorContextData.previewTimestamp);
                return;
            }
        }

        if (editorContextData.currentTool === EditorTools.Rotate) {
            if(!hasGrabbed) {
                beginGrabPosition = position;
                beginGrabObjectRotation = selected.getRotation()
                hasGrabbed = true;
            } else if (hasGrabbed && beginGrabPosition && (!isNaN(beginGrabObjectRotation))) {
                const center: v2 = selected.getMassCenter().plus(selected.getPosition());
                const rot = beginGrabObjectRotation + angle(
                    beginGrabPosition.minus(center),
                    position.minus(center)
                );
                editorService.rotateObjectTo(selected.getId(), rot);
                editorService.insertKeyframe(selected.getId(), 'r', rot, editorContextData.previewTimestamp);
                return;
            }
        }

        if (editorContextData.currentTool === EditorTools.Scale) {
            if (!hasGrabbed && selected.positionInsideObjectBoundarySquare(position)) {
                beginGrabPosition = position;
                beginGrabObjectPosition = selected.getPosition();
                hasGrabbed = true;
            } else if (hasGrabbed && beginGrabPosition && beginGrabObjectPosition) {
                const scaleBy = beginGrabObjectPosition.minus(position).length()
                editorService.scaleObjectTo(selected.getId(), selected.getScale() * scaleBy);
                // editorService.insertKeyframe(selected.getId(), 's', nextPosition.x, editorContextData.previewTimestamp);
                return;
            }
        }

        // if (editorContextData.currentTool === EditorTools.Select) {
        //     if (!hasGrabbed && selected.positionInsideObjectBoundarySquare(position)) {
        //         beginGrabPosition = position;
        //         beginGrabObjectPosition = selected.getPosition();
        //         hasGrabbed = true;
        //     }
        // }
    }

    function handleWindowClick(event: MouseEvent) {
        if(!event.target) return;
        if(!(event.target instanceof HTMLElement)) return;

        // scale to 1280x720
        const rect = event.target.getBoundingClientRect();
        const position = new v2((event.offsetX/rect.width)*1280, (event.offsetY/rect.height)*720);
        if (editorContextData.currentTool === EditorTools.Select) {
            const selected = editorService.getSelectedObject();
            if(selected && selected.positionInsideObjectBoundarySquare(position)) return;
            const resolved = editorService.resolveObjectIdsFromV2(position);
            if(resolved[0]) {
                editorService.changeSelectedObjectId(resolved[0])
                updateEditorContext({
                    selectedObjectId: resolved[0]
                })
            } else {
                // default behaviour if you randomly click on the background
                editorService.unselectObject()
                updateEditorContext({
                    selectedObjectId: null
                })
            }
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
            refCopy.addEventListener("mouseup", handleMouseUp)
            refCopy.addEventListener("mouseleave", handleMouseUp)
            refCopy.addEventListener("mouseout", handleMouseUp)
            refCopy.addEventListener("mousedown", handleMouseDown)
            refCopy.addEventListener("mousemove", handleMouseMove)
        } else {
            setLoading(true);
        }

        return () => {
            if (refCopy) {
                refCopy.removeEventListener("click", handleWindowClick)
                refCopy.removeEventListener("mouseup", handleMouseUp)
                refCopy.removeEventListener("mouseleave", handleMouseUp)
                refCopy.removeEventListener("mouseout", handleMouseUp)
                refCopy.removeEventListener("mousedown", handleMouseDown)
                refCopy.removeEventListener("mousemove", handleMouseMove)
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
            <div className={'relative w-full flex-1 flex justify-center items-center'}>
                <div className={'absolute left-[15px]'}>
                {Math.floor(editorContextData.previewTimestamp / 60).toString().padStart(2, '0')}
                :{(Math.floor(editorContextData.previewTimestamp % 60)).toString().padStart(2, '0')}
                :{Math.floor(((editorContextData.previewTimestamp % 1000) % 1) * 1000).toString().padStart(3, '0')}
                </div>
                <div
                    onClick={() => {
                        if(editorContextData.isAutoplaying) editorService.stopAutoPlayback();
                        else editorService.startAutoPlaybackFrom(editorContextData.previewTimestamp);
                        updateEditorContext({
                            isAutoplaying: !editorContextData.isAutoplaying
                        })
                    }}
                    className={'flex justify-center items-center hover:cursor-pointer'}
                >
                    {editorContextData.isAutoplaying ? <Stop fontSize={"large"} /> : <PlayArrow fontSize={"large"} />}
                </div>
            </div>
        </div>
    )
}