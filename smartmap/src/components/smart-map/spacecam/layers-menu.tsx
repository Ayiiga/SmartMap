"use client";

import { Layers, X } from "lucide-react";
import { useSpaceCamStore, type SpaceCamLayers } from "@/lib/spacecam/spacecam-store";
import { cn } from "@/lib/utils";

const LAYER_ITEMS: { key: keyof SpaceCamLayers; label: string }[] = [
  { key: "stars", label: "Stars" },
  { key: "constellations", label: "Constellations" },
  { key: "planets", label: "Planets" },
  { key: "moon", label: "Moon" },
  { key: "satellites", label: "Satellites" },
  { key: "comets", label: "Comets" },
  { key: "deepSky", label: "Deep Sky" },
  { key: "milkyWay", label: "Milky Way" },
  { key: "grid", label: "Grid" },
  { key: "orbits", label: "Orbits" },
];

export function LayersMenu() {
  const layersOpen = useSpaceCamStore((s) => s.layersOpen);
  const setLayersOpen = useSpaceCamStore((s) => s.setLayersOpen);
  const layers = useSpaceCamStore((s) => s.layers);
  const toggleLayer = useSpaceCamStore((s) => s.toggleLayer);

  if (!layersOpen) return null;

  return (
    <div className="pointer-events-auto absolute right-3 top-28 z-40 w-56 rounded-2xl border border-white/20 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-xl">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300">
          <Layers className="h-3.5 w-3.5" /> Layers
        </div>
        <button
          type="button"
          onClick={() => setLayersOpen(false)}
          className="rounded-lg p-1 text-slate-400 hover:bg-white/10"
          aria-label="Close layers menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <ul className="space-y-0.5">
        {LAYER_ITEMS.map(({ key, label }) => (
          <li key={key}>
            <button
              type="button"
              onClick={() => toggleLayer(key)}
              className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm hover:bg-white/5"
              role="checkbox"
              aria-checked={layers[key]}
            >
              <span
                className={cn(
                  "grid h-5 w-5 place-items-center rounded border text-xs",
                  layers[key]
                    ? "border-cyan-400 bg-cyan-400/20 text-cyan-300"
                    : "border-slate-600 text-transparent",
                )}
              >
                ✓
              </span>
              <span className="text-white">{label}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-2 border-t border-white/10 pt-2 text-[10px] text-slate-500">
        Satellites & comets require live data when available
      </p>
    </div>
  );
}
