import InputParameters from "../ParameterTypes/InputParameters.ts";

export default function TextInput({label, onInput, className, value}: InputParameters) {
    let classes = "text-sm p-1 px-2 border-1 select-none focus:outline-none";
    if (className) {
        classes += className;
    }

    return (
        <label className={"flex flex-col"}>
            <span>{label}</span>
            <input
                value={value}
                type="text"
                className={classes}
                onChange={(str) => onInput ? onInput(str.target.value ?? "") : null }
            />
        </label>
    );
}