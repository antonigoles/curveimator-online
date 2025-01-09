import ComponentWithDimensions from "../../ParameterTypes/ComponentWithDimensions.ts";
import {Dispatch, SetStateAction, useContext, useEffect, useRef, useState} from "react";
import {EditorContext, EditorContextType} from "../../../contexts/EditorContext.tsx";
import KeyframeableProperty from "../../../core/Editor/Entities/KeyframeableProperty.ts";
import useWindowDimensions from "../../useWindowDimensions.tsx";
import {ExpandMore} from "@mui/icons-material";
import Keyframe from "../../../core/Editor/Entities/Keyframe.ts";
import {editorService} from "../../../core/DIContainer.tsx";
import v2 from "../../../core/Math/v2.ts";
import {clamp} from "../../../core/Math/utils.ts";

type KeyframeElementParams = {
    frame: Keyframe,
    keyframeTableWidth: number,
    minTime: number,
    maxTime: number,
}


function KeyframeElement({minTime, maxTime, frame, keyframeTableWidth}: KeyframeElementParams): JSX.Element {
    const title = `${Math.floor(frame.getTime() / 60).toString().padStart(2, '0')}`+
                `:${(Math.floor(frame.getTime() % 60)).toString().padStart(2, '0')}`+
                `:${Math.floor(((frame.getTime() % 1000) % 1) * 1000).toString().padStart(3, '0')}`
    return (
        <div
            title={title}
            key={frame.getId()}
            style={{left: `${10 + ((frame.getTime()-minTime)/(maxTime-minTime)) * (keyframeTableWidth - 75)}px`, top: '7.5px'}}
            className={'hover:opacity-100 hover:cursor-pointer opacity-45 absolute h-[10px] aspect-square bg-white rotate-45'}
        ></div>
    )
}

type KeyframeLineParams = {
    keyframeTableWidth: number
    keyframeableProperty: KeyframeableProperty,
    minTime: number,
    maxTime: number,
}


