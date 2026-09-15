"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Bike,
  Bus,
  Car,
  Footprints,
  Layers,
  Mic,
  Navigation,
  Phone,
  Plus,
  ShieldAlert,
} from "lucide-react";
import { PLACES, searchPlaces } from "@/content/smart-map/places";
import { DEFAULT_CENTER } from "@/lib/map/styles";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/stores/map-store";
import {
  basemapStyleForLayers,
  buildTripSummary,
  buildVoiceScript,
  cacheRoute,
  DEFAULT_ACTIVE_LAYERS,
  formatDuration,
  getMapInformation,
  MAP_LAYERS,
  nearbyEmergencyServices,
  persistTripSummary,
  planAdvancedRoutes,
  recalculateRoute,
  speakText,
  telHref,
} from "@/lib/navigation";
import type {
  AdvancedRoutePlan,
  AdvancedTravelMode,
  MapLayerId,
  RouteAvoidOptions,
  RouteWaypoint,
} from "@/lib/navigation/types";
import { getCategoryMeta } from "@/content/smart-map/categories";

const MapView = dynamic(
  () => import("@/components/smart-map/map-view").then((m) => m.MapView),
  { ssr: false },
);

const MODES: { id: AdvancedTravelMode; label: string; icon: typeof Car }[] = [
  { id: "driving", label: "Car", icon: Car },
  { id: "transit", label: "Bus", icon: Bus },
  { id: "motorcycle", label: "Moto", icon: Bike },
  { id: "cycling", label: "Cycle", icon: Bike },
  { id: "walking", label: "Walk", icon: Footprints },
];

function waypointFromPlace(place: (typeof PLACES)[number]): RouteWaypoint {
  return {
    id: place.id,
    label: place.name,
    coordinates: place.coordinates,
    placeId: place.id,
  };
}

