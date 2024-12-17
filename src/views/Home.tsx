import SplashScreenAnimation from "../components/SplashScreenAnimation.tsx";

export function Home(): JSX.Element {
    return (
        <div className={"select-none w-full h-full flex justify-center items-center"}>
            <div className={"bg-darkGray w-2/3 aspect-video flex flex-row border-2 border-white"}>
                <div className={"h-full w-1/2 p-3 text-white overflow-hidden"}>
                    <div className={"w-full text-left"}>
                        <p className={"font-light text-2xl line-through"}>Adobe</p>
                        <p className={"font-bold text-6xl"}>Curveimator CC</p>
                    </div>
                    <div className={"w-full mt-20 p-4"}>
                        <p className={"text-3xl p-4 hover:cursor-pointer hover:bg-slate-500 rounded-2xl px-7"}>
                            Stwórz nowy projekt
                        </p>
                        <p className={"text-3xl p-4 opacity-45 rounded-2xl px-7"}>
                            Otwórz projekt
                        </p>
                    </div>
                </div>
                <div className={"h-full w-1/2"}>
                    <SplashScreenAnimation />
                </div>
            </div>
        </div>
    );
}