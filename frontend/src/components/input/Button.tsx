import InputParameters from "../ParameterTypes/InputParameters.ts";

export default function Button({label, onInput, className, disabled}: InputParameters) {
    let classes = "text-lg p-2 rounded-2xl px-4 select-none ";
    if (className) {
        classes += className;
    }

    if (disabled) {
        classes += " opacity-45"
    } else {
        classes += " hover:cursor-pointer hover:bg-slate-500";
    }

    return (
        <p onClick={() => { if ( onInput ) onInput() }}
           className={classes}>
            {label}
        </p>
    )
}