function KeyframeLine({minTime, maxTime, keyframeTableWidth, keyframeableProperty}: KeyframeLineParams): JSX.Element {
    const [frames, setFrames] = useState<Keyframe[]>([]);
    const {editorContextData} = useContext<EditorContextType>(EditorContext);
    const {width} = useWindowDimensions()
    const [isExpanded, setIsExpanded] = useState(true);
    const [editingValue, setEditingValue] = useState(false);
    const selectedObject = editorService.getSelectedObject();

    function onEditorUpdate() {
        if(selectedObject && keyframeableProperty.isLeaf()) {
            setFrames(selectedObject.getFramesForPath(keyframeableProperty.getFullPropertyPath()))
        }
    }

    useEffect(()=>{
        onEditorUpdate();
        editorService.onEditorUpdate(onEditorUpdate)
        return () => {
            editorService.offEditorUpdate(onEditorUpdate)
        }
    },[editorContextData])

    const fieldValue = keyframeableProperty.isLeaf() && editorService
        .getSelectedObject()
        ?.getValueFromProperyPathAndTimeOrResolveToDefault(
            keyframeableProperty.getFullPropertyPath(),
            editorContextData.previewTimestamp
        ).toFixed(2);

    if(!selectedObject) return <></>;

    // is prop
    return keyframeableProperty.isLeaf() ? (
            <div className={'w-full select-none flex flex-row font-normal'}>
                <div
                    className={'h-[30px] border-b-[1px] border-b-lightGray box-border flex flex-row justify-between'}
                    style={{
                        width: `${width-keyframeTableWidth}px`,
                    }}
                >
                    <div
                        style={{
                            width: "75%",
                            paddingLeft: `${20*keyframeableProperty.nestDepth()}px`
                        }}
                    >
                        {keyframeableProperty.getPrettyName()}
                    </div>
                    <div onClick={() => setEditingValue(true)} className={'hover:cursor-text pr-2 flex flex-row justify-end items-center w-1/4 text-[12px] text-stone-400'}>
                        {editingValue ?
                        <input
                            className={'w-full outline-none'}
                            autoFocus={true}
                            type={"number"}
                            placeholder={fieldValue ? fieldValue : ""}
                            onSubmit={console.log}
                            onBlur={() => setEditingValue(false)}
                            onKeyDown={async e => {
                                if (e.key === "Enter") {
                                    // submit
                                    setEditingValue(false)
                                    if (e.target && (e.target as HTMLInputElement).value) {
                                        const value = Number((e.target as HTMLInputElement).value);
                                        if(isNaN(value)) {
                                            console.log("Oh no its a nan: ", value)
                                            return;
                                        }
                                        editorService.insertKeyframe(
                                            selectedObject?.getId(),
                                            keyframeableProperty.getFullPropertyPath(),
                                            value,
                                            editorContextData.previewTimestamp,
                                        )
                                        // obj.setName((e.target as HTMLInputElement).value)
                                        // await editorService.updateObjectUniversal(obj);
                                    }
                                    // setEditingNameId(null);
                                }
                            }}
                        />
                        : fieldValue}
                        {/*<div className={'h-[10px] rotate-45 aspect-square bg-black'}></div>*/}
                    </div>
                </div>
                <div style={{width: `${keyframeTableWidth}px`}}
                     className={`border-b-[1px] border-b-lightGray relative bg-blackGray h-[30px]`}>
                    {frames.map((frame: Keyframe) => (
                        <KeyframeElement minTime={minTime} maxTime={maxTime} keyframeTableWidth={keyframeTableWidth} key={frame.getId()} frame={frame}/>
                    ))}
                </div>
            </div>
        )
        :
        // is folder
        (
            <div className={'w-full select-none font-bold'} key={keyframeableProperty.getFullPropertyPath()}>
                <div className={'flex flex-row'}>
                    <div
                        onClick={() => setIsExpanded(!isExpanded)}
                        style={{
                            width: `${width-keyframeTableWidth}px`,
                            paddingLeft: `${25*keyframeableProperty.nestDepth()-20}px`,
                            backgroundColor: `rgba(16,16,16, ${(keyframeableProperty.nestDepth()/1.1)**(-1.2)})`
                        }}
                        className={`box-border hover:cursor-pointer h-[30px] flex items-center justify-start`}

                    >
                        <ExpandMore/>
                        <p >
                            {keyframeableProperty.getPrettyName()}
                        </p>
                    </div>
                    <div style={{width: `${keyframeTableWidth}px`}} className={`bg-blackGray`}></div>
                </div>
                { isExpanded &&
                <div className={'w-full select-none'}>
                    {keyframeableProperty.getChildren().map((child: KeyframeableProperty) => {
                        return <KeyframeLine
                            minTime={minTime} maxTime={maxTime}
                            key={child.getFullPropertyPath()}
                            keyframeTableWidth={keyframeTableWidth}
                            keyframeableProperty={child}
                        />
                    })}
                </div>
                }
            </div>
        )
}

type TimeNeedleParameters = {
    minPosition: number,
    maxPosition: number,
    height: number,
    minTime: number,
    maxTime: number,
}

