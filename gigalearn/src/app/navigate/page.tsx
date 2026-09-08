"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  Bike,
  Briefcase,
  Bus,
  Car,
  Footprints,
  Home,
  Loader2,
  MapPinned,
} from "lucide-react";
import { PlaceAutocomplete } from "@/components/smart-map/place-autocomplete";
import { LocationHud, LocationPermissionCard } from "@/components/smart-map/location-hud";
import { LiveLayerToggles } from "@/components/smart-map/live-layer-toggles";
import { RouteInputCard } from "@/components/smart-map/route-input-card";
import { RoutePreviewBanner } from "@/components/smart-map/route-preview-banner";
import { useMapStore } from "@/stores/map-store";
import type { TravelMode } from "@/types/smart-map";
import type { GeoSearchResult, NavEndpoint } from "@/lib/geo/types";
import { cn } from "@/lib/utils";
import { planAdvancedRoutes } from "@/lib/navigation/route-engine";
import { useRoutePlanner } from "@/lib/navigation/use-route-planner";
import { analyzeRouteSafety } from "@/lib/navigation/safety-analysis";
import { useAi40Enabled } from "@/lib/features/use-feature-flag";
import Link from "next/link";
import { NavigateVoiceRunner } from "@/components/smart-map/navigate-voice-runner";
import { NavigationHudOverlay } from "@/components/smart-map/navigation-hud-overlay";
import { RouteMapOverlay } from "@/components/smart-map/route-map-overlay";
import { NavigateBottomSheet } from "@/components/smart-map/navigate-bottom-sheet";
import {
  MapRecenterButton,
  MapTouchZoomHint,
  MapZoomControls,
} from "@/components/smart-map/map-touch-controls";
import { NavigateSatelliteToggle } from "@/components/smart-map/navigate-satellite-toggle";
import { TransportModeBar } from "@/components/smart-map/transport-mode-bar";
import { MapAttributionFooter } from "@/components/smart-map/map-attribution-footer";
import { recordSuccessfulNavigation } from "@/lib/offline/navigation-counter";
import { getPlaceById } from "@/content/smart-map/places";

const SmartMapTopBar = dynamic(() => import("@/components/smart-map/smart-map-top-bar").then((m) => m.SmartMapTopBar), { ssr: false });
const SmartMapRouteSidebar = dynamic(() => import("@/components/smart-map/smart-map-route-sidebar").then((m) => m.SmartMapRouteSidebar), { ssr: false });
const MapMinimapInset = dynamic(() => import("@/components/smart-map/map-minimap-inset").then((m) => m.MapMinimapInset), { ssr: false });

const MapView = dynamic(
  () => import("@/components/smart-map/map-view").then((m) => m.MapView),
  { ssr: false },
);

const MODES: { id: TravelMode; label: string; icon: typeof Car }[] = [
  { id: "driving", label: "Car", icon: Car },
  { id: "transit", label: "Bus", icon: Bus },
  { id: "motorcycle", label: "Moto", icon: Bike },
  { id: "cycling", label: "Cycle", icon: Bike },
  { id: "walking", label: "Walk", icon: Footprints },
];

function endpointFromGeo(result: GeoSearchResult, source: NavEndpoint["source"]): NavEndpoint {
  return {
    id: result.id,
    label: result.name,
    coordinates: result.coordinates,
    source,
    address: result.label,
  };
}

