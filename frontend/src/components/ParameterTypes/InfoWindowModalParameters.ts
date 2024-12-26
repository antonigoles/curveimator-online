type InfoWindowModalParameters = {
    title: string | JSX.Element,
    content: string | JSX.Element,
    onClose: () => void;
    show: boolean,
}

export default InfoWindowModalParameters;
