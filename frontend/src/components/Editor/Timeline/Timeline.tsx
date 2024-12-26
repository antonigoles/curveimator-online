import ComponentWithDimensions from "../../ParameterTypes/ComponentWithDimensions.ts";

export default function Timeline({width, height}: ComponentWithDimensions): JSX.Element {
    return (
        <div style={{width: `${width}px`, height: `${height}px` }} className={`bg-darkGray`}>

        </div>
    )
}