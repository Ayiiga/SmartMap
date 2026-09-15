"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Volume2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speak } from "@/lib/speech";

interface LetterTracingProps {
  letter: string;
  onComplete?: () => void;
}

export function LetterTracing({ letter, onComplete }: LetterTracingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [completed, setCompleted] = useState(false);

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  }, []);

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const rect = canvas.getBoundingClientRect();
      const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
      const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#6c5ce7";
      ctx.lineTo(x, y);
      ctx.stroke();
    },
    [isDrawing],
  );

  const endDraw = useCallback(() => {
    setIsDrawing(false);
    setCompleted(true);
    onComplete?.();
  }, [onComplete]);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCompleted(false);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.div
        className="font-display text-8xl font-bold text-giga-purple/20 select-none"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        {letter}
      </motion.div>

      <div className="relative rounded-2xl border-2 border-dashed border-giga-purple/30 bg-white p-4 dark:bg-giga-surface">
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          className="touch-none cursor-crosshair rounded-xl"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
          aria-label={`Trace the letter ${letter}`}
        />
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" size="md" onClick={() => speak(`Letter ${letter}`)}>
          <Volume2 className="h-5 w-5" />
          Hear Sound
        </Button>
        <Button variant="outline" size="md" onClick={clear}>
          <RotateCcw className="h-5 w-5" />
          Clear
        </Button>
      </div>

      {completed && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-giga-green font-bold text-lg"
        >
          🎉 Great tracing!
        </motion.p>
      )}
    </div>
  );
}
