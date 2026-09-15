"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { MapAttributionFooter } from "@/components/smart-map/map-attribution-footer";
import { useMapStore } from "@/stores/map-store";
import { usePublicSafetyEnabled } from "@/lib/features/use-feature-flag";
import { PlaceSheet } from "@/components/smart-map/place-sheet";
import { HomeWeatherWidget } from "@/components/smart-map/home-weather-widget";

const SmartMapTopBar = dynamic(
  () => import("@/components/smart-map/smart-map-top-bar").then((m) => m.SmartMapTopBar),
  { ssr: false },
);

export function HomeOverlay() {
  const publicSafety = usePublicSafetyEnabled();
  const mapStyle = useMapStore((s) => s.mapStyle);
  const setMapStyle = useMapStore((s) => s.setMapStyle);
  const countryCode = useMapStore((s) => s.countryCode);

  useEffect(() => {
    if (mapStyle === "streets" && countryCode === "GH") setMapStyle("satellite");
  }, [countryCode, mapStyle, setMapStyle]);

  return (
    <>
      <SmartMapTopBar variant="minimal" />
      <HomeWeatherWidget />
      <MapAttributionFooter />
      <PlaceSheet showVerification={publicSafety} />
    </>
  );
}
