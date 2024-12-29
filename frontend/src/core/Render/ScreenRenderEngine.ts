import RenderableObject from "./RenderableObject.ts";
import v2 from "../Math/v2.tsx";
import Color from "../Math/color.tsx";

export enum EngineState {
    WAITING_FOR_INJECT = 0,
    READY_TO_RENDER = 2
}

export class ScreenRenderEngine {
    private canvas: HTMLCanvasElement|null = null
    private ctx: CanvasRenderingContext2D|null = null

    private renderCallbackQueue: ((ctx: CanvasRenderingContext2D) => void)[] = [];
    private renderableObjects: RenderableObject[] = [];

    private engineState = EngineState.WAITING_FOR_INJECT;

    private backgroundColor: string = `rgb(0, 0, 0)`;

    private lastFrameEditorTime: number = 0;
    private currentFrameEditorTime: number = 0;

    constructor() {
        this.renderLoop = this.renderLoop.bind(this);
        this.renderLoop()
    }

    injectCanvas(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if(!ctx) {
            throw new Error('Error while trying to retrieve context from canvas element');
        }
        this.ctx = ctx;
        this.engineState = EngineState.READY_TO_RENDER;
    }

    getState(): EngineState {
        return this.engineState;
    }

    private preProcessScene(): void
    {
        if(!this.ctx || !this.canvas) return;
        // clear scene
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // draw background
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    addRenderableObject(object: RenderableObject): void
    {
        this.renderableObjects.push(object);
    }

    setProgress(time: number) {
        this.currentFrameEditorTime = time;
    }

    private drawLines(lines: v2[][], thickness: number, color: Color): void  {
        if(!this.ctx) throw new Error('Missing context error');
        if(!this.canvas) throw new Error('Missing canvas ref')
        this.ctx.beginPath();
        for (const line of lines) {
            this.ctx.moveTo(line[0].x, line[0].y);
            for ( let i = 1; i<line.length; i++ ) {
                this.ctx.lineTo((line[i].x/this.canvas.width)*1280, (line[i].y/this.canvas.height)*720);
            }
            this.ctx.strokeStyle = color.toString();
            this.ctx.lineWidth = thickness;
            this.ctx.stroke();
        }
    }

    private renderLoop(): number {
        if (!this.ctx) return requestAnimationFrame(this.renderLoop);
        this.preProcessScene();
        for (const renderable of this.renderableObjects) {
            // TODO: I need to implement some frame buffering
            const obj = renderable.getObjectInTime(this.currentFrameEditorTime);
            this.drawLines(obj.lines, obj.lineThickness, obj.color);
        }
        this.lastFrameEditorTime = this.currentFrameEditorTime;
        for ( const cb of this.renderCallbackQueue) {
            cb(this.ctx);
        }
        this.renderCallbackQueue = [];
        return requestAnimationFrame(this.renderLoop);
    }
}