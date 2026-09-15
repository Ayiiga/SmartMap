"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Navigation, Phone, RefreshCw, Search } from "lucide-react";
import {
  emergencyPlacesService,
  EMERGENCY_CATEGORY_META,
  formatDistance,
  type EmergencyCategory,
  type EmergencyFetchStatus,
} from "@/lib/emergency/emergency-places-service";
import { telHref } from "@/lib/navigation/emergency";
import { formatDuration } from "@/lib/navigation/route-engine";
import { useMapStore } from "@/stores/map-store";
import { useOnlineStatus } from "@/lib/hooks/use-online-status";
import type { NearbyPoi } from "@/lib/geo/types";
import type { Place } from "@/types/smart-map";
import { cn } from "@/lib/utils";

const CATEGORY_ORDER: EmergencyCategory[] = ["hospital", "pharmacy", "police", "fire"];

function openStatusLabel(status?: "open" | "closed" | "unknown"): string | null {
  if (status === "open") return "Open";
  if (status === "closed") return "Closed";
  return null;
}

export function LiveEmergencyPanel() {
  const userLocation = useMapStore((s) => s.userLocation);
  const permission = useMapStore((s) => s.locationPermission);
  const setDestination = useMapStore((s) => s.setDestination);
  const setNavDestination = useMapStore((s) => s.setNavDestination);
  const online = useOnlineStatus();

  const [items, setItems] = useState<NearbyPoi[]>([]);
  const [source, setSource] = useState("");
  const [status, setStatus] = useState<EmergencyFetchStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(
    (force = false) => {
      if (!userLocation || permission === "denied") return;
      setStatus("loading");
      setErrorMessage(null);
      void emergencyPlacesService
        .fetchNearby(userLocation, { radiusM: 10_000, offline: !online, force })
        .then((result) => {
          setItems(result.results);
          setSource(result.source);
          setStatus(result.status);
          setErrorMessage(result.errorMessage);
        });
    },
    [userLocation, permission, online],
  );

  useEffect(() => {
    if (!userLocation || permission === "denied") {
      setItems([]);
      setStatus("idle");
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(false), 600);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      emergencyPlacesService.cancel();
    };
  }, [userLocation, permission, online, load]);

  const byCategory = emergencyPlacesService.getNearestByCategory(items);
  const displayItems = expanded ? items : CATEGORY_ORDER.map((c) => byCategory[c]).filter(Boolean) as NearbyPoi[];

  if (!userLocation || permission === "denied") return null;

  function navigateTo(item: NearbyPoi) {
    const place: Place = {
      id: item.id,
      name: item.name,
      category: item.category,
      coordinates: item.coordinates,
      address: item.address || item.name,
      city: "",
      region: "",
      country: "",
      countryCode: "",
      phone: item.phone,
    };
    setDestination(place);
    setNavDestination({
      id: item.id,
      label: item.name,
      coordinates: item.coordinates,
      source: "search",
      address: item.address,
    });
  }

  return (
    <section className="rounded-2xl border border-white/30 bg-white/95 p-4 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-[#0B1220]/95">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-sm-danger">Near you</p>
          <h2 className="font-bold">Emergency Services</h2>
        </div>
        {source && status === "success" && (
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold dark:bg-white/10">
            {source === "overpass" ? "Live OSM" : source.includes("catalog") ? "Catalog" : "Live"}
          </span>
        )}
      </div>

      {status === "loading" && (
        <p className="mt-2 text-sm text-slate-500" role="status">
          Finding nearby hospitals…
        </p>
      )}

      {status === "error" && (
        <div className="mt-3 rounded-xl bg-red-50 p-3 dark:bg-red-950/40">
          <p className="text-sm text-red-800 dark:text-red-200">
            {errorMessage ?? "Nearby services are temporarily unavailable."}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => load(true)}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-[#0F5B8D] px-3 py-2 text-xs font-bold text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
            <Link
              href="/search"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#0F5B8D]/30 px-3 py-2 text-xs font-bold text-[#0F5B8D]"
            >
              <Search className="h-3.5 w-3.5" />
              Search manually
            </Link>
          </div>
        </div>
      )}

      {status === "empty" && !errorMessage && (
        <p className="mt-2 text-sm text-slate-500">No emergency services found within 10 km.</p>
      )}

      {status === "success" && displayItems.length > 0 && (
        <ul className="mt-3 space-y-2">
          {displayItems.map((item) => {
            const catMeta = EMERGENCY_CATEGORY_META[item.category as EmergencyCategory] ?? {
              emoji: "📍",
              label: item.category,
            };
            const call = telHref(item.phone);
            const openLabel = openStatusLabel(item.openStatus);
            return (
              <li
                key={item.id}
                className="rounded-xl border border-slate-200/80 px-3 py-3 dark:border-white/10"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">
                      <span aria-hidden>{catMeta.emoji}</span> {item.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {catMeta.label} · {formatDistance(item.distanceKm)}
                      {openLabel && (
                        <span
                          className={cn(
                            "ml-1.5 font-semibold",
                            openLabel === "Open" ? "text-emerald-600" : "text-slate-400",
                          )}
                        >
                          · {openLabel}
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      ~{formatDuration(item.durationMin)} travel
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Link
                    href="/navigate"
                    onClick={() => navigateTo(item)}
                    className="inline-flex min-h-[44px] items-center gap-1 rounded-xl bg-[#0F5B8D] px-3 py-2 text-xs font-bold text-white"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    Directions
                  </Link>
                  {call && (
                    <a
                      href={call}
                      className="inline-flex min-h-[44px] items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      Call
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {status === "success" && items.length > CATEGORY_ORDER.length && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 w-full min-h-[44px] rounded-xl text-sm font-bold text-[#0F5B8D]"
        >
          {expanded ? "Show less" : `View all (${items.length})`}
        </button>
      )}

      {status === "success" && source && (
        <p className="mt-2 text-[10px] text-slate-400">
          Source: {source === "overpass" ? "OpenStreetMap" : "Smart Map catalog"} · Updated just now
        </p>
      )}
    </section>
  );
}