export function AdvancedNavClient() {
  const userLocation = useMapStore((s) => s.userLocation) ?? DEFAULT_CENTER;
  const destination = useMapStore((s) => s.destination);
  const setDestination = useMapStore((s) => s.setDestination);
  const setMapStyle = useMapStore((s) => s.setMapStyle);
  const setTravelMode = useMapStore((s) => s.setTravelMode);
  const voiceNav = useMapStore((s) => s.voiceNav);
  const setVoiceNav = useMapStore((s) => s.setVoiceNav);

  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<AdvancedTravelMode>("driving");
  const [avoid, setAvoid] = useState<RouteAvoidOptions>({
    tolls: false,
    traffic: true,
    ferries: false,
    unpaved: true,
  });
  const [stops, setStops] = useState<RouteWaypoint[]>([]);
  const [layers, setLayers] = useState<MapLayerId[]>(DEFAULT_ACTIVE_LAYERS);
  const [showLayers, setShowLayers] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [navigating, setNavigating] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  const from: RouteWaypoint = useMemo(
    () => ({
      id: "origin",
      label: "Current location",
      coordinates: userLocation,
    }),
    [userLocation],
  );

  const to: RouteWaypoint | null = useMemo(() => {
    if (!destination) return null;
    return waypointFromPlace(destination);
  }, [destination]);

  const searchHits = useMemo(() => searchPlaces(query).slice(0, 6), [query]);

  const routes = useMemo(() => {
    if (!to) return [] as AdvancedRoutePlan[];
    return planAdvancedRoutes({ from, to, stops, mode, avoid });
  }, [from, to, stops, mode, avoid]);

  const activeRoute = routes.find((r) => r.id === selectedRouteId) ?? routes[0] ?? null;

  const emergencies = useMemo(
    () => nearbyEmergencyServices(userLocation, mode, 10),
    [userLocation, mode],
  );

  const mapInfo = useMemo(
    () =>
      getMapInformation({
        timeToDestinationMin: activeRoute?.durationMin ?? null,
        currentSpeedKmh: currentSpeed,
        elevationM: activeRoute?.elevationProfile[0]?.elevationM,
      }),
    [activeRoute, currentSpeed],
  );

  useEffect(() => {
    if (routes[0]) setSelectedRouteId(routes[0].id);
  }, [routes]);

  useEffect(() => {
    const style = basemapStyleForLayers(layers);
    setMapStyle(style);
  }, [layers, setMapStyle]);

  useEffect(() => {
    if (mode === "motorcycle") {
      // Store persists TravelMode; motorcycle is Phase 7-compatible.
      setTravelMode("motorcycle");
    } else {
      setTravelMode(mode);
    }
  }, [mode, setTravelMode]);

  useEffect(() => {
    if (!navigating || typeof navigator === "undefined" || !navigator.geolocation) return;
    const watch = navigator.geolocation.watchPosition(
      (pos) => {
        if (typeof pos.coords.speed === "number" && pos.coords.speed >= 0) {
          setCurrentSpeed(Number((pos.coords.speed * 3.6).toFixed(1)));
        }
      },
      () => setCurrentSpeed(null),
      { enableHighAccuracy: true, maximumAge: 2000 },
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, [navigating]);

  function toggleLayer(id: MapLayerId) {
    const def = MAP_LAYERS.find((l) => l.id === id);
    if (!def) return;
    startTransition(() => {
      if (def.kind === "basemap") {
        const overlays = layers.filter((l) => MAP_LAYERS.find((d) => d.id === l)?.kind === "overlay");
        setLayers([id, ...overlays]);
        return;
      }
      setLayers((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    });
  }

  function addStopFromQuery() {
    const hit = searchHits[0];
    if (!hit) return;
    setStops((prev) => [...prev, waypointFromPlace(hit)]);
    setQuery("");
  }

  function startNavigation() {
    if (!activeRoute) return;
    setNavigating(true);
    cacheRoute(activeRoute);
    if (voiceNav) {
      const script = buildVoiceScript(activeRoute);
      speakText(script[0]);
      window.setTimeout(() => speakText(script[1] ?? "Continue on route."), 2500);
    }
  }

  function finishTrip() {
    if (!activeRoute) return;
    const summary = buildTripSummary(activeRoute, {
      averageSpeedKmh: currentSpeed ?? undefined,
    });
    persistTripSummary(summary);
    setNavigating(false);
  }

  function onRecalculate() {
    if (!activeRoute) return;
    const next = recalculateRoute(activeRoute, userLocation);
    setSelectedRouteId(next.id);
    cacheRoute(next);
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      <MapView />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 max-h-[100dvh] overflow-y-auto p-3 sm:p-4">
        <div className="pointer-events-auto mx-auto flex max-w-2xl flex-col gap-3 pb-28">
          <section className="rounded-3xl border border-white/30 bg-white/92 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0B3A63]/94">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-sm-emerald">
                  Phase 7 · Advanced Navigation
                </p>
                <h1 className="mt-1 font-display text-2xl font-extrabold">Route & safety engine</h1>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Multi-stop · alternatives · layers · emergency · AI safety
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLayers((v) => !v)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sm-primary/10 text-sm-primary"
                aria-label="Toggle map layers"
              >
                <Layers className="h-5 w-5" />
              </button>
            </div>

            <label className="mt-3 block text-xs font-semibold text-slate-500">Destination search</label>
            <div className="mt-1 flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search place, hospital, community…"
                className="min-w-0 flex-1 rounded-2xl border border-sm-border bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-black/20"
              />
              <button
                type="button"
                onClick={addStopFromQuery}
                className="inline-flex items-center gap-1 rounded-2xl bg-slate-100 px-3 text-sm font-bold dark:bg-white/10"
                title="Add as stop"
              >
                <Plus className="h-4 w-4" /> Stop
              </button>
            </div>
            {query && searchHits.length > 0 && (
              <ul className="mt-2 max-h-40 overflow-y-auto rounded-2xl border border-sm-border bg-white dark:border-white/10 dark:bg-sm-primary-deep">
                {searchHits.map((place) => (
                  <li key={place.id}>
                    <button
                      type="button"
                      className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-sm-primary/5"
                      onClick={() => {
                        setDestination(place);
                        setQuery("");
                      }}
                    >
                      <span>{getCategoryMeta(place.category).emoji}</span>
                      <span>
                        <span className="font-semibold">{place.name}</span>
                        <span className="block text-xs text-slate-500">{place.address}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-3 text-xs text-slate-500">
              From: <strong>Current location</strong>
              {to ? (
                <>
                  {" "}
                  → To: <strong>{to.label}</strong>
                </>
              ) : (
                " · pick a destination"
              )}
            </p>
            {stops.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                {stops.map((s, i) => (
                  <li key={s.id} className="flex items-center justify-between gap-2">
                    <span>
                      Stop {i + 1}: {s.label}
                    </span>
                    <button
                      type="button"
                      className="text-sm-danger font-semibold"
                      onClick={() => setStops((prev) => prev.filter((x) => x.id !== s.id))}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-3 grid grid-cols-5 gap-1.5">
              {MODES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-bold",
                    mode === id
                      ? "bg-sm-primary text-white"
                      : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {(
                [
                  ["tolls", "Avoid tolls"],
                  ["traffic", "Avoid traffic"],
                  ["ferries", "Avoid ferries"],
                  ["unpaved", "Avoid unpaved"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAvoid((a) => ({ ...a, [key]: !a[key] }))}
                  className={cn(
                    "rounded-full px-3 py-1.5 font-semibold",
                    avoid[key]
                      ? "bg-sm-emerald/15 text-sm-emerald"
                      : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-200",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          {showLayers && (
            <section className="rounded-3xl border border-white/30 bg-white/92 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0B3A63]/94">
              <h2 className="font-bold">Map layers</h2>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {MAP_LAYERS.map((layer) => {
                  const active = layers.includes(layer.id);
                  return (
                    <button
                      key={layer.id}
                      type="button"
                      onClick={() => toggleLayer(layer.id)}
                      className={cn(
                        "rounded-2xl px-2 py-2 text-left text-xs font-semibold",
                        active
                          ? "bg-sm-primary text-white"
                          : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white",
                      )}
                    >
                      <span className="block text-base">{layer.emoji}</span>
                      {layer.label}
                    </button>
                  );
                })}
              </div>
              {pending && <p className="mt-2 text-xs text-slate-500">Updating layers…</p>}
            </section>
          )}

          {activeRoute && (
            <section className="rounded-3xl border border-white/30 bg-white/92 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0B3A63]/94">
              <h2 className="font-bold">AI travel options</h2>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {routes.map((route) => (
                  <button
                    key={route.id}
                    type="button"
                    onClick={() => setSelectedRouteId(route.id)}
                    className={cn(
                      "min-w-[8.5rem] shrink-0 rounded-2xl border px-3 py-2 text-left text-xs",
                      activeRoute.id === route.id
                        ? "border-sm-primary bg-sm-primary/10"
                        : "border-sm-border dark:border-white/10",
                    )}
                  >
                    <p className="font-bold">{route.label}</p>
                    <p>{route.distanceKm.toFixed(1)} km · {formatDuration(route.durationMin)}</p>
                    <p className="text-sm-emerald">Safety {route.safetyScore}</p>
                  </button>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <span className="rounded-full bg-sm-primary/10 px-3 py-1 font-semibold text-sm-primary">
                  {activeRoute.distanceKm.toFixed(1)} km ({activeRoute.distanceMiles} mi)
                </span>
                <span className="rounded-full bg-sm-emerald/10 px-3 py-1 font-semibold text-sm-emerald">
                  {formatDuration(activeRoute.durationMin)}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold dark:bg-white/10">
                  ETA {new Date(activeRoute.etaIso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-800 dark:bg-amber-500/20 dark:text-amber-200">
                  {activeRoute.difficulty}
                </span>
                {activeRoute.fuelLiters != null && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold dark:bg-white/10">
                    ~{activeRoute.fuelLiters} L fuel
                  </span>
                )}
              </div>

              <div className="mt-3">
                <p className="text-xs font-semibold uppercase text-slate-500">Elevation profile</p>
                <div className="mt-1 flex h-12 items-end gap-0.5">
                  {activeRoute.elevationProfile.map((p) => (
                    <span
                      key={`${p.distanceKm}-${p.elevationM}`}
                      className="flex-1 rounded-t bg-sm-primary/70"
                      style={{ height: `${Math.max(12, Math.min(100, p.elevationM))}%` }}
                      title={`${p.distanceKm} km · ${p.elevationM} m`}
                    />
                  ))}
                </div>
              </div>

              {activeRoute.warnings.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <p className="inline-flex items-center gap-1 text-xs font-bold uppercase text-amber-700">
                    <ShieldAlert className="h-3.5 w-3.5" /> AI route safety
                  </p>
                  {activeRoute.warnings.map((w) => (
                    <p key={w.id} className="rounded-2xl bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-500/10 dark:text-amber-100">
                      {w.label} · {w.distanceAlongKm} km — {w.message}
                    </p>
                  ))}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={startNavigation}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-sm-primary px-4 py-3 text-sm font-bold text-white"
                >
                  <Navigation className="h-4 w-4" />
                  {navigating ? "Navigating…" : "Start navigation"}
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceNav(!voiceNav)}
                  className={cn(
                    "inline-flex items-center justify-center rounded-2xl px-4 py-3",
                    voiceNav ? "bg-sm-emerald text-white" : "bg-slate-100 dark:bg-white/10",
                  )}
                  aria-label="Toggle voice guidance"
                >
                  <Mic className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={onRecalculate}
                  className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold dark:bg-white/10"
                >
                  Recalculate
                </button>
                {navigating && (
                  <Link
                    href="/trip-summary"
                    onClick={finishTrip}
                    className="rounded-2xl bg-sm-emerald px-4 py-3 text-sm font-bold text-white"
                  >
                    End trip
                  </Link>
                )}
              </div>
            </section>
          )}

          <section className="rounded-3xl border border-white/30 bg-white/92 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0B3A63]/94">
            <h2 className="font-bold">Emergency navigation</h2>
            <p className="mt-1 text-xs text-slate-500">Nearby services with one-tap navigate / call</p>
            <ul className="mt-3 space-y-2">
              {emergencies.map((item) => {
                const call = telHref(item.phone);
                return (
                  <li
                    key={item.place.id}
                    className="flex items-center justify-between gap-2 rounded-2xl border border-sm-border px-3 py-2 dark:border-white/10"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">
                        {getCategoryMeta(item.place.category).emoji} {item.place.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.distanceKm.toFixed(1)} km · {formatDuration(item.durationMin)} ·{" "}
                        {item.openStatus === "open"
                          ? "Open"
                          : item.openStatus === "closed"
                            ? "Closed"
                            : "Hours unknown"}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        className="rounded-xl bg-sm-primary px-2.5 py-2 text-xs font-bold text-white"
                        onClick={() => setDestination(item.place)}
                      >
                        Go
                      </button>
                      {call && (
                        <a
                          href={call}
                          className="inline-flex items-center justify-center rounded-xl bg-sm-emerald px-2.5 py-2 text-white"
                          aria-label={`Call ${item.place.name}`}
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="rounded-3xl border border-white/30 bg-white/92 p-4 text-sm shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0B3A63]/94">
            <h2 className="font-bold">Map information</h2>
            <dl className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
              <div>
                <dt className="font-semibold text-slate-500">Roads</dt>
                <dd>{mapInfo.roadNames.slice(0, 3).join(", ")}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Communities</dt>
                <dd>{mapInfo.communities.slice(0, 3).join(", ")}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Rivers / lakes</dt>
                <dd>
                  {mapInfo.rivers[0]}; {mapInfo.lakes[0]}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Forests / parks</dt>
                <dd>
                  {mapInfo.forestReserves[0]}; {mapInfo.nationalParks[0]}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">District / region</dt>
                <dd>
                  {mapInfo.districts[0]} · {mapInfo.regions[0]}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Elevation / weather</dt>
                <dd>
                  {mapInfo.elevationM} m · {mapInfo.weatherLabel}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Time to destination</dt>
                <dd>
                  {mapInfo.timeToDestinationMin != null
                    ? formatDuration(mapInfo.timeToDestinationMin)
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Current speed</dt>
                <dd>
                  {mapInfo.currentSpeedKmh != null ? `${mapInfo.currentSpeedKmh} km/h` : "Permission / GPS"}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
