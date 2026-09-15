"use client";

import Link from "next/link";
import { Bookmark, Navigation, Trash2 } from "lucide-react";
import { getPlaceById } from "@/content/smart-map/places";
import { getCategoryMeta } from "@/content/smart-map/categories";
import { useMapStore } from "@/stores/map-store";

export default function FavoritesPage() {
  const savedPlaceIds = useMapStore((s) => s.savedPlaceIds);
  const toggleSavedPlace = useMapStore((s) => s.toggleSavedPlace);
  const setDestination = useMapStore((s) => s.setDestination);
  const setSelectedPlaceId = useMapStore((s) => s.setSelectedPlaceId);
  const places = savedPlaceIds.map(getPlaceById).filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-6 sm:px-6">
      <header className="sm-fade-up">
        <p className="text-sm font-semibold uppercase tracking-wide text-sm-emerald">Favorites</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-sm-primary dark:text-white">
          Saved places
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Your Phase 1 favorites sync locally on this device and stay available offline.
        </p>
      </header>

      <ul className="mt-6 space-y-3">
        {places.map((place) => {
          if (!place) return null;
          const meta = getCategoryMeta(place.category);
          return (
            <li
              key={place.id}
              className="rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-sm-emerald">
                    {meta.emoji} {meta.label}
                  </p>
                  <h2 className="mt-1 font-display text-lg font-bold">{place.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{place.address}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/"
                    onClick={() => setSelectedPlaceId(place.id)}
                    className="rounded-xl bg-slate-100 px-3 py-2 text-center text-xs font-bold dark:bg-white/10"
                  >
                    Map
                  </Link>
                  <Link
                    href="/navigate"
                    onClick={() => setDestination(place)}
                    className="inline-flex items-center justify-center gap-1 rounded-xl bg-sm-primary px-3 py-2 text-xs font-bold text-white"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    Go
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleSavedPlace(place.id)}
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-sm-border px-3 py-2 text-xs font-bold dark:border-white/15"
                    aria-label={`Remove ${place.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            </li>
          );
        })}
        {places.length === 0 && (
          <li className="rounded-3xl border border-dashed border-sm-border p-10 text-center">
            <Bookmark className="mx-auto h-8 w-8 text-sm-primary" />
            <p className="mt-3 text-sm text-slate-500">No favorites yet. Save places from Search or the map.</p>
            <Link href="/search" className="mt-4 inline-block text-sm font-bold text-sm-primary">
              Find places →
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}
