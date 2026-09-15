"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navigation, Share2, Bookmark, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { CloudSun } from "lucide-react";
import { getPlaceById, nearbyPlaces } from "@/content/smart-map/places";
import { getCategoryMeta } from "@/content/smart-map/categories";
import { useMapStore } from "@/stores/map-store";
import { cn } from "@/lib/utils";
import { useOnlineStatus } from "@/lib/hooks/use-online-status";

const QUICK_ACTIONS = [
  { id: "restaurant", label: "Find Restaurants", category: "restaurant", emoji: "🍴" },
  { id: "school", label: "Find Schools", category: "school", emoji: "🏫" },
  { id: "hospital", label: "Find Hospitals", category: "hospital", emoji: "🏥" },
  { id: "fuel", label: "Gas Stations", category: "fuel", emoji: "⛽" },
] as const;

type SheetSnap = "peek" | "expanded";

function formatTemp(temp: unknown): number | null {
  const n = typeof temp === "number" ? temp : Number(temp);
  return Number.isFinite(n) ? Math.round(n) : null;
}

export function PlaceSheet({ showVerification = false }: { showVerification?: boolean }) {
  const selectedPlaceId = useMapStore((s) => s.selectedPlaceId);
  const setSelectedPlaceId = useMapStore((s) => s.setSelectedPlaceId);
  const setDestination = useMapStore((s) => s.setDestination);
  const setActiveCategory = useMapStore((s) => s.setActiveCategory);
  const savedPlaceIds = useMapStore((s) => s.savedPlaceIds);
  const toggleSavedPlace = useMapStore((s) => s.toggleSavedPlace);
  const online = useOnlineStatus();

  const [snap, setSnap] = useState<SheetSnap>("peek");
  const [weather, setWeather] = useState<{ tempC: number; condition: string } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const place = selectedPlaceId ? getPlaceById(selectedPlaceId) : undefined;
  const saved = place ? savedPlaceIds.includes(place.id) : false;

  const nearby = useMemo(() => {
    if (!place) return [];
    return nearbyPlaces(place.coordinates, undefined, 4)
      .filter((p) => p.id !== place.id)
      .slice(0, 3);
  }, [place]);

  const subtitle = place
    ? `${place.city ?? place.name}, ${place.region ?? "Ashanti"} Region, ${place.country ?? "Ghana"}`
    : "";

  useEffect(() => {
    if (!place) return;
    setSnap("peek");
    if (!online) {
      setWeather(null);
      return;
    }
    setWeatherLoading(true);
    void fetch(`/api/weather?lat=${place.coordinates.lat}&lng=${place.coordinates.lng}`, {
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { weather?: { tempC?: number; condition?: string } }) => {
        const tempC = formatTemp(d.weather?.tempC);
        if (tempC == null) throw new Error("invalid");
        setWeather({ tempC, condition: d.weather?.condition ?? "Partly Cloudy" });
      })
      .catch(() => setWeather(null))
      .finally(() => setWeatherLoading(false));
  }, [place?.id, place?.coordinates.lat, place?.coordinates.lng, online]);

  const maxHeight = snap === "peek" ? "40vh" : "75vh";

  return (
    <AnimatePresence>
      {place && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="pointer-events-auto absolute inset-x-0 bottom-0 z-30"
          style={{ paddingBottom: "calc(4.5rem + env(safe-area-inset-bottom))" }}
        >
          <div
            className="mx-auto flex w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-[#1E293B] bg-[#0F172A]/95 shadow-2xl backdrop-blur-xl"
            style={{ maxHeight }}
          >
            <button
              type="button"
              onClick={() => setSnap(snap === "peek" ? "expanded" : "peek")}
              className="flex w-full flex-col items-center pt-2 pb-1"
              aria-label={snap === "peek" ? "Expand place details" : "Collapse place details"}
            >
              <div className="h-1 w-10 rounded-full bg-[#334155]" />
              {snap === "peek" ? (
                <ChevronUp className="mt-1 h-4 w-4 text-[#64748B]" />
              ) : (
                <ChevronDown className="mt-1 h-4 w-4 text-[#64748B]" />
              )}
            </button>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
              <h2 className="font-display text-xl font-bold text-[#F8FAFC]">{place.name}</h2>
              <p className="mt-0.5 text-sm text-[#94A3B8]">{subtitle}</p>

              <div className="mt-4 flex gap-2">
                <Link
                  href="/navigate"
                  onClick={() => setDestination(place)}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#3B82F6] px-4 text-sm font-bold text-white"
                >
                  <Navigation className="h-4 w-4" />
                  Directions
                </Link>
                <button
                  type="button"
                  onClick={() => toggleSavedPlace(place.id)}
                  className={cn(
                    "inline-flex min-h-11 min-w-[44px] items-center justify-center gap-1.5 rounded-xl border px-4 text-sm font-bold",
                    saved
                      ? "border-[#3B82F6]/50 bg-[#3B82F6]/15 text-[#60A5FA]"
                      : "border-[#2A3A5C] text-[#F8FAFC]",
                  )}
                >
                  <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
                  {saved ? "Saved" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      void navigator.share({ title: place.name, text: place.address, url: window.location.href });
                    }
                  }}
                  className="inline-flex min-h-11 min-w-[44px] items-center justify-center rounded-xl border border-[#2A3A5C] text-[#F8FAFC]"
                  aria-label="Share"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>

              {nearby.length > 0 && (
                <section className="mt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                    Nearby Places
                  </p>
                  <ul className="mt-2 space-y-1">
                    {nearby.map((p) => {
                      const meta = getCategoryMeta(p.category);
                      return (
                        <li key={p.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedPlaceId(p.id)}
                            className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left hover:bg-[#1E293B]/50"
                          >
                            <span
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm"
                              style={{ background: `${meta.color}22` }}
                            >
                              {meta.emoji}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#F8FAFC]">
                              {p.name}
                            </span>
                            <span className="shrink-0 text-xs text-[#94A3B8]">
                              {p.distanceKm < 1
                                ? `${Math.round(p.distanceKm * 1000)} m`
                                : `${p.distanceKm.toFixed(1)} km`}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              <section className="mt-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  Quick Actions
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {QUICK_ACTIONS.map(({ id, label, category, emoji }) => (
                    <Link
                      key={id}
                      href="/search"
                      onClick={() =>
                        setActiveCategory(category as import("@/types/smart-map").PlaceCategory)
                      }
                      className="flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl border border-[#1E293B] bg-[#141C2F]/60 px-2 py-3 text-center hover:border-[#3B82F6]/30"
                    >
                      <span className="text-lg">{emoji}</span>
                      <span className="text-[10px] font-bold leading-tight text-[#94A3B8]">
                        {label}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>

              <section className="mt-4 rounded-xl border border-[#1E293B] bg-[#141C2F]/60 px-3 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  Weather
                </p>
                {weatherLoading && (
                  <div className="mt-2 h-5 w-32 animate-pulse rounded bg-[#1E293B]" />
                )}
                {!weatherLoading && weather && (
                  <p className="mt-1 flex items-center gap-2 text-lg font-semibold text-[#F8FAFC]">
                    <CloudSun className="h-5 w-5 text-[#60A5FA]" aria-hidden />
                    {weather.tempC}°C · {weather.condition}
                  </p>
                )}
                {!weatherLoading && !weather && (
                  <p className="mt-1 text-sm text-[#94A3B8]">Weather unavailable</p>
                )}
              </section>

              {showVerification && place.verified && (
                <p className="mt-3 text-xs text-[#60A5FA]">Verified · {place.verified}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedPlaceId(null)}
              className="border-t border-[#1E293B] py-2 text-center text-xs text-[#64748B] hover:text-[#94A3B8]"
            >
              Close
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
