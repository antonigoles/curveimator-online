type InputParameters = {
    label: string | JSX.Element;
    onInput?: ((stringInput?: string) => void) | ((stringInput?: string) => Promise<void>) ;
    className?: string;
    disabled?: boolean;
    value?: string | number | readonly string[] | undefined;
}

export default InputParameters;