function TimeNeedle({ minTime, maxTime, minPosition, maxPosition, height }: TimeNeedleParameters): JSX.Element {
    const dotRef = useRef<HTMLDivElement>(null);
    const timestampRef = useRef<HTMLDivElement>(null);
    const {editorContextData, updateEditorContext} = useContext<EditorContextType>(EditorContext);

    let isDragging = false;
    let isMouseDown = false;
    let mouseOver = false;
    let mouseOverOffTimer: NodeJS.Timeout|null = null;

    function handleMoseMove(event: MouseEvent) {
        if (editorService.isExporting()) return;
        if ( dotRef.current ) {
            const rect: DOMRect  = dotRef.current.getBoundingClientRect();
            const distY = Math.abs(event.clientY - (rect.top + rect.bottom)/2);
            const distX = Math.abs(event.clientX - (rect.left + rect.right)/2);
            if(distX < 22 && distY < 32.5) {
                if(mouseOverOffTimer) {
                    clearTimeout(mouseOverOffTimer);
                    mouseOverOffTimer = null;
                }
                mouseOver=true;
            } else {
                if (!mouseOverOffTimer) {
                    mouseOverOffTimer = setTimeout(() => {
                        mouseOver = false;
                        mouseOverOffTimer = null;
                    }, 200)
                }
            }

            if (mouseOver && !isDragging) {
                document.body.style.cursor = "ew-resize";
                if(isMouseDown) {
                    if(timestampRef.current) {
                        timestampRef.current.style.display = 'flex';
                    }
                    const xNorm = Math.max(Math.min(maxPosition, event.clientX), minPosition) - minPosition;
                    // console.log(maxPosition, minPosition)
                    // console.log((xNorm/(maxPosition-minPosition)) * 60)

                    // snap to the nearest 1/30 of a sec
                    const ts = minTime + (xNorm/(maxPosition-minPosition)) * (maxTime-minTime);
                    updateEditorContext({
                        previewTimestamp: Math.round( ts * 30 ) / 30
                    })
                    editorService.setPlayback(Math.round( ts * 30 ) / 30);
                }
            } else {
                if(timestampRef.current) {
                    timestampRef.current.style.display = 'none';
                }

                if(document.body.style.cursor == "ew-resize")
                    document.body.style.cursor = "inherit";
            }
        }

    }

    function handleMoseUp() {
        isMouseDown=false;
    }

    function handleMoseDown() {
        isMouseDown=true;
    }

    function handleDragStop() {
        isDragging = false;
    }

    function handleDrag() {
        isDragging = true;
    }

    useEffect(() => {
        window.addEventListener("mousemove", handleMoseMove);
        window.addEventListener("mousedown", handleMoseDown);
        window.addEventListener("mousedown", handleMoseMove);
        window.addEventListener("mouseleave", handleMoseDown);
        window.addEventListener("mouseup", handleMoseUp);
        window.addEventListener("drag", handleDrag)
        window.addEventListener("dragstart", handleDrag)
        window.addEventListener("dragend", handleDragStop)

        return () => {
            window.removeEventListener("mousemove", handleMoseMove);
            window.removeEventListener("mousedown", handleMoseDown);
            window.removeEventListener("mouseleave", handleMoseDown);
            window.removeEventListener("mouseup", handleMoseUp);
            window.removeEventListener("mousedown", handleMoseMove);
        }
    }, [minTime, maxTime, minPosition, maxPosition]);

    return (
        <div
            draggable={false}
            ref={dotRef}
            style={{
                left: `${-6 + minPosition + ((editorContextData.previewTimestamp-minTime)/(maxTime-minTime))*(maxPosition-minPosition)}px`,
                top: '-2.5px',
            }}
            className={'absolute z-50 w-[13px] h-[25px] rounded-full bg-yellow-200 shadow-2xl'}
        >
            <div
                ref={timestampRef}
                draggable={false}
                style={{ display: 'none', left: '-38px', top: '-36px' }}
                className={'shadow-md absolute bg-white text-black font-bold rounded-md select-none text-center px-2 py-1'}
            >
                {Math.floor(editorContextData.previewTimestamp / 60).toString().padStart(2, '0')}
                :{(Math.floor(editorContextData.previewTimestamp % 60)).toString().padStart(2, '0')}
                :{Math.floor(((editorContextData.previewTimestamp % 1000) % 1) * 1000).toString().padStart(3, '0')}
            </div>
            <div
                draggable={false}
                style={{ height: `${height}px`, left: '6px' }}
                className={'absolute w-[1px] bg-yellow-200'}
            ></div>
        </div>
    )
}

