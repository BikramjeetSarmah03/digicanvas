import { MotionValue, useMotionValue, motion } from "framer-motion";
import { Dispatch, SetStateAction, forwardRef, useEffect, useRef } from "react";

import { useViewportSize } from "@/common/hooks/useViewportSize";
import { CANVAS_SIZE } from "@/common/constants/canvasSize";

const Minimap = forwardRef<
  HTMLCanvasElement,
  {
    x: MotionValue<number>;
    y: MotionValue<number>;
    dragging: boolean;
    setMovedMinimap: Dispatch<SetStateAction<boolean>>;
  }
>(({ x, y, dragging, setMovedMinimap }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { height, width } = useViewportSize();

  const miniX = useMotionValue(0);
  const miniY = useMotionValue(0);

  useEffect(() => {
    miniX.on("change", (newX) => {
      if (!dragging) x.set(-newX * 10);
    });

    miniY.on("change", (newY) => {
      if (!dragging) y.set(-newY * 10);
    });

    return () => {
      miniX.clearListeners();
      miniY.clearListeners();
    };
  }, [dragging, miniX, miniY, x, y]);

  return (
    <div
      className="fixed right-10 top-10 z-50 border bg-white shadow-md"
      ref={containerRef}
      style={{
        width: CANVAS_SIZE.width / 10,
        height: CANVAS_SIZE.height / 10,
      }}>
      <canvas
        ref={ref}
        width={CANVAS_SIZE.width}
        height={CANVAS_SIZE.height}
        className="w-full h-full"
      />

      <motion.div
        drag
        dragConstraints={containerRef}
        dragElastic={0}
        dragTransition={{ power: 0, timeConstant: 0 }}
        onDragEnd={() => setMovedMinimap((prev: boolean) => !prev)}
        onDragStart={() => setMovedMinimap((prev) => !prev)}
        className="absolute top-0 left-0 cursor-grab border-2 border-black"
        style={{
          width: width / 10,
          height: height / 10,
          x: miniX,
          y: miniY,
        }}
        animate={{
          x: -x.get() / 10,
          y: -y.get() / 10,
        }}
        transition={{ duration: 0.1 }}></motion.div>
    </div>
  );
});

Minimap.displayName = "Minimap";

export default Minimap;
