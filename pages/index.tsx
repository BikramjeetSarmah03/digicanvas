import { useDraw } from "@/common/hooks/useDraw";
import { socket } from "@/common/lib/socket";
import { CtxOptions } from "@/types";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D>();

  const [size, setSize] = useState({ width: 0, height: 0 });
  const [options, setOptions] = useState<CtxOptions>({
    lineColor: "#000",
    lineWidth: 1,
  });
  const { handleStartDrawing, handleEndDrawing, handleDraw, isDrawing } =
    useDraw(options, ctxRef.current);

  const drawFromSocket = (
    socketMoves: [number, number][],
    socketOptions: CtxOptions
  ) => {
    const tempCtx = ctxRef.current;

    if (tempCtx) {
      tempCtx.lineWidth = socketOptions.lineWidth;
      tempCtx.strokeStyle = socketOptions.lineColor;

      tempCtx.beginPath();
      socketMoves.forEach(([x, y]) => {
        tempCtx.lineTo(x, y);
        tempCtx.stroke();
      });

      tempCtx.closePath();
    }
  };

  // to handle the size of the window
  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctxRef.current = ctx;
    }
  }, [options.lineColor, options.lineWidth]);

  useEffect(() => {
    let movesToDrawLater: [number, number][] = [];
    let optionsToUseLater: CtxOptions = { lineColor: "", lineWidth: 0 };

    socket.on("socket_draw", (movesToDraw, socketOptions) => {
      if (ctxRef.current && !isDrawing) {
        drawFromSocket(movesToDraw, socketOptions);
      } else {
        movesToDrawLater = movesToDraw;
        optionsToUseLater = socketOptions;
      }
    });

    return () => {
      socket.off("socket_draw");

      if (movesToDrawLater.length) {
        drawFromSocket(movesToDrawLater, optionsToUseLater);
      }
    };
  }, [isDrawing]);

  return (
    <>
      <Head>
        <title>Digicanvas</title>
      </Head>

      <main className="flex h-full w-full items-center justify-center">
        <button
          onClick={() => setOptions({ lineColor: "blue", lineWidth: 5 })}
          className="absolute bg-black text-white px-4 py-2">
          Blue
        </button>

        <canvas
          className="h-full w-full"
          ref={canvasRef}
          onMouseDown={(e) => handleStartDrawing(e.clientX, e.clientY)}
          onMouseUp={handleEndDrawing}
          onMouseMove={(e) => handleDraw(e.clientX, e.clientY)}
          onTouchStart={(e) => {
            handleStartDrawing(
              e.changedTouches[0].clientX,
              e.changedTouches[0].clientY
            );
          }}
          onTouchEnd={handleEndDrawing}
          onTouchMove={(e) => {
            handleDraw(
              e.changedTouches[0].clientX,
              e.changedTouches[0].clientY
            );
          }}
          width={size.width}
          height={size.height}
        />
      </main>
    </>
  );
}
