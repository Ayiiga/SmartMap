"use client";

import { ChevronLeft, ChevronRight, Clock, X } from "lucide-react";
import { format } from "date-fns";
import { useSpaceCamStore } from "@/lib/spacecam/spacecam-store";

export function TimeTravelPanel() {
  const timeOpen = useSpaceCamStore((s) => s.timeOpen);
  const setTimeOpen = useSpaceCamStore((s) => s.setTimeOpen);
  const simulationTime = useSpaceCamStore((s) => s.simulationTime);
  const useSimulationTime = useSpaceCamStore((s) => s.useSimulationTime);
  const stepTime = useSpaceCamStore((s) => s.stepTime);
  const resetTime = useSpaceCamStore((s) => s.resetTime);

  if (!timeOpen) return null;

  return (
    <div className="pointer-events-auto absolute inset-x-3 top-28 z-40 mx-auto max-w-sm rounded-2xl border border-white/20 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300">
          <Clock className="h-3.5 w-3.5" /> Time Travel
        </div>
        <button
          type="button"
          onClick={() => setTimeOpen(false)}
          className="rounded-lg p-1 text-slate-400 hover:bg-white/10"
          aria-label="Close time travel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="text-center text-sm font-semibold text-white">
        {format(simulationTime, "MMM d, yyyy · HH:mm")}
      </p>
      {useSimulationTime && (
        <p className="mt-0.5 text-center text-[10px] text-amber-300">Simulated time — not real-time</p>
      )}

      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => stepTime(-1)}
          className="inline-flex items-center gap-1 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold"
          aria-label="Previous hour"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>
        <button
          type="button"
          onClick={resetTime}
          className="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950"
        >
          NOW
        </button>
        <button
          type="button"
          onClick={() => stepTime(1)}
          className="inline-flex items-center gap-1 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold"
          aria-label="Next hour"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex justify-center gap-2">
        <button type="button" onClick={() => stepTime(-24)} className="rounded-lg bg-white/5 px-3 py-1 text-xs font-semibold">
          −1 day
        </button>
        <button type="button" onClick={() => stepTime(24)} className="rounded-lg bg-white/5 px-3 py-1 text-xs font-semibold">
          +1 day
        </button>
      </div>
    </div>
  );
}
