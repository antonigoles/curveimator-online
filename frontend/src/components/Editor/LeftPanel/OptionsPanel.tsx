import componentWithDimensions from "../../ParameterTypes/ComponentWithDimensions.ts";
import {editorService} from "../../../core/DIContainer.tsx";
import {createPortal} from "react-dom";
import {useState} from "react";
import Button from "../../input/Button.tsx";
import ModalParameters from "../../ParameterTypes/ModalParameters.ts";
import TextInput from "../../input/TextInput.tsx";
import {clamp} from "../../../core/Math/utils.ts";

function ExportModal({ setShow }: Partial<ModalParameters>): JSX.Element {
    const [isExportRunning, setIsExportRunning] = useState(false);

    const [bitrate, setBitrate] = useState(133500000);
    const [from, setFrom] = useState(0);
    const [to, setTo] = useState(60000);


    async function runExport() {
        setIsExportRunning(true);
        if(from > to) {
            setFrom(to);
            setIsExportRunning(false);
            return;
        }
        console.log("Exporting with", from, to, bitrate)
        const url = await editorService.exportToVideoAndGetURL(from, to, bitrate);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
            'download',
            `exported-${Date.now()}.mp4`,
        );
        document.body.appendChild(link);
        link.click();
        if(link.parentNode) link.parentNode.removeChild(link);
        setIsExportRunning(false);
        if(setShow) setShow(false);
    }

    return createPortal(
        <div className={"top-0 left-0 z-50 backdrop-blur absolute w-full h-full flex items-center justify-center backdrop-brightness-50"}>
            <div className={"text-white bg-darkGray border-1 "}>
                { isExportRunning ?
                    <div className={'flex p-2 flex-col gap-4 items-center justify-center'}>
                        <div>Trwa renderowanie... (Tempo 1:1)</div>
                        <div className={'w-[50px] h-[50px] animate-spin rounded-bl-full rounded-br-full  border-b-2 border-t-0'}></div>
                    </div>
                    :
                    <>
                        <div className={"w-[300px] p-2"}>
                            <TextInput onInput={e => {
                                if (isNaN(Number(e))) return;
                                setBitrate(Number(e));
                            }} label={"bitrate (bps)"} value={bitrate}/>

                            <TextInput onInput={e => {
                                if (isNaN(Number(e))) return;
                                setFrom(clamp(0, 60000, Number(e)));
                            }} label={"Eksportuj od... (ms)"} value={from}/>

                            <TextInput onInput={e => {
                                if (isNaN(Number(e))) return;
                                setTo(clamp(0, 60000, Number(e)));
                            }} label={"...do (ms)"} value={to}/>

                        </div>
                        <div className={"w-[300px] flex justify-between"} >
                            <Button label={"Anuluj"} onInput={() => {
                                if(setShow) setShow(false)
                            }}/>
                            <Button label={"Eksportuj"} onInput={runExport}/>
                        </div>
                    </>
                }
            </div>
        </div>
    , document.body);
}

export default function OptionsPanel({height, width}: componentWithDimensions): JSX.Element {
    const [displayExportModal, setDisplayExportModal] = useState(false);

    return (
        <div style={{height, width}} className={'flex items-center px-2'}>
            {displayExportModal && <ExportModal setShow={setDisplayExportModal}/>}
            <div
                onClick={() => setDisplayExportModal(true)}
                className={"hover:cursor-pointer hover:bg-darkGray px-2 py-1 rounded-xl text-sm bg-blackGray flex select-none"}>
                Eksportuj
            </div>
        </div>
    )
}