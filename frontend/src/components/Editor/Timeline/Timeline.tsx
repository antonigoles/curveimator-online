import ComponentWithDimensions from "../../ParameterTypes/ComponentWithDimensions.ts";
import {useContext, useEffect, useRef, useState} from "react";
import {EditorContext, EditorContextType} from "../../../contexts/EditorContext.tsx";
import KeyframeableProperty from "../../../core/Editor/Entities/KeyframeableProperty.ts";
import useWindowDimensions from "../../useWindowDimensions.tsx";
import {ExpandMore} from "@mui/icons-material";

type KeyframeLineParams = {
    keyframeTableWidth: number
    keyframeableProperty: KeyframeableProperty,
}

function KeyframeLine({keyframeTableWidth, keyframeableProperty}: KeyframeLineParams): JSX.Element {
    const {editorContextData} = useContext<EditorContextType>(EditorContext);
    const {width} = useWindowDimensions()
    const [isExpanded, setIsExpanded] = useState(true);
    const frames = keyframeableProperty.isLeaf() && editorContextData.selectedObjectId ?
        editorContextData
            .project
            .getObjectById(editorContextData.selectedObjectId)
            .getFramesForPath(keyframeableProperty.getFullPropertyPath())
        : []

    // is prop
    return keyframeableProperty.isLeaf() ? (
            <div className={'w-full select-none flex flex-row font-normal'}>
                <div
                    style={{
                        width: `${width-keyframeTableWidth}px`,
                        paddingLeft: `${20*keyframeableProperty.nestDepth()}px`
                    }}
                    className={`h-[30px] border-b-[1px] border-b-lightGray box-border`}
                >
                    {keyframeableProperty.getPrettyName()}
                </div>
                <div style={{width: `${keyframeTableWidth}px`}} className={`border-b-[1px] border-b-lightGray relative bg-blackGray h-[30px]`}>
                    {frames.map( frame => (
                        <div
                            key={frame.getId()}
                            style={{ left: `${15 + (frame.getTime()/60) * (keyframeTableWidth-40)}px`, top: '7.5px' }}
                            className={'hover:opacity-100 hover:cursor-pointer opacity-45 absolute h-1/2 aspect-square bg-white rotate-45'}
                        ></div>
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
}

function TimeNeedle({ minPosition, maxPosition, height }: TimeNeedleParameters): JSX.Element {
    const dotRef = useRef<HTMLDivElement>(null);
    const {editorContextData, updateEditorContext} = useContext<EditorContextType>(EditorContext);

    let isMouseDown = false;
    let mouseOver = false;
    let mouseOverOffTimer: number|null = null;

    function handleMoseMove(event: MouseEvent) {
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

            if (mouseOver) {
                document.body.style.cursor = "pointer";
                if(isMouseDown) {
                    const xNorm = Math.max(Math.min(maxPosition, event.clientX), minPosition) - minPosition;
                    updateEditorContext({
                        previewTimestamp: (xNorm/(maxPosition-minPosition)) * 60
                    })
                }
            } else {
                if(document.body.style.cursor == "pointer")
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

    useEffect(() => {
        window.addEventListener("mousemove", handleMoseMove);
        window.addEventListener("mousedown", handleMoseDown);
        window.addEventListener("mouseleave", handleMoseDown);
        window.addEventListener("mouseup", handleMoseUp);

        return () => {
            window.removeEventListener("mousemove", handleMoseMove);
            window.removeEventListener("mousedown", handleMoseDown);
            window.removeEventListener("mouseleave", handleMoseDown);
            window.removeEventListener("mouseup", handleMoseUp);
        }
    }, []);

    function getX() {
        return -6 + minPosition + (editorContextData.previewTimestamp/60)*(maxPosition-minPosition)
    }

    return (
        <div
            ref={dotRef}
            style={{
                left: `${getX()}px`,
                top: '-2.5px',
            }}
            className={'absolute z-50 w-[12px] h-[45px] rounded-full bg-yellow-200 shadow-2xl'}
        >
            <div
                style={{ left: '-22px', top: '-36px' }}
                className={'shadow-md absolute bg-white text-black font-bold rounded-md select-none text-center px-2 py-1'}
            >
                {Math.floor(editorContextData.previewTimestamp / 60).toString().padStart(2, '0')}
                :{(Math.round(editorContextData.previewTimestamp % 60)).toString().padStart(2, '0')}
            </div>
            <div
                style={{ height: `${height}px`, left: '6px' }}
                className={'absolute w-[1px] bg-yellow-200'}
            ></div>
        </div>
    )
}

export default function Timeline({keyframeTableWidth, height}: {
    keyframeTableWidth: number
} & ComponentWithDimensions): JSX.Element {
    const {width} = useWindowDimensions()
    const {editorContextData} = useContext<EditorContextType>(EditorContext);
    return (
        <div style={{height: `${height}px`, marginTop: '25px'}} className={`relative w-full bg-darkGray flex flex-col`}>
            <TimeNeedle minPosition={width-keyframeTableWidth + 15} maxPosition={width} height={height}/>
            <div className={'flex h-[40px] z-10 flex-row shadow-lg'}>
                <div style={{width: `${width - keyframeTableWidth}px`, height: '100%'}}></div>
                <div style={{width: `${keyframeTableWidth}px`, height: '100%'}} className={'relative border-1'}>
                    {[...(new Array(120))].map((_, i) =>
                        <div
                            style={{
                                bottom: `0px`,
                                left: `${15 + (i/120) * (keyframeTableWidth-40)}px`,
                                height: `${i%2==0?'55%':'25%'}`
                            }}
                            className={'absolute w-[1px] bg-white'}
                        ></div>
                    )}
                </div>
            </div>
            <div style={{ height: `${height-40}px`}} className={'flex flex-col overflow-y-scroll scroll-m-72'}>
                {
                    editorContextData.selectedObjectId && editorContextData
                        .project
                        .getObjectById(editorContextData.selectedObjectId)
                        .getKeyframableProperties()
                        .map(p =>
                            <KeyframeLine key={p.getFullPropertyPath()} keyframeableProperty={p}
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