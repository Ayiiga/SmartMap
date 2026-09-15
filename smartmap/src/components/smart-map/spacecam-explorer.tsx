"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  Globe,
  Map as MapIcon,
  Minus,
  Plus,
  Search,
  Settings,
} from "lucide-react";
import { useMapStore } from "@/stores/map-store";
import { cn } from "@/lib/utils";
import { useSpaceCamStore, type SpaceCamMode } from "@/lib/spacecam/spacecam-store";
import { formatSpaceCamScale, getZoomFusionStateFromLevel } from "@/lib/spacecam/zoom-fusion";
import { useObserverContext } from "@/lib/spacecam/hooks/use-observer-context";
import { useDeviceOrientation } from "@/lib/spacecam/hooks/use-device-orientation";
import { identifyObjectsNearDirection, orientationToHorizontal, getIdentifyDisclaimer } from "@/lib/spacecam/astronomy/identify";
import { fetchSatellitePositions } from "@/lib/spacecam/satellite-service";
import { fetchCometData } from "@/lib/spacecam/comet-service";
import { ObjectInfoSheet } from "./spacecam/object-info-sheet";
import { SpaceCamSatelliteTilt } from "@/components/smart-map/spacecam-satellite-tilt";
import { SearchPanel } from "./spacecam/search-panel";
import { LayersMenu } from "./spacecam/layers-menu";
import { TimeTravelPanel } from "./spacecam/time-travel";

const SkyRenderer = dynamic(
  () => import("./spacecam/sky-renderer").then((m) => m.SkyRenderer),
  { ssr: false, loading: () => <LoadingFallback label="Loading sky map…" /> },
);

const SpaceRenderer = dynamic(
  () => import("./spacecam/space-renderer").then((m) => m.SpaceRenderer),
  { ssr: false, loading: () => <LoadingFallback label="Loading 3D space…" /> },
);

const CameraView = dynamic(
  () => import("./spacecam/camera-view").then((m) => m.CameraView),
  { ssr: false, loading: () => <LoadingFallback label="Loading camera…" /> },
);

