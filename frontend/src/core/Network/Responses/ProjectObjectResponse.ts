import KeyframeResponse from "./KeyframeResponse.ts";

type ProjectObjectResponse = {
    id: number,
    name: string,
    type: string,
    serializedData: object,
    position: number[],
    rotation: number,
    scale: number,
    keyframes: KeyframeResponse[],
}

export default ProjectObjectResponse;