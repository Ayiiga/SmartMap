"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Navigation, Phone, ShieldCheck, Star, X } from "lucide-react";
import Link from "next/link";
import { getPlaceById } from "@/content/smart-map/places";
import { getCategoryMeta } from "@/content/smart-map/categories";
import { useMapStore } from "@/stores/map-store";

export function PlaceSheet({ showVerification = false }: { showVerification?: boolean }) {
  const selectedPlaceId = useMapStore((s) => s.selectedPlaceId);
  const setSelectedPlaceId = useMapStore((s) => s.setSelectedPlaceId);
  const setDestination = useMapStore((s) => s.setDestination);
  const savedPlaceIds = useMapStore((s) => s.savedPlaceIds);
  const toggleSavedPlace = useMapStore((s) => s.toggleSavedPlace);

  const place = selectedPlaceId ? getPlaceById(selectedPlaceId) : undefined;
  const meta = place ? getCategoryMeta(place.category) : null;
  const saved = place ? savedPlaceIds.includes(place.id) : false;
  const showVerified = showVerification && Boolean(place?.verified);
  const showRating = showVerification && place?.rating != null;

  return (
    <AnimatePresence>
      {place && meta && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="pointer-events-auto absolute inset-x-3 bottom-[5.5rem] z-30 overflow-hidden rounded-3xl border border-white/30 bg-white/90 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0B3A63]/92 sm:inset-x-auto sm:left-4 sm:w-[380px]"
        >
          <div className="flex items-start justify-between gap-3 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-sm-emerald">
                {meta.emoji} {meta.label}
                {showVerified ? " · Verified" : ""}
              </p>
              <h2 className="mt-1 font-display text-xl font-extrabold text-slate-900 dark:text-white">
                {place.name}
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{place.address}</p>
              {showRating && place.rating != null && (
                <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-amber-600">
                  <Star className="h-4 w-4 fill-current" />
                  {place.rating.toFixed(1)}
                  {place.reviewCount != null && (
                    <span className="font-medium text-slate-500">({place.reviewCount})</span>
                  )}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelectedPlaceId(null)}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
              aria-label="Close place details"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 px-4 pb-2 text-xs font-medium text-slate-600 dark:text-slate-300">
            {place.hours && <span className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-white/10">{place.hours}</span>}
            {place.accessibility && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">Accessible</span>}
            {place.parking && <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">Parking</span>}
            {place.verified && showVerification && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sm-primary/10 px-2.5 py-1 text-sm-primary dark:text-sky-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                {place.verified}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 p-4 pt-2">
            <Link
              href="/navigate"
              onClick={() => setDestination(place)}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl bg-sm-primary px-3 text-sm font-bold text-white"
            >
              <Navigation className="h-4 w-4" />
              Go
            </Link>
            {place.phone ? (
              <a
                href={`tel:${place.phone}`}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl bg-sm-emerald px-3 text-sm font-bold text-white"
              >
                <Phone className="h-4 w-4" />
                Call
              </a>
            ) : (
              <span className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-400 dark:bg-white/10">
                No phone
              </span>
            )}
            <button
              type="button"
              onClick={() => toggleSavedPlace(place.id)}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 dark:border-white/15 dark:bg-transparent dark:text-white"
            >
              <Bookmark className={`h-4 w-4 ${saved ? "fill-sm-safety text-sm-safety" : ""}`} />
              {saved ? "Saved" : "Save"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
