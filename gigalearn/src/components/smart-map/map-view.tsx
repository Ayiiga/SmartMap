"use client";

import { useEffect, useRef, useState } from "react";
import {
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  GeolocateControl,
  ScaleControl,
} from "maplibre-gl";
import type { Map as MapLibreMapType, Marker as MarkerType } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { PLACES } from "@/content/smart-map/places";
import { getCategoryMeta } from "@/content/smart-map/categories";
import { MAP_STYLE_URLS, DEFAULT_CENTER, DEFAULT_ZOOM, applyMapStyle, initialMapStyle, mapStyleKey } from "@/lib/map/styles";
import { useMapStore } from "@/stores/map-store";
import { getCountry } from "@/content/smart-map/countries";
import type { Place, Coordinates } from "@/types/smart-map";
import type { NavEndpoint } from "@/lib/geo/types";
import { registerMapForScreenshot } from "@/lib/map/map-screenshot";

interface MapViewProps {
  places?: Place[];
  className?: string;
  interactive?: boolean;
  initialCenter?: Coordinates;
  initialZoom?: number;
  hideDefaultControls?: boolean;
  onPlaceSelect?: (place: Place) => void;
  /** Extra markers (e.g. live emergency POIs) */
  extraMarkers?: Array<{
    id: string;
    name: string;
    coordinates: { lat: number; lng: number };
    color?: string;
    emoji?: string;
  }>;
}