function LoadingFallback({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[#020617]">
      <p className="text-sm text-cyan-200">{label}</p>
    </div>
  );
}

const MODE_TABS: { mode: SpaceCamMode; label: string; icon: typeof Camera }[] = [
  { mode: "camera", label: "Camera", icon: Camera },
  { mode: "sky-map", label: "Sky Map", icon: Globe },
  { mode: "space-3d", label: "3D Space", icon: MapIcon },
];

export function SpaceCamExplorer() {
  const mode = useSpaceCamStore((s) => s.mode);
  const setMode = useSpaceCamStore((s) => s.setMode);
  const zoomLevel = useSpaceCamStore((s) => s.zoomLevel);
  const setZoomLevel = useSpaceCamStore((s) => s.setZoomLevel);
  const layers = useSpaceCamStore((s) => s.layers);
  const orientation = useSpaceCamStore((s) => s.orientation);
  const setSearchOpen = useSpaceCamStore((s) => s.setSearchOpen);
  const setLayersOpen = useSpaceCamStore((s) => s.setLayersOpen);
  const setTimeOpen = useSpaceCamStore((s) => s.setTimeOpen);
  const setIdentifyResults = useSpaceCamStore((s) => s.setIdentifyResults);
  const setSelectedObject = useSpaceCamStore((s) => s.setSelectedObject);
  const identifyResults = useSpaceCamStore((s) => s.identifyResults);
  const dataSourceLabel = useSpaceCamStore((s) => s.dataSourceLabel);
  const setDataSourceLabel = useSpaceCamStore((s) => s.setDataSourceLabel);
  const reducedMotion = useSpaceCamStore((s) => s.reducedMotion);
  const setReducedMotion = useSpaceCamStore((s) => s.setReducedMotion);

  const userLocation = useMapStore((s) => s.userLocation);
  const observer = useObserverContext();
  const { requestPermission } = useDeviceOrientation();

  const [isOnline, setIsOnline] = useState(true);
  const [satelliteMessage, setSatelliteMessage] = useState("");
  const [identifyOpen, setIdentifyOpen] = useState(false);
  const [satelliteMapOpen, setSatelliteMapOpen] = useState(false);
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);

  const fusion = getZoomFusionStateFromLevel(zoomLevel);

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    const labels: Record<SpaceCamMode, string> = {
      camera: "Camera View",
      "sky-map": "3D Visualization",
      "space-3d": "3D Visualization",
    };
    setDataSourceLabel(labels[mode]);
  }, [mode, setDataSourceLabel]);

  useEffect(() => {
    if (!layers.satellites) return;
    void fetchSatellitePositions(isOnline).then((r) => setSatelliteMessage(r.message));
  }, [layers.satellites, isOnline]);

  useEffect(() => {
    if (!layers.comets) return;
    void fetchCometData(isOnline);
  }, [layers.comets, isOnline]);

  useEffect(() => {
    if (mode === "camera" && orientation.permission === "prompt") {
      void requestPermission();
    }
  }, [mode, orientation.permission, requestPermission]);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(prefersReduced);
  }, [setReducedMotion]);

  const handleIdentify = useCallback(() => {
    const pointing = orientation.available
      ? orientationToHorizontal(orientation.alpha, orientation.beta, orientation.gamma)
      : { azimuthDeg: orientation.manualAzimuth, altitudeDeg: orientation.manualAltitude };

    const candidates = identifyObjectsNearDirection(pointing, observer, {
      sensorAccuracy: orientation.accuracy === "unavailable" ? "low" : orientation.accuracy,
    });

    setIdentifyResults(candidates.map((c) => c.object));
    setIdentifyOpen(true);
    if (candidates[0]) setSelectedObject(candidates[0].object);
  }, [orientation, observer, setIdentifyResults, setSelectedObject]);

  const viewLabel =
    mode === "camera"
      ? "CAMERA VIEW"
      : mode === "sky-map"
        ? "SKY MAP"
        : "3D SPACE";

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-[#020208] text-[#F8FAFC]">
      {/* Visualization layer */}
      {mode === "camera" && (
        <CameraView
          observer={observer}
          layers={layers}
          orientation={orientation}
          className="absolute inset-0"
        />
      )}
      {mode === "sky-map" && (
        <SkyRenderer observer={observer} className="absolute inset-0" />
      )}
      {mode === "space-3d" && (
        <SpaceRenderer observer={observer} className="absolute inset-0" />
      )}
      {satelliteMapOpen && (
        <div className="absolute inset-0 z-[5]">
          <SpaceCamSatelliteTilt />
        </div>
      )}

      {/* Top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-3 sm:p-5">
        <Link
          href="/"
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-slate-950/75 px-3 py-2 text-sm font-bold shadow-lg backdrop-blur"
          aria-label="Return to Smart Map"
        >
          <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Smart Map</span>
        </Link>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-full bg-slate-950/75 shadow-lg backdrop-blur"
            aria-label="Search astronomical objects"
          >
            <Search className="h-4 w-4" />
          </button>
          <div className="rounded-2xl bg-slate-950/75 px-3 py-2 text-right shadow-lg backdrop-blur">
            <p className="text-[10px] font-bold tracking-[0.16em] text-cyan-200">{viewLabel}</p>
            <p className="text-xs text-white/75">{dataSourceLabel}</p>
          </div>
        </div>
      </div>

      {/* Status banners */}
      {!isOnline && (
        <p className="absolute inset-x-3 top-16 z-20 rounded-xl bg-amber-400/90 px-3 py-2 text-center text-xs font-bold text-slate-950">
          Offline — cached catalog available; live satellite/comet data unavailable
        </p>
      )}
      {!userLocation && (
        <p className="absolute inset-x-3 top-[4.5rem] z-20 rounded-xl bg-slate-800/80 px-3 py-1.5 text-center text-[10px] text-slate-300 backdrop-blur">
          Location unavailable — sky view centered at 0°, 0°
        </p>
      )}
      {layers.satellites && satelliteMessage && (
        <p className="absolute inset-x-3 top-24 z-10 hidden text-center text-[10px] text-slate-400 sm:block">
          {satelliteMessage}
        </p>
      )}

      {/* Floating controls — zoom group + settings sheet */}
      <div
        className="pointer-events-auto absolute right-4 z-30 flex flex-col gap-3"
        style={{ top: "calc(5rem + env(safe-area-inset-top))" }}
      >
        <div className="flex flex-col overflow-hidden rounded-2xl border border-[#1E293B] shadow-lg">
          <FloatingButton
            icon={Plus}
            label="Zoom in"
            className="rounded-t-2xl border-b border-[#1E293B]"
            onClick={() => setZoomLevel(Math.min(10, zoomLevel + 1) as typeof zoomLevel)}
          />
          <FloatingButton
            icon={Minus}
            label="Zoom out"
            className="rounded-b-2xl"
            onClick={() => setZoomLevel(Math.max(0, zoomLevel - 1) as typeof zoomLevel)}
          />
        </div>
        <FloatingButton
          icon={Settings}
          label="SpaceCam settings"
          onClick={() => setSettingsSheetOpen(true)}
        />
      </div>

      {/* Identify results */}
      {identifyOpen && identifyResults.length > 0 && (
        <div className="pointer-events-auto absolute left-3 top-28 z-30 max-w-xs rounded-2xl border border-white/20 bg-slate-950/90 p-3 backdrop-blur-xl">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Possible object</p>
          <p className="mt-1 text-xs text-slate-400">
            {getIdentifyDisclaimer(orientation.accuracy)}
          </p>
          <ul className="mt-2 space-y-1">
            {identifyResults.slice(0, 3).map((obj) => (
              <li key={obj.id}>
                <button
                  type="button"
                  onClick={() => setSelectedObject(obj)}
                  className="w-full rounded-xl bg-white/5 px-3 py-2 text-left text-sm font-bold hover:bg-white/10"
                >
                  {obj.name}
                  <span className="ml-2 text-xs font-normal text-slate-400">{obj.type}</span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setIdentifyOpen(false)}
            className="mt-2 text-xs text-slate-500 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Settings bottom sheet */}
      {settingsSheetOpen && (
        <div
          className="pointer-events-auto fixed inset-0 z-50 flex items-end justify-center bg-black/50"
          onClick={() => setSettingsSheetOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-t-3xl border border-[#1E293B] bg-[#0F172A]/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="SpaceCam settings"
          >
            <p className="text-sm font-bold text-[#F8FAFC]">SpaceCam settings</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => { setMode("camera"); setSettingsSheetOpen(false); }} className="min-h-[44px] rounded-xl border border-[#2A3A5C] text-sm font-bold text-[#F8FAFC]">Camera</button>
              <button type="button" onClick={() => { setMode("sky-map"); setSettingsSheetOpen(false); }} className="min-h-[44px] rounded-xl border border-[#2A3A5C] text-sm font-bold text-[#F8FAFC]">Sky Map</button>
              <button type="button" onClick={() => { setMode("space-3d"); setSettingsSheetOpen(false); }} className="min-h-[44px] rounded-xl border border-[#2A3A5C] text-sm font-bold text-[#F8FAFC]">3D Space</button>
              <button type="button" onClick={() => setLayersOpen(true)} className="min-h-[44px] rounded-xl border border-[#2A3A5C] text-sm font-bold text-[#F8FAFC]">Layers</button>
              <button type="button" onClick={handleIdentify} className="min-h-[44px] rounded-xl border border-[#2A3A5C] text-sm font-bold text-[#F8FAFC]">Identify</button>
              <button type="button" onClick={() => setTimeOpen(true)} className="min-h-[44px] rounded-xl border border-[#2A3A5C] text-sm font-bold text-[#F8FAFC]">Time travel</button>
              <button type="button" onClick={() => setSatelliteMapOpen((v) => !v)} className="min-h-[44px] rounded-xl border border-[#2A3A5C] text-sm font-bold text-[#F8FAFC]">Satellite map</button>
              <button type="button" onClick={() => setZoomLevel(4)} className="min-h-[44px] rounded-xl border border-[#2A3A5C] text-sm font-bold text-[#F8FAFC]">Recenter</button>
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm text-[#94A3B8]">
              <input type="checkbox" checked={reducedMotion} onChange={(e) => setReducedMotion(e.target.checked)} className="accent-[#06B6D4]" />
              Reduced motion
            </label>
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-3 pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto mx-auto max-w-xl rounded-3xl border border-[#1E293B] bg-[#0F172A]/95 p-4 shadow-2xl backdrop-blur-xl">
          <p className="font-display text-2xl font-bold leading-tight text-[#F8FAFC]">
            {formatSpaceCamScale(fusion.scaleMeters)}
          </p>
          <p className="mt-1 text-[13px] text-[#94A3B8]">
            Level {zoomLevel}: {fusion.levelLabel}
          </p>

          <input
            className="mt-3 h-1 w-full appearance-none rounded-full bg-[#1E293B] accent-[#06B6D4] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#06B6D4]"
            style={{ accentColor: "#06B6D4" }}
            type="range"
            min={0}
            max={10}
            step={1}
            value={zoomLevel}
            onChange={(e) => setZoomLevel(Number(e.target.value) as typeof zoomLevel)}
            aria-label="Infinite zoom level"
          />

          <div className="mt-4 flex gap-1 rounded-2xl bg-[#141C2F]/80 p-1">
            {MODE_TABS.map(({ mode: tabMode, label, icon: Icon }) => (
              <button
                key={tabMode}
                type="button"
                onClick={() => setMode(tabMode)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-colors",
                  mode === tabMode
                    ? "bg-[#06B6D4] text-[#020208]"
                    : "text-[#94A3B8] hover:text-[#F8FAFC]",
                )}
                aria-current={mode === tabMode ? "true" : undefined}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          <p className="mt-2 text-center text-[11px] text-[#475569]">
            catalog positions — not live views
          </p>
        </div>
      </div>

      <SearchPanel />
      <LayersMenu />
      <TimeTravelPanel />
      <ObjectInfoSheet />
    </main>
  );
}

function FloatingButton({
  icon: Icon,
  label,
  onClick,
  className,
}: {
  icon: typeof Plus;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "grid h-11 w-11 min-h-[44px] min-w-[44px] place-items-center border border-[#1E293B] bg-[#141C2F]/90 text-[#F8FAFC] shadow-lg backdrop-blur-md transition-colors hover:bg-[#1A253C]/90",
        className,
      )}
      aria-label={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
