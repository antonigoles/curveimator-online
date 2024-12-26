import {createPortal} from "react-dom";
import Button from "./input/Button.tsx";
import InfoWindowModalParameters from "./ParameterTypes/InfoWindowModalParameters.ts";

export default function InfoWindowModal(
    {show, onClose, title, content}: InfoWindowModalParameters
): JSX.Element {
    if (!show) return <></>;
    return createPortal(
        <div className={"top-0 left-0 backdrop-blur absolute w-full h-full flex items-center justify-center backdrop-brightness-50"}>
            <div className={"text-white bg-darkGray border-1"}>
                <div className={"select-none w-full text-4xl p-4 font-medium"}> {title} </div>
                <div className={"select-none p-4 w-full"}>
                    {content}
                </div>
                <div className={"select-none w-full flex flex-row justify-end p-4"}>
                    <Button onInput={onClose} label={"OK"}></Button>
                </div>
            </div>
        </div>
    , document.body);
}