import {RefObject, useRef} from "react";

function animate(canvasRef: RefObject<HTMLCanvasElement>) {
    const circles: { x: number; y: number; z: number; }[] = [];

    function drawCircles(
        ctx: CanvasRenderingContext2D,
        count: number,
        width: number,
        height: number,
        timestamp: number,
    ) {
        const shift = timestamp / 10;
        const maxSize = 16;
        const zRange = 20;
        const minZ = 4;
        if (circles.length <= 0) {
            for ( let i = 0; i < count; ++i) {
                circles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    z: minZ + Math.random() * zRange,
                });
                circles.sort(
                    (a, b) => b.z - a.z
                );
            }
        }
        for ( const circle of circles ) {
            ctx.beginPath();
            ctx.arc(
                circle.x + Math.sin(shift/circle.z / 200),
                (circle.y + shift/circle.z) % (height + 2*maxSize/(circle.z/zRange)) - maxSize/(circle.z/zRange),
                maxSize/(circle.z/zRange),
                0,
                2 * Math.PI
            );
            ctx.fillStyle = `rgba(${(1-(circle.z/zRange))**8 * 255} ${(1-(circle.z/zRange))**8 * 255} ${(1-(circle.z/zRange))**2 * 255} / 255)`
            ctx.fill();
        }
    }

    function onFrame(timestamp: number) {
        if(!canvasRef.current) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return null;
        canvasRef.current.width = canvasRef.current.clientWidth;
        canvasRef.current.height = canvasRef.current.clientHeight;
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.rect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.fillStyle = 'rgba(0 0 0 / 255)'
        ctx.fill()
        drawCircles(
            ctx,
            350,
            canvasRef.current.width,
            canvasRef.current.height,
            timestamp
        );
        requestAnimationFrame(onFrame)
    }

    requestAnimationFrame(onFrame);
}

export default function SplashScreenAnimation() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    animate(canvasRef);
    return <canvas ref={canvasRef} className={"w-full h-full"}></canvas>
}