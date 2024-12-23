import ComponentWithDimensions from "../../ParameterTypes/ComponentWithDimensions.tsx";


export default function WorkingWindow({width, height}: ComponentWithDimensions): JSX.Element {
    return (
        <div style={{width: `${width}px`, height: `${height}px` }} className={`bg-darkGray`}>

        </div>
    )
}