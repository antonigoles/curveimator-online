export function LoadingFullScreen(): JSX.Element {

    return (
        <div className={'z-50 top-0 left-0 backdrop-brightness-50 backdrop-blur absolute w-full h-full flex items-center justify-center'}>
            <div className={'w-[50px] h-[50px] animate-spin rounded-bl-full rounded-br-full  border-b-2 border-t-0'}></div>
        </div>
    );
}