"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Crosshair, Star, X } from "lucide-react";
import { formatAzAlt, formatRaDec } from "@/lib/spacecam/astronomy/coordinates";
import { enrichObjectWithPosition } from "@/lib/spacecam/astronomy/ephemeris";
import { useSpaceCamStore } from "@/lib/spacecam/spacecam-store";
import { useObserverContext } from "@/lib/spacecam/hooks/use-observer-context";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  star: "★ Bright Star",
  planet: "Planet",
  moon: "Moon",
  sun: "Sun",
  constellation: "Constellation",
  satellite: "Satellite",
  comet: "Comet",
  "deep-sky": "Deep-Sky Object",
  cluster: "Star Cluster",
  galaxy: "Galaxy",
  nebula: "Nebula",
};

export function ObjectInfoSheet() {
  const selectedObject = useSpaceCamStore((s) => s.selectedObject);
  const setSelectedObject = useSpaceCamStore((s) => s.setSelectedObject);
  const favorites = useSpaceCamStore((s) => s.favorites);
  const toggleFavorite = useSpaceCamStore((s) => s.toggleFavorite);
  const setMode = useSpaceCamStore((s) => s.setMode);
  const observer = useObserverContext();

  const enriched = selectedObject ? enrichObjectWithPosition(selectedObject, observer) : null;
  const isFavorite = selectedObject ? favorites.includes(selectedObject.id) : false;

  return (
    <AnimatePresence>
      {enriched && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="pointer-events-auto absolute inset-x-3 bottom-[8.5rem] z-40 max-h-[50vh] overflow-y-auto rounded-3xl border border-white/20 bg-slate-950/90 shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:right-4 sm:w-[380px]"
          role="dialog"
          aria-label={`Information about ${enriched.name}`}
        >
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                  {TYPE_LABELS[enriched.type] ?? enriched.type}
                </p>
                <h2 className="mt-1 font-display text-2xl font-extrabold text-white">{enriched.name}</h2>
                {enriched.catalogIds && (
                  <p className="mt-0.5 text-xs text-slate-400">{enriched.catalogIds.join(" · ")}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedObject(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-white/10"
                aria-label="Close object details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              {enriched.constellation && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">Constellation</dt>
                  <dd className="font-semibold text-white">{enriched.constellation}</dd>
                </div>
              )}
              {enriched.magnitude != null && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">Magnitude</dt>
                  <dd className="font-semibold text-white">{enriched.magnitude.toFixed(1)}</dd>
                </div>
              )}
              {enriched.distanceLy != null && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">Distance</dt>
                  <dd className="font-semibold text-white">{enriched.distanceLy.toLocaleString()} ly</dd>
                </div>
              )}
              {enriched.distanceAu != null && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">Distance</dt>
                  <dd className="font-semibold text-white">{enriched.distanceAu.toFixed(2)} AU</dd>
                </div>
              )}
              {enriched.raHours != null && enriched.decDeg != null && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">Coordinates</dt>
                  <dd className="text-right font-semibold text-white">{formatRaDec(enriched.raHours, enriched.decDeg)}</dd>
                </div>
              )}
              {enriched.horizontal && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">Direction</dt>
                  <dd className="font-semibold text-white">
                    {formatAzAlt(enriched.horizontal.azimuthDeg, enriched.horizontal.altitudeDeg)}
                  </dd>
                </div>
              )}
            </dl>

            {enriched.description && (
              <p className="mt-3 text-xs leading-relaxed text-slate-300">{enriched.description}</p>
            )}

            <p className="mt-2 text-[10px] text-slate-500">
              {enriched.offlineAvailable ? "AVAILABLE OFFLINE" : "LIVE DATA REQUIRED"} · SpaceCam displays catalog position
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode("space-3d");
                  setSelectedObject(enriched);
                }}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl bg-cyan-500 px-3 text-sm font-bold text-slate-950"
              >
                <Crosshair className="h-4 w-4" />
                View in Space
              </button>
              <button
                type="button"
                onClick={() => toggleFavorite(enriched.id)}
                className={cn(
                  "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border px-3 text-sm font-bold",
                  isFavorite
                    ? "border-amber-400/50 bg-amber-400/10 text-amber-200"
                    : "border-white/20 bg-white/5 text-white",
                )}
              >
                {isFavorite ? <Star className="h-4 w-4 fill-current" /> : <Bookmark className="h-4 w-4" />}
                {isFavorite ? "Favorited" : "Add to Favorites"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
