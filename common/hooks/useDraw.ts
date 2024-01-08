import { CtxOptions } from "@/types";
import { useEffect, useState } from "react";

import { socket } from "@/common/lib/socket";

let moves: [number, number][] = [];

export const useDraw = (
  options: CtxOptions,
  ctx?: CanvasRenderingContext2D
) => {
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  useEffect(() => {
    if (ctx) {
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.lineWidth = options.lineWidth;
      ctx.strokeStyle = options.lineColor;
    }
  }, [ctx, options]);

  const handleStartDrawing = (x: number, y: number) => {
    if (!ctx) return;

    moves = [[x, y]];
    setIsDrawing(true);

    ctx.beginPath();
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleEndDrawing = () => {
    if (!ctx) return;

    socket.emit("draw", moves, options);
    setIsDrawing(false);
    ctx.closePath();
  };

  const handleDraw = (x: number, y: number) => {
    if (ctx && isDrawing) {
      moves.push([x, y]);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  return { isDrawing, handleStartDrawing, handleEndDrawing, handleDraw };
};