function TimelineResizeBar({ width, setMinTime, setMaxTime }: {
    width: number,
    setMinTime: Dispatch<SetStateAction<number>>,
    setMaxTime: Dispatch<SetStateAction<number>>,
}): JSX.Element {
    const wholebarRef = useRef<HTMLDivElement>();
    const leftBarRef = useRef<HTMLDivElement>();
    const middleBarRef = useRef<HTMLDivElement>();
    const rightBarRef = useRef<HTMLDivElement>();

    const [leftBarPosition, setLeftBarPosition] = useState(0);
    const [rightBarPosition, setRightBarPosition] = useState(60);
    const linesCount = 40;

    let mouseHoverLeft = false;
    let mouseHoverRight = false;

    let mouseDown=false;

    let grabbingLeft = false;
    let grabbingMiddle = false;
    let grabbingRight = false;

    function handleMouseMove(e: MouseEvent){
        if(!wholebarRef.current) return;
        if(!leftBarRef.current) return;
        if(!rightBarRef.current) return;
        const wholeBarRect = wholebarRef.current.getBoundingClientRect()

        const leftBoundingBox = leftBarRef.current.getBoundingClientRect();
        const rightBoundingBox = rightBarRef.current.getBoundingClientRect();


        const position = new v2(e.clientX, e.clientY);
        if(leftBarRef.current) {
            mouseHoverLeft = Math.abs(position.x - leftBoundingBox.x) < 15
                && Math.abs(position.y - leftBoundingBox.y) < leftBoundingBox.height/2;

            if(mouseDown && mouseHoverLeft && !grabbingRight && !grabbingMiddle) grabbingLeft = true;
            if(grabbingLeft) {
                const normalizedX = clamp(wholeBarRect.left, wholeBarRect.left + wholeBarRect.width, position.x) - wholeBarRect.left;
                const v = clamp(0, (rightBoundingBox.left-wholeBarRect.left)/(wholeBarRect.width) * 60 - 5, normalizedX/wholeBarRect.width * 60)
                setLeftBarPosition(v)
                setMinTime(v);
            }
        }

        if(rightBarRef.current) {
            mouseHoverRight = Math.abs(position.x - rightBoundingBox.x) < 15
                && Math.abs(position.y - rightBoundingBox.y) < rightBoundingBox.height/2;

            if(mouseDown && mouseHoverRight && !grabbingRight && !grabbingMiddle) grabbingRight = true;
            if(grabbingRight) {
                const normalizedX = clamp(wholeBarRect.left, wholeBarRect.left + wholeBarRect.width, position.x) - wholeBarRect.left;
                const v = clamp((leftBoundingBox.left-wholeBarRect.left)/(wholeBarRect.width) * 60 + 5, 60, normalizedX/wholeBarRect.width * 60)
                setRightBarPosition(v)
                setMaxTime(v);
            }
        }
    }

    function handleMouseDown() {
        mouseDown=true;
    }

    function handleMouseUp() {
        mouseDown=false;
        grabbingRight=false;
        grabbingLeft=false;
        grabbingMiddle=false;
    }

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp)
        window.addEventListener('mouseleave', handleMouseUp)
        window.addEventListener('mousedown', handleMouseDown)
        window.addEventListener('mousemove', handleMouseMove)

        return () => {
            window.removeEventListener('mouseup', handleMouseUp)
            window.removeEventListener('mouseleave', handleMouseUp)
            window.removeEventListener('mousedown', handleMouseDown)
            window.removeEventListener('mousemove', handleMouseMove)
        }
    }, []);

    return (
        <div ref={wholebarRef} style={{width: `${width}px`}} className={'select-none relative h-2/3 bg-blackGray'}>
            <div className={'absolute h-full w-full'}>
                {[...new Array(linesCount)].map((_, i) => (
                    <div
                        key={i}
                        style={{
                            bottom: '0px',
                            left: `${width * i/linesCount}px`,
                            height: `${i % 4 == 0 ? '50' : '25'}%`
                        }}
                        className={'absolute w-[1px] bg-white'}
                    ></div>
                ))}
            </div>
            <div
                ref={leftBarRef}
                className={'absolute bg-red-600 w-[4px] h-full'}
                style={{left: `${width * leftBarPosition / 60}px`}}
            ></div>
            <div
                ref={middleBarRef}
                className={'absolute bg-lightGray opacity-45 w-[2px] h-full'}
                style={{
                    width: `${width * (rightBarPosition - leftBarPosition) / 60}px`,
                    left: `${4 + width * leftBarPosition / 60}px`
                }}
            ></div>
            <div
                ref={rightBarRef}
                className={'absolute bg-red-600 w-[4px] h-full'}
                style={{left: `${width * rightBarPosition / 60}px`}}
            ></div>
        </div>
    )
}