export default function NavigatePage() {
  const userLocation = useMapStore((s) => s.userLocation);
  const resolvedAddress = useMapStore((s) => s.resolvedAddress);
  const travelMode = useMapStore((s) => s.travelMode);
  const setTravelMode = useMapStore((s) => s.setTravelMode);
  const navOrigin = useMapStore((s) => s.navOrigin);
  const navDestination = useMapStore((s) => s.navDestination);
  const setNavOrigin = useMapStore((s) => s.setNavOrigin);
  const setNavDestination = useMapStore((s) => s.setNavDestination);
  const homeLocation = useMapStore((s) => s.homeLocation);
  const workLocation = useMapStore((s) => s.workLocation);
  const setHomeLocation = useMapStore((s) => s.setHomeLocation);
  const setWorkLocation = useMapStore((s) => s.setWorkLocation);
  const recentPlaces = useMapStore((s) => s.recentPlaces) ?? [];
  const savedPlaceIds = useMapStore((s) => s.savedPlaceIds) ?? [];
  const setPickOnMapMode = useMapStore((s) => s.setPickOnMapMode);
  const destination = useMapStore((s) => s.destination);

  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [selectedPreference, setSelectedPreference] = useState<"fastest" | "shortest" | "safest">(
    "fastest",
  );
  const [navigating, setNavigating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [showInputs, setShowInputs] = useState(true);
  const ai40 = useAi40Enabled();

  useEffect(() => {
    const agona = getPlaceById("gh-agona-ashanti");
    const bedomasеPlace = getPlaceById("gh-bedomase");
    if (!navOrigin && agona) setNavOrigin({ id: agona.id, label: agona.name, coordinates: agona.coordinates, source: "search", placeId: agona.id, address: agona.address });
    if (!navDestination && bedomasеPlace) setNavDestination({ id: bedomasеPlace.id, label: bedomasеPlace.name, coordinates: bedomasеPlace.coordinates, source: "search", placeId: bedomasеPlace.id, address: bedomasеPlace.address });
  }, [navOrigin, navDestination, setNavOrigin, setNavDestination]);

  useEffect(() => {
    if (!userLocation) return;
    if (navOrigin && navOrigin.source !== "gps") return;

    const label = resolvedAddress?.label
      ? `Current Location · ${resolvedAddress.city || resolvedAddress.label}`
      : "📍 Current Location";
    const address = resolvedAddress?.label;

    if (
      navOrigin?.source === "gps" &&
      Math.abs(navOrigin.coordinates.lat - userLocation.lat) < 1e-7 &&
      Math.abs(navOrigin.coordinates.lng - userLocation.lng) < 1e-7 &&
      navOrigin.label === label &&
      navOrigin.address === address
    ) {
      return;
    }

    setNavOrigin({
      id: "gps-current",
      label,
      coordinates: userLocation,
      source: "gps",
      address,
    });
  }, [userLocation, resolvedAddress, navOrigin, setNavOrigin]);

  useEffect(() => {
    if (destination && !navDestination) {
      setNavDestination({
        id: destination.id,
        label: destination.name,
        coordinates: destination.coordinates,
        source: "search",
        placeId: destination.id,
        address: destination.address,
      });
      setToQuery(destination.name);
    }
  }, [destination, navDestination, setNavDestination]);

  const origin = navOrigin;
  const dest = navDestination;

  const plannerInput = useMemo(() => {
    if (!origin || !dest) return null;
    return {
      from: {
        id: origin.id,
        label: origin.label,
        coordinates: origin.coordinates,
      },
      to: {
        id: dest.id,
        label: dest.label,
        coordinates: dest.coordinates,
      },
      mode: travelMode,
    };
  }, [origin, dest, travelMode]);

  const { routes: liveRoutes, loading: routesLoading, source: routeSource } =
    useRoutePlanner(plannerInput);

  const routes = liveRoutes.length > 0
    ? liveRoutes
    : origin && dest
      ? planAdvancedRoutes({
          from: { id: origin.id, label: origin.label, coordinates: origin.coordinates },
          to: { id: dest.id, label: dest.label, coordinates: dest.coordinates },
          mode: travelMode,
          preferences: ["fastest", "shortest", "safest"],
        })
      : [];

  const active = routes.find((r) => r.preference === selectedPreference) ?? routes[0] ?? null;

  const multiModeEta = useMemo(() => {
    if (!origin || !dest) return null;
    const modes: TravelMode[] = ["driving", "walking", "cycling", "transit", "motorcycle"];
    return Object.fromEntries(
      modes.map((mode) => {
        const [plan] = planAdvancedRoutes({
          from: { id: "o", label: "o", coordinates: origin.coordinates },
          to: { id: "d", label: "d", coordinates: dest.coordinates },
          mode,
          preferences: ["fastest"],
        });
        return [mode, plan];
      }),
    ) as Record<TravelMode, (typeof routes)[0]>;
  }, [origin, dest]);

  const safety = useMemo(() => {
    if (!active) return [];
    return analyzeRouteSafety({
      distanceKm: active.distanceKm,
      polyline: active.polyline,
      preference: active.preference,
      mode: travelMode,
    });
  }, [active, travelMode]);

  useEffect(() => {
    if (routes.length > 0) setShowInputs(false);
  }, [routes.length]);

  function useCurrentLocation() {
    if (!userLocation) {
      setPickOnMapMode("origin");
      return;
    }
    setNavOrigin({
      id: "gps-current",
      label: "📍 Current Location",
      coordinates: userLocation,
      source: "gps",
      address: resolvedAddress?.label,
    });
    setFromQuery("");
  }

  function swapEndpoints() {
    if (!origin || !dest) return;
    setNavOrigin(dest);
    setNavDestination(origin);
    setFromQuery("");
    setToQuery("");
  }

  const showRouteCard = !showInputs && origin && dest && !previewMode;

  return (
    <div className="relative h-[100dvh] w-full touch-manipulation bg-[#0A0E23]">
      <MapView places={[]} hideDefaultControls />
      <SmartMapTopBar />
      <RouteMapOverlay
        routes={routes}
        activeRouteId={active?.id ?? null}
        origin={origin?.coordinates}
        destination={dest?.coordinates}
      />

      <RoutePreviewBanner
        steps={active?.steps ?? []}
        fromLabel={origin?.label}
        toLabel={dest?.label}
        active={previewMode || navigating}
      />

      <div
        className="pointer-events-none absolute right-3 z-20 flex flex-col gap-2"
        style={{ top: previewMode ? "calc(5rem + env(safe-area-inset-top))" : "calc(11rem + env(safe-area-inset-top))" }}
      >
        <div className="pointer-events-auto">
          <NavigateSatelliteToggle />
        </div>
      </div>
      <MapTouchZoomHint />
      <MapRecenterButton />
      <MapZoomControls />
      {active && origin && dest && (
        <div className="pointer-events-none absolute z-20 hidden p-4 lg:block" style={{ top: "calc(5rem + env(safe-area-inset-top))", right: 0 }}>
          <SmartMapRouteSidebar active={active} destLabel={dest.label} navigating={navigating} onStartNavigation={() => { setPreviewMode(false); setNavigating(true); recordSuccessfulNavigation(); }} />
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 z-20 flex justify-center px-3" style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
        <TransportModeBar multiModeEta={multiModeEta} />
      </div>
      <MapMinimapInset />
      <MapAttributionFooter />
      <NavigationHudOverlay active={navigating} />
      <NavigateVoiceRunner
        navigating={navigating}
        steps={active?.steps ?? []}
        fromLabel={origin?.label}
        toLabel={dest?.label}
      />

      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20 p-3 sm:p-4"
        style={{ paddingTop: previewMode ? "calc(5.5rem + env(safe-area-inset-top))" : undefined }}
      >
        <div className="pointer-events-auto mx-auto flex max-w-xl flex-col gap-3">
          {showRouteCard ? (
            <RouteInputCard
              origin={origin}
              dest={dest}
              fromQuery={fromQuery}
              toQuery={toQuery}
              onFromQueryChange={setFromQuery}
              onToQueryChange={setToQuery}
              onSelectOrigin={(r) => setNavOrigin(endpointFromGeo(r, "search"))}
              onSelectDest={(r) => setNavDestination(endpointFromGeo(r, "search"))}
              onSwap={swapEndpoints}
              onClose={() => setShowInputs(true)}
              compact
            />
          ) : showInputs ? (
            <>
              <LocationPermissionCard compact />
              <LocationHud />

              <section className="rounded-3xl border border-white/30 bg-white/92 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0B3A63]/92">
                <p className="text-xs font-semibold uppercase tracking-wide text-sm-emerald">
                  Directions
                </p>
                <h1 className="mt-1 font-display text-xl font-extrabold sm:text-2xl">
                  Plan your route
                </h1>

                <RouteInputCard
                  className="mt-3 border-0 bg-transparent p-0 shadow-none"
                  origin={origin}
                  dest={dest}
                  fromQuery={fromQuery}
                  toQuery={toQuery}
                  onFromQueryChange={setFromQuery}
                  onToQueryChange={setToQuery}
                  onSelectOrigin={(r) => setNavOrigin(endpointFromGeo(r, "search"))}
                  onSelectDest={(r) => setNavDestination(endpointFromGeo(r, "search"))}
                  onSwap={swapEndpoints}
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={useCurrentLocation}
                    className="rounded-full bg-sm-primary/10 px-3 py-1.5 text-xs font-bold text-sm-primary"
                  >
                    📍 Current Location
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (homeLocation) setNavOrigin(homeLocation);
                      else if (userLocation) {
                        const ep: NavEndpoint = {
                          id: "home",
                          label: "My Home",
                          coordinates: userLocation,
                          source: "home",
                        };
                        setHomeLocation(ep);
                        setNavOrigin(ep);
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold dark:bg-white/10"
                  >
                    <Home className="h-3.5 w-3.5" /> My Home
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (workLocation) setNavOrigin(workLocation);
                      else if (userLocation) {
                        const ep: NavEndpoint = {
                          id: "work",
                          label: "My Work",
                          coordinates: userLocation,
                          source: "work",
                        };
                        setWorkLocation(ep);
                        setNavOrigin(ep);
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold dark:bg-white/10"
                  >
                    <Briefcase className="h-3.5 w-3.5" /> My Work
                  </button>
                  <button
                    type="button"
                    onClick={() => setPickOnMapMode("destination")}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold dark:bg-white/10"
                  >
                    <MapPinned className="h-3.5 w-3.5" /> Pick on Map
                  </button>
                </div>

                {recentPlaces.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[11px] font-semibold text-slate-500">Recent</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {recentPlaces.slice(0, 5).map((place) => (
                        <button
                          key={place.id}
                          type="button"
                          onClick={() => setNavDestination(place)}
                          className="rounded-full bg-sm-emerald/10 px-2.5 py-1 text-[11px] font-semibold text-sm-emerald"
                        >
                          {place.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {savedPlaceIds.length > 0 && (
                  <p className="mt-2 text-[11px] text-slate-500">
                    Favorites available from Search / map sheets ({savedPlaceIds.length} saved).
                  </p>
                )}

                <div className="mt-3 grid grid-cols-5 gap-1.5">
                  {MODES.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setTravelMode(id)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-bold",
                        travelMode === id
                          ? "bg-sm-primary text-white"
                          : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>

                {ai40 && origin && dest && (
                  <Link
                    href="/smart-safety"
                    className="mt-3 flex items-center justify-between rounded-2xl border border-sm-primary/30 bg-gradient-to-r from-sm-primary/10 to-sm-emerald/10 px-4 py-3 text-sm font-bold text-sm-primary"
                  >
                    <span>✨ View AI 4.0 route scores & predictive safety</span>
                    <span>→</span>
                  </Link>
                )}
              </section>

              <LiveLayerToggles />
            </>
          ) : null}

          {routesLoading && origin && dest && (
            <div className="flex items-center gap-2 rounded-2xl bg-white/90 px-4 py-2 text-sm font-semibold text-slate-600 shadow-lg">
              <Loader2 className="h-4 w-4 animate-spin text-[#1A73E8]" />
              Finding best routes…
            </div>
          )}
          {routeSource === "osrm" && routes.length > 0 && !routesLoading && (
            <p className="rounded-full bg-emerald-100 px-3 py-1 text-center text-[11px] font-bold text-emerald-800">
              Live road routing · {routes.length} route{routes.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      <div className="lg:hidden">
      <NavigateBottomSheet
        origin={origin}
        dest={dest}
        routes={routes}
        active={active}
        onSelectPreference={setSelectedPreference}
        travelMode={travelMode}
        onTravelModeChange={setTravelMode}
        multiModeEta={multiModeEta}
        safety={safety}
        navigating={navigating}
        previewMode={previewMode}
        onSwap={swapEndpoints}
        onPreview={() => {
          setPreviewMode(true);
          setShowInputs(false);
        }}
        onStartNavigation={() => {
          setPreviewMode(false);
          setNavigating(true);
          recordSuccessfulNavigation();
        }}
        modes={MODES}
      />
      </div>
    </div>
  );
}
