import { useEffect, useState } from "react";
import { useOptions } from "@/common/recoil/options";

import { socket } from "@/common/lib/socket";

let moves: [number, number][] = [];

export const useDraw = (
  ctx: CanvasRenderingContext2D | undefined,
  blocked: boolean,
  movedX: number,
  movedY: number,
  handleEnd: () => void
) => {
  const options = useOptions();
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
    if (!ctx || blocked) return;

    moves = [[x + movedX, y + movedY]];
    setIsDrawing(true);

    ctx.beginPath();
    ctx.lineTo(x + movedX, y + movedY);
    ctx.stroke();
  };

  const handleEndDrawing = () => {
    if (!ctx || blocked) return;

    socket.emit("draw", moves, options);
    setIsDrawing(false);
    ctx.closePath();
    handleEnd();
  };

  const handleDraw = (x: number, y: number) => {
    if (!ctx || !isDrawing || blocked) return;

    moves.push([x + movedX, y + movedY]);
    ctx.lineTo(x + movedX, y + movedY);
    ctx.stroke();
  };

  return { isDrawing, handleStartDrawing, handleEndDrawing, handleDraw };
};