export default function Timeline({keyframeTableWidth, height}: {
    keyframeTableWidth: number,
    minTime?: number,
    maxTime?: number,
} & ComponentWithDimensions): JSX.Element {
    const {width} = useWindowDimensions();
    const {updateEditorContext, editorContextData} = useContext<EditorContextType>(EditorContext);
    const [keyframeProperties, setKeyframeProperties] = useState<KeyframeableProperty[]>([]);
    const [minTime, setMinTime] = useState(0)
    const [maxTime, setMaxTime] = useState(60)

    useEffect(() => {

        const selectedObject = editorService.getSelectedObject();
        if(selectedObject) {
            setKeyframeProperties(
                selectedObject.getKeyframableProperties()
            );
        } else {
            setKeyframeProperties([]);
        }
    }, [editorContextData]);

    useEffect(() => {
        updateEditorContext({
            previewTimestamp: clamp(minTime, maxTime, editorContextData.previewTimestamp)
        })
    }, [minTime, maxTime]);

    return (
        <div style={{height: `${height-25}px`, marginTop: '25px'}} className={`relative w-full bg-darkGray flex flex-col`}>
            <TimeNeedle minTime={minTime} maxTime={maxTime} minPosition={width-keyframeTableWidth + 15} maxPosition={width-60} height={height-25}/>
            <div className={'flex h-[40px] z-10 flex-row shadow-lg'}>
                <div style={{width: `${width - keyframeTableWidth}px`, height: '100%'}} className={'px-1 flex justify-center items-center'}>
                    <TimelineResizeBar setMinTime={setMinTime} setMaxTime={setMaxTime} width={0.9*(width - keyframeTableWidth)}/>
                </div>
                <div style={{width: `${keyframeTableWidth}px`, height: '100%'}} className={'relative border-1'}>
                    {[...(new Array(Math.round(Math.max(1, (maxTime - minTime) * 2))))].map((_, i) =>
                        <div
                            key={i}
                            style={{
                                bottom: `0px`,
                                left: `${Math.floor(15 + (i / ((maxTime - minTime) * 2 - 1)) * (keyframeTableWidth - 75)) - 1}px`,
                                height: `${i % 2 == 0 ? '55%' : '25%'}`
                            }}
                            className={'absolute w-[1px] bg-white'}
                        ></div>
                    )}
                </div>
            </div>
            <div style={{height: `${height - 40}px`}} className={'flex flex-col overflow-y-scroll scroll-m-72'}>
                {
                    keyframeProperties.map((p: KeyframeableProperty) =>
                        <KeyframeLine minTime={minTime} maxTime={maxTime}
                                      key={p.getFullPropertyPath()} keyframeableProperty={p}
                                      keyframeTableWidth={keyframeTableWidth}/>
                    )
                }
                <div className={'flex flex-1'}>
                    <div style={{width: `${width - keyframeTableWidth}px`, height: '100%'}}></div>
                    <div style={{width: `${keyframeTableWidth}px`, height: '100%'}} className={'bg-blackGray'}></div>
                </div>
            </div>
        </div>
    )
}