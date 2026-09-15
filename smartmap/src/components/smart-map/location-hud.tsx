"use client";

import { Crosshair, MapPinned, RefreshCw } from "lucide-react";
import { formatAccuracy } from "@/lib/geo/geolocation";
import { getAccuracyInfo, formatRelativeTime } from "@/lib/geo/accuracy";
import { coordinateLabel } from "@/lib/geo/reverse-geocode-service";
import { useLiveLocation } from "@/lib/geo/use-live-location";
import { useMapStore } from "@/stores/map-store";
import { cn } from "@/lib/utils";

export function LocationPermissionCard({ compact = false }: { compact?: boolean }) {
  const permission = useMapStore((s) => s.locationPermission);
  const engineStatus = useMapStore((s) => s.locationEngineStatus);
  const { requestLocation } = useLiveLocation(false);
  const setPickOnMapMode = useMapStore((s) => s.setPickOnMapMode);

  if (permission === "granted" && engineStatus !== "permission_denied") return null;

  if (permission === "unknown" || permission === "prompt" || engineStatus === "locating") {
    return (
      <div className="rounded-2xl border border-white/30 bg-white/95 p-4 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-[#0B1220]/95">
        <p className="text-xs font-semibold uppercase tracking-wide text-sm-emerald">Location access</p>
        <h2 className="mt-1 font-display text-lg font-extrabold">
          {engineStatus === "locating" ? "Locating…" : "Enable GPS to continue"}
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Smart Map needs your location to show <strong>You are here</strong>, find nearby emergency
          services, and navigate accurately — in Ghana and worldwide.
        </p>
        {engineStatus !== "locating" && (
          <button
            type="button"
            onClick={() => void requestLocation()}
            className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-[#0F5B8D] px-4 py-2.5 text-sm font-bold text-white"
          >
            <Crosshair className="h-4 w-4" />
            Allow location
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-300/60 bg-amber-50/95 p-4 shadow-lg dark:border-amber-500/30 dark:bg-amber-950/80">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-200">
        {engineStatus === "unavailable" ? "Location unavailable" : "Location denied"}
      </p>
      <h2 className="mt-1 font-display text-lg font-extrabold text-amber-950 dark:text-amber-50">
        {engineStatus === "unavailable"
          ? "Location services are turned off."
          : "We can't find you yet"}
      </h2>
      {!compact && (
        <p className="mt-1 text-sm text-amber-900/80 dark:text-amber-100/80">
          Location powers live GPS, nearest police/hospitals, and From → To routes. You can retry
          permission or pick a point on the map manually.
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void requestLocation()}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-[#0F5B8D] px-4 py-2.5 text-sm font-bold text-white"
        >
          <RefreshCw className="h-4 w-4" />
          Retry permission
        </button>
        <button
          type="button"
          onClick={() => setPickOnMapMode("origin")}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-[#0F5B8D] dark:bg-white/10 dark:text-white"
        >
          <MapPinned className="h-4 w-4" />
          Pick on map
        </button>
      </div>
    </div>
  );
}

export function LocationHud() {
  const userLocation = useMapStore((s) => s.userLocation);
  const address = useMapStore((s) => s.resolvedAddress);
  const meta = useMapStore((s) => s.locationMeta);
  const permission = useMapStore((s) => s.locationPermission);
  const addressStatus = useMapStore((s) => s.addressStatus);
  const addressError = useMapStore((s) => s.addressError);
  const engineStatus = useMapStore((s) => s.locationEngineStatus);
  const setFollowUser = useMapStore((s) => s.setFollowUser);
  const { requestLocation, refreshAddress } = useLiveLocation(false);

  if (permission !== "granted" || !userLocation) return null;

  const accuracyInfo = getAccuracyInfo(meta?.accuracyM ?? null);
  const accuracyLabel = formatAccuracy(meta?.accuracyM ?? null);
  const updatedLabel = formatRelativeTime(meta?.updatedAt);

  const displayTitle =
    address?.city || address?.neighbourhood || address?.district || address?.region || null;
  const subtitle = [address?.district, address?.region, address?.country].filter(Boolean).join(", ");

  const addressLine =
    addressStatus === "resolving"
      ? "Resolving address…"
      : address?.label ?? (addressStatus === "failed" ? null : "Resolving address…");

  return (
    <div className="rounded-2xl border border-white/30 bg-white/95 p-4 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-[#0B1220]/95">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#0F5B8D]">
            <span className="text-base" aria-hidden>📍</span>
            You are here
          </p>
          {displayTitle ? (
            <p className="mt-1 truncate text-base font-bold leading-snug">{displayTitle}</p>
          ) : addressStatus === "resolving" ? (
            <p className="mt-1 text-sm font-semibold text-slate-500">Resolving address…</p>
          ) : (
            <p className="mt-1 text-sm font-semibold text-slate-500">Location found</p>
          )}
          {subtitle && <p className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={() => {
            void requestLocation();
            setFollowUser(true);
          }}
          className="shrink-0 rounded-xl bg-[#0F5B8D]/10 px-3 py-2 text-xs font-bold text-[#0F5B8D] min-h-[44px]"
          aria-label="Refresh location"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {addressLine && addressStatus !== "failed" && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{addressLine}</p>
      )}

      {addressStatus === "failed" && (
        <button
          type="button"
          onClick={refreshAddress}
          className="mt-2 text-sm font-semibold text-amber-700 underline dark:text-amber-300"
        >
          {addressError ?? "Address unavailable — tap to retry"}
        </button>
      )}

      <dl className="mt-3 space-y-2 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Coordinates</dt>
          <dd className="font-mono text-xs">{coordinateLabel(userLocation)}</dd>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Accuracy</dt>
            <dd className={cn("font-semibold", accuracyInfo.isLow && "text-amber-600 dark:text-amber-400")}>
              {accuracyLabel} · {accuracyInfo.label}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Updated</dt>
            <dd>{updatedLabel}</dd>
          </div>
        </div>
      </dl>

      {accuracyInfo.guidance && (
        <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">{accuracyInfo.guidance}</p>
      )}

      {(accuracyInfo.isLow || engineStatus === "low_accuracy") && (
        <button
          type="button"
          onClick={() => void requestLocation()}
          className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[#0F5B8D]/30 bg-[#0F5B8D]/5 px-4 py-2.5 text-sm font-bold text-[#0F5B8D]"
        >
          <Crosshair className="h-4 w-4" />
          Improve accuracy
        </button>
      )}
    </div>
  );
}
