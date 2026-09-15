"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  formatAccuracy,
  getCurrentFix,
  isValidCoordinates,
  readGeolocationPermission,
  watchLocation,
} from "@/lib/geo/geolocation";
import { getAccuracyInfo, isStaleLocation } from "@/lib/geo/accuracy";
import { reverseGeocode } from "@/lib/geo/reverse-geocode-service";
import { readLocationCache } from "@/lib/geo/location-cache";
import { classifyGeolocationError, logSmartMapError } from "@/lib/errors/smart-map-errors";
import { useMapStore } from "@/stores/map-store";
import { useOnlineStatus } from "@/lib/hooks/use-online-status";

const REVERSE_DEBOUNCE_MS = 45_000;
const REVERSE_COORD_PRECISION = 4;

/**
 * Starts continuous GPS tracking and reverse-geocoding into the map store.
 * Safe to mount once in the app shell.
 */
export function useLiveLocation(enabled = true) {
  const setUserLocation = useMapStore((s) => s.setUserLocation);
  const setLocationMeta = useMapStore((s) => s.setLocationMeta);
  const setLocationPermission = useMapStore((s) => s.setLocationPermission);
  const setResolvedAddress = useMapStore((s) => s.setResolvedAddress);
  const setLocationEngineStatus = useMapStore((s) => s.setLocationEngineStatus);
  const setAddressStatus = useMapStore((s) => s.setAddressStatus);
  const locationPermission = useMapStore((s) => s.locationPermission);
  const online = useOnlineStatus();

  const lastReverseAt = useRef(0);
  const lastReverseKey = useRef("");
  const reverseAbortRef = useRef<AbortController | null>(null);
  const hydratedCache = useRef(false);

  const resolveAddress = useCallback(
    async (lat: number, lng: number, accuracyM: number | null, force = false) => {
      const key = `${lat.toFixed(REVERSE_COORD_PRECISION)},${lng.toFixed(REVERSE_COORD_PRECISION)}`;
      const now = Date.now();
      if (!force && key === lastReverseKey.current && now - lastReverseAt.current < REVERSE_DEBOUNCE_MS) {
        return;
      }
      lastReverseKey.current = key;
      lastReverseAt.current = now;

      reverseAbortRef.current?.abort();
      const controller = new AbortController();
      reverseAbortRef.current = controller;

      setAddressStatus("resolving", null);

      const result = await reverseGeocode(
        { lat, lng },
        { signal: controller.signal, offline: !online, accuracyM },
      );

      if (controller.signal.aborted) return;

      if (result.address) {
        setResolvedAddress(result.address);
        setAddressStatus("resolved", null);
      } else {
        setAddressStatus(result.status, result.error?.userMessage ?? "Address unavailable — tap to retry");
      }
    },
    [online, setAddressStatus, setResolvedAddress],
  );

  const applyFix = useCallback(
    (fix: {
      coordinates: { lat: number; lng: number };
      accuracyM: number | null;
      speedMps: number | null;
      timestamp: number;
    }) => {
      if (!isValidCoordinates(fix.coordinates)) return;

      const accuracy = getAccuracyInfo(fix.accuracyM);
      const stale = isStaleLocation(fix.timestamp);

      setUserLocation(fix.coordinates);
      setLocationMeta({
        accuracyM: fix.accuracyM,
        speedMps: fix.speedMps,
        updatedAt: fix.timestamp,
        source: "gps",
      });
      setLocationPermission("granted");

      if (accuracy.isLow || stale) {
        setLocationEngineStatus("low_accuracy");
      } else {
        setLocationEngineStatus("resolved");
      }

      void resolveAddress(fix.coordinates.lat, fix.coordinates.lng, fix.accuracyM);
    },
    [resolveAddress, setLocationEngineStatus, setLocationMeta, setLocationPermission, setUserLocation],
  );

  const requestLocation = useCallback(async () => {
    if (!online) {
      setLocationEngineStatus("network_unavailable");
      const cached = readLocationCache();
      if (cached) {
        setUserLocation(cached.coordinates);
        setLocationMeta({
          accuracyM: cached.accuracyM,
          speedMps: null,
          updatedAt: cached.updatedAt,
          source: "gps",
        });
        if (cached.address) {
          setResolvedAddress(cached.address);
          setAddressStatus("resolved", null);
        }
      }
      return false;
    }

    setLocationEngineStatus("locating");
    setLocationPermission("prompt");
    try {
      const fix = await getCurrentFix({ enableHighAccuracy: true, timeout: 15_000, maximumAge: 5000 });
      applyFix(fix);
      return true;
    } catch (error) {
      const classified = classifyGeolocationError(error as GeolocationPositionError);
      logSmartMapError(classified.code, error);
      const permission = await readGeolocationPermission();
      setLocationPermission(permission === "granted" ? "denied" : permission);
      setLocationEngineStatus(
        classified.code === "LOCATION_PERMISSION_DENIED" ? "permission_denied" : "unavailable",
      );
      setLocationMeta({
        accuracyM: null,
        speedMps: null,
        updatedAt: Date.now(),
        source: "none",
      });
      return false;
    }
  }, [
    applyFix,
    online,
    setAddressStatus,
    setLocationEngineStatus,
    setLocationMeta,
    setLocationPermission,
    setResolvedAddress,
    setUserLocation,
  ]);

  const refreshAddress = useCallback(() => {
    const coords = useMapStore.getState().userLocation;
    const meta = useMapStore.getState().locationMeta;
    if (!coords) return;
    lastReverseKey.current = "";
    void resolveAddress(coords.lat, coords.lng, meta.accuracyM, true);
  }, [resolveAddress]);

  useEffect(() => {
    if (!enabled || hydratedCache.current) return;
    hydratedCache.current = true;
    const cached = readLocationCache();
    if (cached) {
      setUserLocation(cached.coordinates);
      setLocationMeta({
        accuracyM: cached.accuracyM,
        speedMps: null,
        updatedAt: cached.updatedAt,
        source: "gps",
      });
      if (cached.address) {
        setResolvedAddress(cached.address);
        setAddressStatus("resolved", null);
      }
    }
  }, [enabled, setAddressStatus, setLocationMeta, setResolvedAddress, setUserLocation]);

  useEffect(() => {
    if (!enabled) return;
    let stopWatch: () => void = () => undefined;
    let cancelled = false;

    void (async () => {
      const permission = await readGeolocationPermission();
      if (cancelled) return;
      setLocationPermission(permission);
      if (permission === "denied") {
        setLocationEngineStatus("permission_denied");
        return;
      }
      if (permission === "unavailable") {
        setLocationEngineStatus("unavailable");
        return;
      }
      if (!online) {
        setLocationEngineStatus("network_unavailable");
        return;
      }

      setLocationEngineStatus("locating");

      try {
        const fix = await getCurrentFix();
        if (cancelled) return;
        applyFix(fix);
      } catch (error) {
        if (!cancelled) {
          const classified = classifyGeolocationError(error as GeolocationPositionError);
          const next = await readGeolocationPermission();
          setLocationPermission(next === "granted" ? "denied" : next);
          setLocationEngineStatus(
            classified.code === "LOCATION_PERMISSION_DENIED" ? "permission_denied" : "unavailable",
          );
        }
      }

      stopWatch = watchLocation(
        (fix) => {
          if (!cancelled) applyFix(fix);
        },
        async (error) => {
          if (cancelled) return;
          const next = await readGeolocationPermission();
          if (next === "denied") {
            setLocationPermission("denied");
            setLocationEngineStatus("permission_denied");
          } else if ("code" in error && error.code === 3) {
            setLocationEngineStatus("unavailable");
          }
        },
      );
    })();

    return () => {
      cancelled = true;
      stopWatch();
      reverseAbortRef.current?.abort();
    };
  }, [applyFix, enabled, online, setLocationEngineStatus, setLocationPermission]);

  return {
    requestLocation,
    refreshAddress,
    locationPermission,
    formatAccuracy,
    online,
  };
}
