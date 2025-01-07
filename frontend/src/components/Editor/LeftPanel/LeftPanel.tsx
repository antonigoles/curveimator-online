import ComponentWithDimensions from "../../ParameterTypes/ComponentWithDimensions.ts";
import {useContext, useState} from "react";
import {EditorContext, EditorContextType, EditorTools} from "../../../contexts/EditorContext.tsx";
import {Draw, OpenWith, PanToolAlt, PhotoSizeSelectSmall, ThreeSixty} from "@mui/icons-material";
import {editorService} from "../../../core/DIContainer.tsx";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';

function ObjectList(): JSX.Element {
    const [editingNameId, setEditingNameId] = useState<number|null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<number|null>(null);
    const {editorContextData, updateEditorContext} = useContext<EditorContextType>(EditorContext);
    if(!editorContextData?.project) return <></>
    const objects = [...editorContextData.project.getObjects()].reverse();
    return (
        <div className={'h-full w-full overflow-y-scroll'}>
            {objects.map( obj => (
            <div
                onClick={()=>{
                    setEditingNameId(null);
                    setDeleteConfirm(null);
                    editorService.changeSelectedObjectId(obj.getId())
                    updateEditorContext({selectedObjectId: obj.getId()})
                }}
                key={obj.getId()}
                className={
                    'transition-[height] flex hover:bg-blackGray w-full p-2 flex-row items-center content-between justify-between' +
                    ` ${editorContextData.selectedObjectId == obj.getId() ? ' bg-blackGray ':' '}` +
                    ` ${deleteConfirm === obj.getId() ? ' bg-red-500 hover:bg-red-500 ':' '}` +
                    ` ${deleteConfirm === obj.getId() ? ' h-[50px] ' : ' h-[30px] '} `
                }
            >
                <div
                    className={ 'select-none truncate w-2/3 h-full' +
                        'hover:cursor-pointer hover:opacity-100 ' +
                        ` ${deleteConfirm === obj.getId() || editorContextData.selectedObjectId == obj.getId() ? 
                            ' opacity-100 ':' opacity-45 '}` +
                        ` ${deleteConfirm === obj.getId() ? ' w-[90%] ':' '}`
                    }
                >
                    {deleteConfirm === obj.getId() ?
                        <p>Czy na pewno chcesz usunąć?</p>:
                    editingNameId === obj.getId() ?
                        <input
                            autoFocus={true}
                            type={"text"}
                            placeholder={obj.getName()}
                            onSubmit={console.log}
                            onKeyDown={ async e => {
                                if (e.key === "Enter") {
                                    // submit
                                    if (e.target && (e.target as HTMLInputElement).value) {
                                        obj.setName((e.target as HTMLInputElement).value)
                                        await editorService.updateObjectUniversal(obj);
                                    }
                                    setEditingNameId(null);
                                }
                            }}
                        />
                    : obj.getName()}
                </div>
                <div className={
                    'relative w-1/3 h-[30px] select-none flex flex-row items-center justify-end'
                }>
                    {deleteConfirm === obj.getId() ?
                        <CancelIcon
                            onClick={(e) => {
                                setDeleteConfirm(null)
                                editorService.changeSelectedObjectId(obj.getId())
                                updateEditorContext({selectedObjectId: obj.getId()})
                                e.stopPropagation();
                            }}
                            className={'hover:cursor-pointer'}
                            fontSize={'small'}
                        />
                        :
                        <EditIcon
                            onClick={(e) => {
                                setEditingNameId(obj.getId())
                                editorService.changeSelectedObjectId(obj.getId())
                                updateEditorContext({selectedObjectId: obj.getId()})
                                e.stopPropagation();
                            }}
                            className={'hover:cursor-pointer hover:opacity-100 opacity-45'}
                            fontSize={'small'}
                        />
                    }
                    <DeleteIcon
                        onClick={(e) => {
                            if (!(deleteConfirm === obj.getId())) {
                                setDeleteConfirm(obj.getId())
                                editorService.changeSelectedObjectId(obj.getId())
                                updateEditorContext({selectedObjectId: obj.getId()})
                            } else {
                                editorService.deleteObjectUniversal(obj);
                                setDeleteConfirm(null);
                                setEditingNameId(null);
                            }
                            e.stopPropagation();
                        }}
                        className={
                            'font-white hover:cursor-pointer  ' +
                            `${deleteConfirm === obj.getId() ? ' opacity-100 ' : 'hover:opacity-100 opacity-45'}`
                        }
                        // color={deleteConfirm === obj.getId() ? 'info' : 'error'}
                        fontSize={'small'}
                    />
                </div>
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
            tool: EditorTools.Transform,
            icon: OpenWith,
        },
        {
            tool: EditorTools.Rotate,
            icon: ThreeSixty,
        },
        {
            tool: EditorTools.Scale,
            icon: PhotoSizeSelectSmall,
        },
        {
            tool: EditorTools.ControlPointEditor,
            icon: LocationSearchingIcon
        },
        {
            tool: EditorTools.Bezier,
            icon: Draw,
        }
    ]

    return (
        <div className={'w-full p-2 flex flex-row justify-center border-b-2 border-lightGray flex-wrap '}>
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
        <div style={{width: `${width}px`, height: `${height}px`}} className={`bg-darkGray flex flex-col`}>
            <ToolList />
            <ObjectList />
        </div>
    )
}