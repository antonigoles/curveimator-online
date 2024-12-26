import ComponentWithDimensions from "../../ParameterTypes/ComponentWithDimensions.ts";
import {useContext} from "react";
import {EditorContext, EditorContextType, EditorTools} from "../../../contexts/EditorContext.tsx";
import {Draw, PanToolAlt} from "@mui/icons-material";

function ObjectList(): JSX.Element {
    const {editorContextData, updateEditorContext} = useContext<EditorContextType>(EditorContext);
    const objects = editorContextData?.project?.getObjects();
    return (
        <div>
            {objects.map( obj => (
            <div
                onClick={()=>{
                    console.log(obj.getId(), editorContextData.selectedObjectId)
                    updateEditorContext({selectedObjectId: obj.getId()})
                }}
                key={obj.getId()}
                className={ 'select-none p-2 px-4 w-fulltruncate ' +
                    'hover:cursor-pointer hover:opacity-100 ' +
                    ` ${editorContextData.selectedObjectId == obj.getId() ? ' opacity-100 ':' opacity-45 '}`
                }
            >
                {obj.getName()}
            </div>
            ))}
        </div>
    )
}

function ToolList(): JSX.Element {
    const {editorContextData, updateEditorContext} = useContext<EditorContextType>(EditorContext);

    const tools = [
        {
            tool: EditorTools.Select,
            icon: PanToolAlt,
        },
        {
            tool: EditorTools.Bezier,
            icon: Draw,
        }
    ]

    return (
        <div className={'w-full p-2 flex flex-row justify-end border-b-2 border-lightGray'}>
            {tools.map(
                tool =>
                    (
                        <div
                            key={tool.tool}
                            onClick={() => {
                                updateEditorContext({ currentTool: tool.tool })
                            }}
                            className={
                            `p-4 rounded-full hover:opacity-100 hover:cursor-pointer ` +
                                `${editorContextData.currentTool === tool.tool?'opacity-100':'opacity-45'}`
                            }
                        >
                            <tool.icon fontSize={'medium'}/>
                        </div>
                    )
                )
            }
        </div>
    )
}

export default function LeftPanel({width, height}: ComponentWithDimensions): JSX.Element {
    return (
        <div style={{width: `${width}px`, height: `${height}px`}} className={`bg-darkGray`}>
            <ToolList />
            <ObjectList />
        </div>
    )
}