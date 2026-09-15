"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { MapAttributionFooter } from "@/components/smart-map/map-attribution-footer";
import { useMapStore } from "@/stores/map-store";
import { usePublicSafetyEnabled } from "@/lib/features/use-feature-flag";
import { PlaceSheet } from "@/components/smart-map/place-sheet";

const SmartMapTopBar = dynamic(() => import("@/components/smart-map/smart-map-top-bar").then((m) => m.SmartMapTopBar), { ssr: false });
const SmartMapLocationSidebar = dynamic(() => import("@/components/smart-map/smart-map-location-sidebar").then((m) => m.SmartMapLocationSidebar), { ssr: false });
const TransportModeBar = dynamic(() => import("@/components/smart-map/transport-mode-bar").then((m) => m.TransportModeBar), { ssr: false });
const MapMinimapInset = dynamic(() => import("@/components/smart-map/map-minimap-inset").then((m) => m.MapMinimapInset), { ssr: false });

export function HomeOverlay() {
  const publicSafety = usePublicSafetyEnabled();
  const mapStyle = useMapStore((s) => s.mapStyle);
  const setMapStyle = useMapStore((s) => s.setMapStyle);
  const setSelectedPlaceId = useMapStore((s) => s.setSelectedPlaceId);
  const countryCode = useMapStore((s) => s.countryCode);

  useEffect(() => {
    if (mapStyle === "streets" && countryCode === "GH") setMapStyle("satellite");
    setSelectedPlaceId("gh-bedomase");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <SmartMapTopBar />
      <div className="pointer-events-none absolute z-20 hidden p-4 lg:flex" style={{ top: "calc(4.5rem + env(safe-area-inset-top))", left: 0 }}>
        <SmartMapLocationSidebar />
      </div>
      <div className="pointer-events-none absolute inset-x-3 z-20 lg:hidden" style={{ top: "calc(4.5rem + env(safe-area-inset-top))" }}>
        <SmartMapLocationSidebar className="max-h-[36vh]" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 z-20 flex justify-center px-3" style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
        <TransportModeBar />
      </div>
      <MapMinimapInset />
      <MapAttributionFooter />
      <PlaceSheet showVerification={publicSafety} />
    </>
  );
}
