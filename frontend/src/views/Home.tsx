import SplashScreenAnimation from "../components/SplashScreenAnimation.tsx";
import Button from "../components/input/Button.tsx";
import CreateProjectModal from "../components/CreateProjectModal.tsx";
import {useState} from "react";



export function Home(): JSX.Element {
    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);

    async function showCreateNewProjectModal(): Promise<void> {
        setShowCreateProjectModal(true);
    }

    return (
        <div className={"select-none w-full h-full flex justify-center items-center"}>
            <div className={"bg-darkGray w-[1200px] aspect-video flex flex-row border-2 border-white"}>
                <div className={"h-full w-1/2 p-3 text-white overflow-hidden"}>
                    <div className={"w-full text-left"}>
                        <p className={"font-light text-2xl line-through"}>Adobe</p>
                        <p className={"font-bold text-6xl"}>Curveimator CC</p>
                    </div>
                    <div className={"w-full mt-20 p-4"}>
                        <Button label={"Stwórz nowy projekt"} onInput={showCreateNewProjectModal}/>
                        <Button disabled={true} label={"Otwórz projekt"} />
                    </div>
                </div>
                <div className={"h-full w-1/2"}>
                    <SplashScreenAnimation />
                </div>
            </div>
            {<CreateProjectModal show={showCreateProjectModal} setShow={setShowCreateProjectModal}/>}
        </div>
    );
}