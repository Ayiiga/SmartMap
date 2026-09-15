"use client";

import { useEffect } from "react";
import { ArrowUpDown, Circle, MapPin, Navigation, X } from "lucide-react";
import { PlaceAutocomplete } from "@/components/smart-map/place-autocomplete";
import type { GeoSearchResult, NavEndpoint } from "@/lib/geo/types";
import { cn } from "@/lib/utils";

interface RouteInputCardProps {
  origin: NavEndpoint | null;
  dest: NavEndpoint | null;
  fromQuery: string;
  toQuery: string;
  onFromQueryChange: (value: string) => void;
  onToQueryChange: (value: string) => void;
  onSelectOrigin: (result: GeoSearchResult) => void;
  onSelectDest: (result: GeoSearchResult) => void;
  onSwap: () => void;
  onClose?: () => void;
  compact?: boolean;
  className?: string;
}

export function RouteInputCard({
  origin,
  dest,
  fromQuery,
  toQuery,
  onFromQueryChange,
  onToQueryChange,
  onSelectOrigin,
  onSelectDest,
  onSwap,
  onClose,
  compact = false,
  className,
}: RouteInputCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/30 bg-white/97 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0B1220]/97",
        compact ? "p-2.5" : "p-3",
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-0">
          <div className="flex items-center gap-2 border-b border-slate-200/80 py-2 dark:border-white/10">
            <Circle className="h-3 w-3 shrink-0 fill-slate-400 text-slate-400" />
            {compact ? (
              <button
                type="button"
                onClick={onClose}
                className="min-w-0 flex-1 truncate text-left text-sm font-semibold"
              >
                {origin?.label ?? "Choose starting point"}
              </button>
            ) : (
              <PlaceAutocomplete
                className="flex-1"
                value={fromQuery}
                onChange={onFromQueryChange}
                placeholder={origin?.label ?? "Choose starting point"}
                onSelect={onSelectOrigin}
                minimal
              />
            )}
          </div>
          <div className="flex items-center gap-2 py-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 fill-red-500 text-red-500" />
            {compact ? (
              <button
                type="button"
                onClick={onClose}
                className="min-w-0 flex-1 truncate text-left text-sm font-semibold"
              >
                {dest?.label ?? "Choose destination"}
              </button>
            ) : (
              <PlaceAutocomplete
                className="flex-1"
                value={toQuery}
                onChange={onToQueryChange}
                placeholder={dest?.label ?? "Choose destination"}
                onSelect={onSelectDest}
                minimal
              />
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-center gap-1 pt-1">
          <button
            type="button"
            onClick={onSwap}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
            aria-label="Swap origin and destination"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      {!compact && (
        <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
          <Navigation className="h-3.5 w-3.5 text-[#1A73E8]" />
          Search worldwide · pick on map · use current location
        </div>
      )}
    </div>
  );
}

/** Syncs map overlay layers when active layer IDs change. */
export function MapOverlaySync({ overlays }: { overlays: string[] }) {
  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      const { getRegisteredMap, subscribeMapInstance } = await import(
        "@/lib/map/map-instance-registry"
      );
      const { applyMapOverlays, clearMapOverlays } = await import("@/lib/map/overlay-layers");

      const run = async (map: ReturnType<typeof getRegisteredMap>) => {
        if (!map || cancelled) return;
        if (overlays.length === 0) {
          clearMapOverlays(map);
          return;
        }
        await applyMapOverlays(map, overlays as import("@/lib/navigation/types").MapLayerId[]);
      };

      run(getRegisteredMap());
      const unsub = subscribeMapInstance((map) => {
        void run(map);
      });
      return unsub;
    };

    let unsub: (() => void) | undefined;
    void sync().then((fn) => {
      unsub = fn;
    });

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [overlays]);

  return null;
}
