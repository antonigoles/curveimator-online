import {RefObject, useEffect, useRef} from "react";
import v2 from "../core/Math/v2.ts";
import v3 from "../core/Math/v3.ts";

function animate(canvasRef: RefObject<HTMLCanvasElement>) {
    const triangles: { position: v3, speedBoost: number }[] = [];
    function drawTriangles(
        ctx: CanvasRenderingContext2D,
        count: number,
        width: number,
        height: number,
        timestamp: number,
    ) {
        // TODO: Scale this with screen, resize on window resize
        // #2 TODO: Perhaps implement a universal toWindowScaler function?
        const shift = timestamp / 10;
        const maxSize = 16;
        const zRange = 20;
        const minZ = 4;
        const maxSpeedBoost = 2.4;
        if (triangles.length <= 0) {
            for ( let i = 0; i < count; ++i) {
                triangles.push({
                    position: new v3(
                        Math.random() * width,
                        Math.random() * height,
                        minZ + Math.random() * zRange
                    ),
                    speedBoost: 1 + Math.random() * maxSpeedBoost
                });
                triangles.sort(
                    (a, b) => b.position.z - a.position.z
                );
            }
        }
        for ( const triangle of triangles ) {
            ctx.beginPath();
            const center = triangle.position
                .cutToV2()
                .plus(new v2(0, (shift/triangle.position.z)*triangle.speedBoost));
            const arrowTop = new v2(0, -(maxSize / (triangle.position.z/zRange)));
            center.y = center.y % (height + 2*arrowTop.length()) - arrowTop.length();
            const top = center.plus(arrowTop);
            const rightCorner = center.plus(v2.rotateBy( arrowTop, Math.PI * 2 / 3));
            const leftCorner = center.plus(v2.rotateBy( arrowTop, Math.PI * 4 / 3));
            ctx.moveTo(top.x, top.y);
            ctx.lineTo(rightCorner.x, rightCorner.y);
            ctx.lineTo(leftCorner.x, leftCorner.y);
            ctx.lineTo(top.x, top.y);
            const p = 1 + Math.cos((shift / 1000));
            const redColorStrength = (1-(triangle.position.z/zRange))**p * 255;
            const blueColorStrength = (1-(triangle.position.z/zRange))**(1+p) * 255;
            const greenColorStrength = (1-(triangle.position.z/zRange))**2 * 255;

            ctx.fillStyle = `rgba(${redColorStrength} ${blueColorStrength} ${greenColorStrength} / 255)`
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
        drawTriangles(
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
    useEffect(() => {
        animate(canvasRef);
    }, [])
    return <canvas ref={canvasRef} className={"w-full h-full"}></canvas>

}