export function MapView({
  places = PLACES,
  className = "",
  interactive = true,
  initialCenter,
  initialZoom,
  hideDefaultControls = false,
  onPlaceSelect,
  extraMarkers = [],
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMapType | null>(null);
  const markersRef = useRef<MarkerType[]>([]);
  const extraMarkersRef = useRef<MarkerType[]>([]);
  const userMarkerRef = useRef<MarkerType | null>(null);
  const geolocateRef = useRef<GeolocateControl | null>(null);
  const appliedStyleRef = useRef<string>("");
  const [ready, setReady] = useState(false);
  const didFlyToUser = useRef(false);

  const mapStyle = useMapStore((s) => s.mapStyle);
  const countryCode = useMapStore((s) => s.countryCode);
  const userLocation = useMapStore((s) => s.userLocation);
  const selectedPlaceId = useMapStore((s) => s.selectedPlaceId);
  const activeCategory = useMapStore((s) => s.activeCategory);
  const followUser = useMapStore((s) => s.followUser);
  const pickOnMapMode = useMapStore((s) => s.pickOnMapMode);
  const setSelectedPlaceId = useMapStore((s) => s.setSelectedPlaceId);
  const setPickOnMapMode = useMapStore((s) => s.setPickOnMapMode);
  const setNavOrigin = useMapStore((s) => s.setNavOrigin);
  const setNavDestination = useMapStore((s) => s.setNavDestination);
  const setUserLocation = useMapStore((s) => s.setUserLocation);
  const setLocationMeta = useMapStore((s) => s.setLocationMeta);
  const setResolvedAddress = useMapStore((s) => s.setResolvedAddress);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const country = getCountry(countryCode);
    const initial = userLocation ?? initialCenter ?? country.center ?? DEFAULT_CENTER;
    const zoom = userLocation ? 15 : initialZoom ?? country.zoom ?? DEFAULT_ZOOM;
    const initialStyle = initialMapStyle(mapStyle);
    const map = new MapLibreMap({
      container: containerRef.current,
      style: initialStyle,
      center: [initial.lng, initial.lat],
      zoom,
      attributionControl: { compact: true },
      interactive,
      canvasContextAttributes: { preserveDrawingBuffer: true },
    });
    appliedStyleRef.current = mapStyleKey(mapStyle);
    registerMapForScreenshot(map);

    if (!hideDefaultControls) {
      map.addControl(new NavigationControl({ visualizePitch: true }), "bottom-right");
      const geolocate = new GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showAccuracyCircle: true,
        showUserLocation: false,
      });
      geolocateRef.current = geolocate;
      map.addControl(geolocate, "bottom-right");
      map.addControl(new ScaleControl({ maxWidth: 100 }), "bottom-left");
    }

    map.touchZoomRotate.enable();
    map.dragPan.enable();
    map.scrollZoom.enable();
    map.doubleClickZoom.enable();

    map.on("dragstart", () => useMapStore.getState().setFollowUser(false));
    map.on("zoomstart", () => useMapStore.getState().setFollowUser(false));

    const markReady = () => setReady(true);
    const syncMapSize = () => {
      map.resize();
    };
    map.on("load", () => {
      syncMapSize();
      markReady();
    });
    map.on("idle", markReady);
    map.on("error", () => setReady(true));
    const readyFallback = window.setTimeout(() => {
      syncMapSize();
      markReady();
    }, 2500);
    mapRef.current = map;

    const resizeObserver =
      typeof ResizeObserver !== "undefined" && containerRef.current
        ? new ResizeObserver(() => syncMapSize())
        : null;
    resizeObserver?.observe(containerRef.current);

    map.on("click", async (e) => {
      const mode = useMapStore.getState().pickOnMapMode;
      if (!mode) return;
      const coordinates = { lat: e.lngLat.lat, lng: e.lngLat.lng };
      const endpoint: NavEndpoint = {
        id: `map-${coordinates.lat.toFixed(5)}-${coordinates.lng.toFixed(5)}`,
        label: `Pinned ${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`,
        coordinates,
        source: "map",
      };
      try {
        const res = await fetch(
          `/api/geo/reverse?lat=${coordinates.lat}&lng=${coordinates.lng}`,
          { cache: "no-store" },
        );
        if (res.ok) {
          const data = await res.json();
          if (data.address?.label) {
            endpoint.label = data.address.label;
            endpoint.address = data.address.label;
          }
        }
      } catch {
        // keep coordinate label
      }
      if (mode === "origin") {
        setNavOrigin(endpoint);
        setUserLocation(coordinates);
        setLocationMeta({ source: "manual", updatedAt: Date.now(), accuracyM: null, speedMps: null });
        setResolvedAddress(null);
      } else {
        setNavDestination(endpoint);
      }
      setPickOnMapMode(null);
    });

    return () => {
      resizeObserver?.disconnect();
      window.clearTimeout(readyFallback);
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      extraMarkersRef.current.forEach((m) => m.remove());
      extraMarkersRef.current = [];
      userMarkerRef.current?.remove();
      registerMapForScreenshot(null);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive, countryCode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const nextKey = mapStyleKey(mapStyle);
    if (appliedStyleRef.current === nextKey) return;
    appliedStyleRef.current = nextKey;
    applyMapStyle(map, mapStyle);
  }, [mapStyle, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const filtered =
      activeCategory === "all" ? places : places.filter((p) => p.category === activeCategory);

    filtered.forEach((place) => {
      const meta = getCategoryMeta(place.category);
      const el = document.createElement("button");
      el.type = "button";
      el.className = "sm-map-marker";
      el.style.cssText = `
        width: 34px; height: 34px; border-radius: 999px; border: 2px solid white;
        background: ${meta.color}; color: white; font-size: 14px; line-height: 1;
        display: grid; place-items: center; box-shadow: 0 8px 20px rgba(15,76,129,0.35);
        cursor: pointer;
      `;
      el.textContent = meta.emoji;
      el.setAttribute("aria-label", place.name);
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        setSelectedPlaceId(place.id);
        onPlaceSelect?.(place);
        map.flyTo({
          center: [place.coordinates.lng, place.coordinates.lat],
          zoom: 14,
          essential: true,
        });
      });

      if (selectedPlaceId === place.id) {
        el.style.transform = "scale(1.2)";
        el.style.zIndex = "2";
      }

      const marker = new Marker({ element: el, anchor: "bottom" })
        .setLngLat([place.coordinates.lng, place.coordinates.lat])
        .addTo(map);
      markersRef.current.push(marker);
    });
  }, [places, activeCategory, ready, selectedPlaceId, setSelectedPlaceId, onPlaceSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    extraMarkersRef.current.forEach((m) => m.remove());
    extraMarkersRef.current = [];
    extraMarkers.forEach((item) => {
      const el = document.createElement("div");
      el.style.cssText = `
        width: 30px; height: 30px; border-radius: 999px; border: 2px solid white;
        background: ${item.color ?? "#DC2626"}; color: white; font-size: 13px;
        display: grid; place-items: center; box-shadow: 0 6px 16px rgba(0,0,0,0.25);
      `;
      el.textContent = item.emoji ?? "•";
      el.title = item.name;
      extraMarkersRef.current.push(
        new Marker({ element: el }).setLngLat([item.coordinates.lng, item.coordinates.lat]).addTo(map),
      );
    });
  }, [extraMarkers, ready]);

  // Blue "You are here" marker + continuous follow
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !userLocation) return;

    userMarkerRef.current?.remove();
    const wrap = document.createElement("div");
    wrap.style.cssText = "position: relative; width: 44px; height: 44px;";
    wrap.innerHTML = `
      <div style="
        position:absolute; inset:0; border-radius:999px;
        background: rgba(37,99,235,0.18); animation: smPulse 1.8s ease-out infinite;
      "></div>
      <div style="
        position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
        width:18px; height:18px; border-radius:999px; background:#2563EB;
        border:3px solid white; box-shadow: 0 0 0 4px rgba(37,99,235,0.28);
      " title="You are here"></div>
    `;
    wrap.setAttribute("aria-label", "You are here");
    if (!document.getElementById("sm-you-are-here-style")) {
      const style = document.createElement("style");
      style.id = "sm-you-are-here-style";
      style.textContent = `@keyframes smPulse{0%{transform:scale(.6);opacity:.8}70%{transform:scale(1.25);opacity:0}100%{opacity:0}}`;
      document.head.appendChild(style);
    }

    userMarkerRef.current = new Marker({ element: wrap })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map);

    if (followUser) {
      if (!didFlyToUser.current) {
        map.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 15, essential: true });
        didFlyToUser.current = true;
      } else {
        const center = map.getCenter();
        const moved =
          Math.abs(center.lat - userLocation.lat) > 0.00005 ||
          Math.abs(center.lng - userLocation.lng) > 0.00005;
        if (moved) {
          map.easeTo({ center: [userLocation.lng, userLocation.lat], duration: 600 });
        }
      }
    }
  }, [userLocation, ready, followUser]);

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{ cursor: pickOnMapMode ? "crosshair" : undefined }}
    >
      <div className="absolute inset-0 touch-pan-x touch-pan-y">
        <div ref={containerRef} className="h-full w-full min-h-[240px]" />
      </div>
      {pickOnMapMode && (
        <div className="pointer-events-none absolute inset-x-0 top-3 z-30 flex justify-center">
          <p className="rounded-full bg-sm-primary px-4 py-2 text-xs font-bold text-white shadow-lg">
            Tap the map to set {pickOnMapMode === "origin" ? "From" : "To"}
          </p>
        </div>
      )}
      {!ready && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-gradient-to-br from-sm-primary via-[#0B3A63] to-sm-emerald">
          <div className="flex flex-col items-center gap-3 text-white">
            <div className="h-12 w-12 animate-pulse rounded-2xl bg-white/20" />
            <p className="font-display text-lg font-bold tracking-tight">Loading Smart Map…</p>
          </div>
        </div>
      )}
    </div>
  );
}
