import RenderableObject from "./RenderableObject.ts";
import Color from "../Math/color.ts";
import Arc from "./Arc.ts";
import Shape from "./Shape.ts";
import {Primitive} from "./ObjectInTime.ts";
import {clamp} from "../Math/utils.ts";
import v2 from "../Math/v2.ts";
import ProjectObject from "../Editor/Entities/ProjectObject.ts";
import {Project} from "../Editor/Entities/Project.ts";

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

    private backgroundColor: Color = new Color(0, 0, 0, 1);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    private lastFrameEditorTime: number = 0;
    private currentFrameEditorTime: number = 0;

    constructor() {
        this.renderLoop = this.renderLoop.bind(this);
        requestAnimationFrame(this.renderLoop)
    }

    getCanvas(): HTMLCanvasElement|null {
        return this.canvas;
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
        this.ctx.fillStyle = this.backgroundColor.toString();
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    addToRenderQueue(cb: (ctx: CanvasRenderingContext2D) => void): void
    {
        this.renderCallbackQueue.push(cb);
    }

    addRenderableObject(object: RenderableObject): void
    {
        this.renderableObjects.push(object);
    }

    clearRenderObjects(): void
    {
        this.renderableObjects = [];
    }

    setProgress(time: number) {
        this.currentFrameEditorTime = time;
    }

    getProgress(): number {
        return this.currentFrameEditorTime
    }

    private drawPrimitives(objects: Primitive[]): void  {
        if(!this.ctx) throw new Error('Missing context error');
        if(!this.canvas) throw new Error('Missing canvas ref')
        for (const object of objects) {
            if(object.type === 'Shape') {
                const shape = object as Shape;
                this.ctx.beginPath();
                this.ctx.moveTo(shape.points[0].x, shape.points[0].y);
                let limit = shape.points.length;
                let distanceLeft=0;
                if (shape.strokeProgress !== undefined) {
                    let totalDistance = 0;
                    for ( let i = 1; i<shape.points.length; i++ ) {
                        totalDistance += shape.points[i].minus(shape.points[i-1]).length();
                    }
                    let distance = 0;
                    for ( let i = 1; i<shape.points.length; i++ ) {
                        distance += shape.points[i].minus(shape.points[i-1]).length();
                        if(distance >= totalDistance * clamp(0, 1, shape.strokeProgress)) {
                            distanceLeft = distance - totalDistance * clamp(0, 1, shape.strokeProgress);
                            limit=i;
                            break;
                        }
                    }
                }
                for ( let i = 1; i<limit; i++ ) {
                    this.ctx.lineTo((shape.points[i].x/this.canvas.width)*1280, (shape.points[i].y/this.canvas.height)*720);
                }
                if(distanceLeft>0) {
                    const prev = new v2((shape.points[limit-1].x/this.canvas.width)*1280, (shape.points[limit-1].y/this.canvas.height)*720)
                    const next = new v2((shape.points[limit].x/this.canvas.width)*1280, (shape.points[limit].y/this.canvas.height)*720);
                    const scaled = prev.plus( next.minus(prev).scale( 1 - (distanceLeft / next.minus(prev).length()) ) );
                    this.ctx.lineTo(scaled.x, scaled.y);
                }
                if (shape.dashedLine !== undefined) {
                    this.ctx.setLineDash(shape.dashedLine)
                } else {
                    this.ctx.setLineDash([])
                }

                if (shape.strokeColor !== undefined) {
                    this.ctx.strokeStyle = shape.strokeColor.toString();
                    this.ctx.lineWidth = shape.strokeThickness
                    this.ctx.stroke();
                }

                if (shape.fillColor !== undefined) {
                    this.ctx.fillStyle = shape.fillColor.toString();
                    this.ctx.fill();
                }
                this.ctx.closePath();
            } else {
                const arc = object as Arc;
                this.ctx.beginPath();
                this.ctx.arc(arc.center.x, arc.center.y, arc.radius, 0, arc.angle);

                if (arc.strokeColor) {
                    this.ctx.strokeStyle = arc.strokeColor.toString();
                    this.ctx.lineWidth = arc.strokeThickness
                    this.ctx.stroke();
                }

                if (arc.fillColor) {
                    this.ctx.fillStyle = arc.fillColor.toString();
                    this.ctx.fill();
                }
                this.ctx.closePath();
            }
        }
    }

    private renderLoop(): number {
        if (!this.ctx) return requestAnimationFrame(this.renderLoop);
        this.preProcessScene();
        for (const renderable of this.renderableObjects) {
            // TODO: I need to implement some frame buffering
            const obj = renderable.getObjectInCurrentState();
            this.drawPrimitives(obj.primitivesToRender)
        }
        this.lastFrameEditorTime = this.currentFrameEditorTime;
        for ( const cb of this.renderCallbackQueue) {
            cb(this.ctx);
        }
        this.renderCallbackQueue = [];
        return requestAnimationFrame(this.renderLoop);
    }
}