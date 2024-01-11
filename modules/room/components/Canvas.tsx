import { useMotionValue, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useKeyPressEvent } from "react-use";

import { useViewportSize } from "@/common/hooks/useViewportSize";
import { CANVAS_SIZE } from "@/common/constants/canvasSize";
import { useDraw } from "@/modules/room/hooks/canvas.hooks";
import { socket } from "@/common/lib/socket";
import { drawFromSocket } from "@/modules/room/helpers/canvas.helpers";
import { CtxOptions } from "@/types";

import Minimap from "./Minimap";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const smallCanvasRef = useRef<HTMLCanvasElement>(null);

  const [ctx, setCtx] = useState<CanvasRenderingContext2D>();
  const [dragging, setDragging] = useState<boolean>(false);
  const [, setMovedMinimap] = useState<boolean>(false);

  const { width, height } = useViewportSize();

  useKeyPressEvent("Control", (e) => {
    if (e.ctrlKey && !dragging) {
      setDragging(true);
    }
  });

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const copyCanvasToMinimap = () => {
    if (canvasRef.current) {
      smallCanvasRef.current
        ?.getContext("2d")
        ?.drawImage(
          canvasRef.current,
          0,
          0,
          CANVAS_SIZE.width,
          CANVAS_SIZE.height
        );
    }
  };

  const { handleStartDrawing, handleEndDrawing, handleDraw, isDrawing } =
    useDraw(ctx, dragging, -x.get(), -y.get(), copyCanvasToMinimap);

  useEffect(() => {
    const newCtx = canvasRef.current?.getContext("2d");
    if (newCtx) setCtx(newCtx);

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey && dragging) {
        setDragging(false);
      }
    };

    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [dragging]);

  useEffect(() => {
    let movesToDrawLater: [number, number][] = [];
    let optionsToUseLater: CtxOptions = { lineColor: "", lineWidth: 0 };

    socket.on("socket_draw", (movesToDraw, socketOptions) => {
      if (ctx && !isDrawing) {
        drawFromSocket(movesToDraw, socketOptions, ctx, copyCanvasToMinimap);
      } else {
        movesToDrawLater = movesToDraw;
        optionsToUseLater = socketOptions;
      }
    });

    return () => {
      socket.off("socket_draw");

      if (movesToDrawLater.length && ctx) {
        drawFromSocket(
          movesToDrawLater,
          optionsToUseLater,
          ctx,
          copyCanvasToMinimap
        );
      }
    };
  }, [isDrawing, ctx]);

  return (
    <div className="h-full w-full overflow-hidden">
      <motion.canvas
        ref={canvasRef}
        width={CANVAS_SIZE.width}
        height={CANVAS_SIZE.height}
        className={`bg-zinc-300 ${dragging && "cursor-move"}`}
        style={{ x, y }}
        drag={dragging}
        dragConstraints={{
          left: -(CANVAS_SIZE.width - width),
          right: 0,
          top: -(CANVAS_SIZE.height - height),
          bottom: 0,
        }}
        dragElastic={0}
        dragTransition={{ power: 0, timeConstant: 0 }}
        onMouseDown={(e) => handleStartDrawing(e.clientX, e.clientY)}
        onMouseUp={(e) => handleEndDrawing()}
        onMouseMove={(e) => handleDraw(e.clientX, e.clientY)}
        onTouchStart={(e) => {
          handleStartDrawing(
            e.changedTouches[0].clientX,
            e.changedTouches[0].clientY
          );
        }}
        onTouchEnd={handleEndDrawing}
        onTouchMove={(e) => {
          handleDraw(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        }}
      />
      <Minimap
        ref={smallCanvasRef}
        x={x}
        y={y}
        dragging={dragging}
        setMovedMinimap={setMovedMinimap}
      />
    </div>
  );
}
