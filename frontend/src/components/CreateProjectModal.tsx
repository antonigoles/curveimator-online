import ModalParameters from "./ParameterTypes/ModalParameters.ts";
import {createPortal} from "react-dom";
import Button from "./input/Button.tsx";
import TextInput from "./input/TextInput.tsx";
import {useContext, useEffect, useState} from "react";
import {randomName} from "../core/UI/utils.ts";
import {RouteContext, RouteContextData, Views} from "../contexts/RouterContext.tsx";

function createProject(name: string, routerContext: RouteContextData): void {
    routerContext.updateRoute(
        Views.Editor,
        {
            isNewProject: true,
            projectName: name
        }
    )
}

export default function CreateProjectModal({show, setShow}: ModalParameters): JSX.Element {
    const routerContext = useContext<RouteContextData>(RouteContext);

    const [name, setName] = useState(randomName());
    function hide() { setShow(false) }

    useEffect(()=>{
        setName(randomName())
    }, [show])

    if (!show) return <></>;
    return createPortal(
        <div className={"top-0 left-0 backdrop-blur absolute w-full h-full flex items-center justify-center"}>
            <div className={"text-white bg-darkGray border-1 "}>
                <div className={"select-none w-full text-4xl p-4 font-medium"}> Stwórz nowy projekt </div>
                <div className={"select-none p-4 w-full"}>
                    <TextInput
                        value={name}
                        onInput={(stringInput) => setName(stringInput ?? "")}
                        label={"Nazwa projektu"}
                    />
                </div>
                <div className={"select-none w-full flex flex-row justify-between p-4"}>
                    <Button onInput={hide} label={"Anuluj"}></Button>
                    <Button onInput={() => createProject(name, routerContext)} label={"Stwórz"}></Button>
                </div>
            </div>
        </div>
    , document.body);
}