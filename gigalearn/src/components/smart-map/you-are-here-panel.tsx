"use client";

import Link from "next/link";
import { MapPin, Navigation } from "lucide-react";
import { nearbyPlaces } from "@/content/smart-map/places";
import { getCategoryMeta } from "@/content/smart-map/categories";
import type { Coordinates } from "@/types/smart-map";
import { useMapStore } from "@/stores/map-store";

const NEARBY_RADIUS_KM = 15;

interface YouAreHerePanelProps {
  coordinates: Coordinates;
  label?: string;
  className?: string;
}

export function YouAreHerePanel({ coordinates, label, className }: YouAreHerePanelProps) {
  const setSelectedPlaceId = useMapStore((s) => s.setSelectedPlaceId);
  const setDestination = useMapStore((s) => s.setDestination);

  const nearby = nearbyPlaces(coordinates, "all", 20)
    .filter((p) => p.distanceKm < NEARBY_RADIUS_KM)
    .slice(0, 8);

  return (
    <div
      className={`rounded-t-[1.75rem] border border-[#1E293B] bg-[#141C2F]/97 shadow-2xl backdrop-blur-xl ${className ?? ""}`}
      role="status"
      aria-label="You are here"
    >
      <div className="px-4 pb-4 pt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#60A5FA]">
          Arrived
        </p>
        <h2 className="mt-1 font-display text-2xl font-extrabold text-white">
          You are here
        </h2>
        {label && (
          <p className="mt-1 text-sm text-[#94A3B8]">{label}</p>
        )}

        {nearby.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">
              Nearby places
            </p>
            <ul className="mt-2 space-y-2">
              {nearby.map((place) => {
                const meta = getCategoryMeta(place.category);
                return (
                  <li
                    key={place.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-[#0A0F1E] px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {meta.emoji} {place.name}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-[#94A3B8]">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {place.distanceKm.toFixed(1)} km · {meta.label}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <Link
                        href="/"
                        onClick={() => setSelectedPlaceId(place.id)}
                        className="rounded-xl bg-[#1E293B] px-2.5 py-1.5 text-[10px] font-bold text-white"
                      >
                        Map
                      </Link>
                      <Link
                        href="/navigate"
                        onClick={() => setDestination(place)}
                        className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#1E5EB8] px-2.5 py-1.5 text-[10px] font-bold text-white"
                      >
                        <Navigation className="h-3 w-3" />
                        Go
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <p className="mt-4 rounded-2xl bg-[#0A0F1E] px-4 py-3 text-sm text-[#94A3B8]">
            No curated places within 15 km. Try Search to find destinations worldwide.
          </p>
        )}
      </div>
    </div>
  );
}
