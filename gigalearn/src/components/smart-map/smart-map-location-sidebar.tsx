"use client";

import Link from "next/link";
import {
  Fuel,
  GraduationCap,
  MapPin,
  Navigation,
  Share2,
  Stethoscope,
  UtensilsCrossed,
} from "lucide-react";
import { BEDOMASE_COORDINATES } from "@/content/smart-map/ghana-route-steps";
import { getCategoryMeta } from "@/content/smart-map/categories";
import { getPlaceById, nearbyPlaces } from "@/content/smart-map/places";
import { useMapStore } from "@/stores/map-store";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

const QUICK_ACTIONS = [
  { id: "restaurant", label: "Find Restaurants", icon: UtensilsCrossed, category: "restaurant", emoji: "🍴" },
  { id: "school", label: "Find Schools", icon: GraduationCap, category: "school", emoji: "🏫" },
  { id: "hospital", label: "Find Hospitals", icon: Stethoscope, category: "hospital", emoji: "🏥" },
  { id: "fuel", label: "Gas Stations", icon: Fuel, category: "fuel", emoji: "⛽" },
] as const;

interface SmartMapLocationSidebarProps {
  className?: string;
}

export function SmartMapLocationSidebar({ className }: SmartMapLocationSidebarProps) {
  const selectedPlaceId = useMapStore((s) => s.selectedPlaceId);
  const setSelectedPlaceId = useMapStore((s) => s.setSelectedPlaceId);
  const setActiveCategory = useMapStore((s) => s.setActiveCategory);
  const setDestination = useMapStore((s) => s.setDestination);
  const userLocation = useMapStore((s) => s.userLocation);
  const resolvedAddress = useMapStore((s) => s.resolvedAddress);
  const savedPlaceIds = useMapStore((s) => s.savedPlaceIds);
  const toggleSavedPlace = useMapStore((s) => s.toggleSavedPlace);
  const [weather, setWeather] = useState<{ temp: number; label: string } | null>(null);

  const featuredPlace = getPlaceById("gh-bedomase");
  const selectedPlace = selectedPlaceId ? getPlaceById(selectedPlaceId) : featuredPlace;

  const anchor = selectedPlace?.coordinates ?? userLocation ?? BEDOMASE_COORDINATES;

  const nearby = useMemo(
    () => nearbyPlaces(anchor, undefined, 5).filter((p) => p.id !== selectedPlace?.id),
    [anchor.lat, anchor.lng, selectedPlace?.id],
  );

  const locationTitle = selectedPlace?.name ?? resolvedAddress?.city ?? "Bedomase";
  const locationSubtitle =
    selectedPlace
      ? `${selectedPlace.city ?? selectedPlace.name}, ${selectedPlace.region ?? "Ashanti"} Region, Ghana`
      : resolvedAddress?.label ?? "Agona, Ashanti Region, Ghana";

  useEffect(() => {
    void fetch(`/api/weather?lat=${anchor.lat}&lng=${anchor.lng}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.weather) {
          setWeather({
            temp: Math.round(d.weather.temperatureC),
            label: d.weather.condition ?? "Partly Cloudy",
          });
        }
      })
      .catch(() => setWeather({ temp: 26, label: "Partly Cloudy" }));
  }, [anchor.lat, anchor.lng]);

  if (!selectedPlace && !featuredPlace) return null;

  const place = selectedPlace ?? featuredPlace!;
  const saved = savedPlaceIds.includes(place.id);

  return (
    <aside
      className={cn(
        "pointer-events-auto flex w-full max-w-[340px] flex-col gap-3 overflow-y-auto rounded-2xl border border-white/10 bg-[#0A0E23]/90 p-4 shadow-2xl backdrop-blur-xl",
        className,
      )}
      style={{ maxHeight: "calc(100dvh - 7rem - env(safe-area-inset-top) - env(safe-area-inset-bottom))" }}
    >
      {/* Location header */}
      <div>
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#3B82F6]/20">
            <MapPin className="h-5 w-5 text-[#60A5FA]" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-lg font-extrabold leading-tight text-white">
              {locationTitle}
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">{locationSubtitle}</p>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <Link
            href="/navigate"
            onClick={() => setDestination(place)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#3B82F6] px-3 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#3B82F6]/25"
          >
            <Navigation className="h-4 w-4" />
            Directions
          </Link>
          <button
            type="button"
            onClick={() => toggleSavedPlace(place.id)}
            className={cn(
              "rounded-xl border px-3 py-2.5 text-sm font-bold",
              saved
                ? "border-[#3B82F6]/50 bg-[#3B82F6]/15 text-[#60A5FA]"
                : "border-white/15 text-slate-300 hover:bg-white/5",
            )}
          >
            Save
          </button>
          <button
            type="button"
            className="rounded-xl border border-white/15 px-3 py-2.5 text-slate-300 hover:bg-white/5"
            aria-label="Share"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Nearby places */}
      <section>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Nearby Places</p>
        <ul className="mt-2 space-y-1">
          {nearby.map((p) => {
            const meta = getCategoryMeta(p.category);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setSelectedPlaceId(p.id)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left hover:bg-white/5"
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm"
                    style={{ background: `${meta.color}22` }}
                  >
                    {meta.emoji}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
                    {p.name}
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">
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

      {/* Quick actions */}
      <section>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Quick Actions</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map(({ id, label, category, emoji }) => (
            <Link
              key={id}
              href="/search"
              onClick={() => setActiveCategory(category as import("@/types/smart-map").PlaceCategory)}
              className="flex flex-col items-center justify-center gap-1 rounded-xl border border-white/8 bg-[#12182F]/80 px-2 py-3 text-center hover:border-[#3B82F6]/30"
            >
              <span className="text-lg">{emoji}</span>
              <span className="text-[10px] font-bold leading-tight text-slate-300">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Weather */}
      {weather && (
        <section className="mt-auto rounded-xl border border-white/8 bg-[#12182F]/60 px-3 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Weather</p>
          <p className="mt-1 text-lg font-extrabold text-white">
            {weather.temp}°C · {weather.label}
          </p>
          <p className="text-xs text-slate-400">{locationSubtitle.split(",")[0]}</p>
        </section>
      )}
    </aside>
  );
}
