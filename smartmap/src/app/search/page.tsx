"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, MapPin, Mic, Navigation, Search as SearchIcon } from "lucide-react";
import { PLACE_CATEGORIES, getCategoryMeta } from "@/content/smart-map/categories";
import { haversineKm, nearbyPlaces, searchPlaces } from "@/content/smart-map/places";
import { PHASE1_NEARBY_CATEGORIES } from "@/lib/features/flags";
import { usePublicSafetyEnabled } from "@/lib/features/use-feature-flag";
import { useMapStore } from "@/stores/map-store";
import type { GeoSearchResult } from "@/lib/geo/types";
import type { Place, PlaceCategory } from "@/types/smart-map";
import { LocationPermissionCard } from "@/components/smart-map/location-hud";
import { ScrollableChips } from "@/components/smart-map/scrollable-chips";
import { Skeleton } from "@/components/ui/skeleton";
import { hapticTap } from "@/lib/haptics";

const NEARBY_RADIUS_KM = 15;

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [globalResults, setGlobalResults] = useState<GeoSearchResult[]>([]);
  const [pending, startTransition] = useTransition();
  const [listening, setListening] = useState(false);
  const activeCategory = useMapStore((s) => s.activeCategory);
  const setActiveCategory = useMapStore((s) => s.setActiveCategory);
  const setSelectedPlaceId = useMapStore((s) => s.setSelectedPlaceId);
  const setDestination = useMapStore((s) => s.setDestination);
  const setNavDestination = useMapStore((s) => s.setNavDestination);
  const userLocation = useMapStore((s) => s.userLocation);
  const publicSafety = usePublicSafetyEnabled();

  const categories = publicSafety
    ? PLACE_CATEGORIES
    : PLACE_CATEGORIES.filter((c) =>
        (PHASE1_NEARBY_CATEGORIES as readonly string[]).includes(c.id),
      );

  const chips = [
    { id: "all", label: "All" },
    ...categories.map((c) => ({ id: c.id, label: c.label, emoji: c.emoji })),
  ];

  const localResults = useMemo(() => {
    if (!userLocation) return [];
    const base =
      !query.trim() && activeCategory === "all"
        ? nearbyPlaces(userLocation, "all", 40)
        : searchPlaces(query, activeCategory).map((p) => ({
            ...p,
            distanceKm: haversineKm(userLocation, p.coordinates),
          }));

    const filtered = base.filter((p) => p.distanceKm < NEARBY_RADIUS_KM);

    if (publicSafety) return filtered.slice(0, 12);

    return filtered
      .filter((p) => (PHASE1_NEARBY_CATEGORIES as readonly string[]).includes(p.category))
      .slice(0, 12);
  }, [query, activeCategory, userLocation, publicSafety]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setGlobalResults([]);
      return;
    }
    const timer = window.setTimeout(() => {
      startTransition(() => {
        void (async () => {
          try {
            const res = await fetch(`/api/geo/search?q=${encodeURIComponent(q)}&limit=10`, {
              cache: "no-store",
            });
            const data = (await res.json()) as { results?: GeoSearchResult[] };
            setGlobalResults(data.results ?? []);
          } catch {
            setGlobalResults([]);
          }
        })();
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  function selectGlobal(result: GeoSearchResult) {
    hapticTap();
    const allowed = new Set(PLACE_CATEGORIES.map((c) => c.id));
    const category = allowed.has(result.category as Place["category"])
      ? (result.category as Place["category"])
      : "attraction";
    const place: Place = {
      id: result.id,
      name: result.name,
      category,
      coordinates: result.coordinates,
      address: result.label,
      city: result.city || "",
      region: result.region || "",
      country: result.country || "",
      countryCode: result.countryCode || "",
    };
    setDestination(place);
    setNavDestination({
      id: result.id,
      label: result.name,
      coordinates: result.coordinates,
      source: "search",
      address: result.label,
    });
  }

  function startVoice() {
    const w = window as unknown as {
      SpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        start: () => void;
        onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onerror: (() => void) | null;
        onend: (() => void) | null;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        start: () => void;
        onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onerror: (() => void) | null;
        onend: (() => void) | null;
      };
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setListening(true);
    hapticTap();
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) setQuery(transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  }

  return (
    <div className="min-h-[100dvh] bg-[#0A0F1E] px-4 pb-28 pt-6 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="sm-fade-up">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#60A5FA]">Global Search</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold text-white">
            Search anywhere in the world
          </h1>
          <p className="mt-2 text-sm text-[#94A3B8]">
            Streets, cities, airports, hospitals, hotels, schools, and more — not limited to Ghana.
          </p>
        </header>

        <div className="mt-4">
          <LocationPermissionCard compact />
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#1E293B] bg-[#141C2F] px-4 py-3">
          <SearchIcon className="h-5 w-5 shrink-0 text-[#60A5FA]" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search London, JFK Airport, Korle Bu, Accra…"
            className="w-full bg-transparent text-base text-white outline-none placeholder:text-[#94A3B8]"
            autoFocus
            aria-label="Search places worldwide"
          />
          {pending && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#94A3B8]" aria-hidden />}
          <button
            type="button"
            onClick={startVoice}
            className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
              listening ? "bg-[#3B82F6] text-white" : "bg-[#0A0F1E] text-[#94A3B8]"
            }`}
            aria-label="Voice search"
          >
            <Mic className="h-4 w-4" />
          </button>
        </div>

        <ScrollableChips
          className="mt-4"
          chips={chips}
          activeId={activeCategory}
          onSelect={(id) => {
            hapticTap();
            setActiveCategory(id as PlaceCategory | "all");
          }}
        />

        {pending && query.trim().length >= 2 && (
          <div className="mt-6 space-y-3" aria-busy="true" aria-label="Searching">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-3xl border border-[#1E293B] bg-[#141C2F] p-4">
                <Skeleton className="h-3 w-24 bg-[#1E293B]" />
                <Skeleton className="mt-2 h-5 w-48 bg-[#1E293B]" />
                <Skeleton className="mt-2 h-4 w-full bg-[#1E293B]/70" />
              </div>
            ))}
          </div>
        )}

        {globalResults.length > 0 && !pending && (
          <section className="mt-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#94A3B8]">Worldwide results</h2>
            <ul className="mt-3 space-y-3">
              {globalResults.map((result) => (
                <li
                  key={result.id}
                  className="rounded-3xl border border-[#1E293B] bg-[#141C2F] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-[#60A5FA]">
                        {result.category ?? "place"}
                        {result.country ? ` · ${result.country}` : ""}
                        {userLocation
                          ? ` · ${haversineKm(userLocation, result.coordinates).toFixed(1)} km`
                          : ""}
                      </p>
                      <h3 className="mt-1 font-display text-lg font-bold text-white">{result.name}</h3>
                      <p className="mt-1 flex items-center gap-1 text-sm text-[#94A3B8]">
                        <MapPin className="h-3.5 w-3.5" aria-hidden />
                        {result.label}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/"
                        onClick={() => selectGlobal(result)}
                        className="rounded-xl bg-[#0A0F1E] px-3 py-2 text-center text-xs font-bold text-white"
                      >
                        Map
                      </Link>
                      <Link
                        href="/navigate"
                        onClick={() => selectGlobal(result)}
                        className="inline-flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#1E5EB8] px-3 py-2 text-xs font-bold text-white"
                      >
                        <Navigation className="h-3.5 w-3.5" aria-hidden />
                        Go
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#94A3B8]">
            {userLocation ? "Nearby curated essentials" : "Enable GPS for nearby essentials"}
          </h2>
          {!userLocation && (
            <p className="mt-2 rounded-2xl border border-dashed border-[#1E293B] bg-[#141C2F] px-4 py-6 text-center text-sm text-[#94A3B8]">
              Turn on location to see police, hospitals, and schools within 15 km.
            </p>
          )}
          <ul className="mt-3 space-y-3">
            {localResults.map((place) => {
              const meta = getCategoryMeta(place.category);
              return (
                <li
                  key={place.id}
                  className="rounded-3xl border border-[#1E293B] bg-[#141C2F] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-[#60A5FA]">
                        {meta.emoji} {meta.label}
                        {"distanceKm" in place && place.distanceKm != null && (
                          <span className="text-[#10B981]"> · {place.distanceKm.toFixed(1)} km</span>
                        )}
                      </p>
                      <h3 className="mt-1 font-display text-lg font-bold text-white">{place.name}</h3>
                      <p className="mt-1 flex items-center gap-1 text-sm text-[#94A3B8]">
                        <MapPin className="h-3.5 w-3.5" aria-hidden />
                        {place.address}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/"
                        onClick={() => {
                          hapticTap();
                          setSelectedPlaceId(place.id);
                        }}
                        className="rounded-xl bg-[#0A0F1E] px-3 py-2 text-center text-xs font-bold text-white"
                      >
                        Map
                      </Link>
                      <Link
                        href="/navigate"
                        onClick={() => {
                          hapticTap();
                          setDestination(place);
                        }}
                        className="inline-flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#1E5EB8] px-3 py-2 text-xs font-bold text-white"
                      >
                        <Navigation className="h-3.5 w-3.5" aria-hidden />
                        Go
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
            {userLocation && localResults.length === 0 && !pending && (
              <li className="rounded-3xl border border-dashed border-[#1E293B] bg-[#141C2F] p-8 text-center text-sm text-[#94A3B8]">
                {query.trim().length >= 2
                  ? "No places match that search within 15 km. Try another city, street, or landmark."
                  : "No curated essentials within 15 km. Try Search for worldwide results."}
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
