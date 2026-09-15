"use client";

import dynamic from "next/dynamic";
import { HomeOverlay } from "@/components/smart-map/home-overlay";

const MapView = dynamic(() => import("@/components/smart-map/map-view").then((m) => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center bg-[#0A0E23] text-white">
      <p className="font-display text-xl font-bold">Opening Smart Map…</p>
    </div>
  ),
});
const MapFloatingControls = dynamic(() => import("@/components/smart-map/map-floating-controls").then((m) => m.MapFloatingControls), { ssr: false });

export default function HomePage() {
  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#0A0E23]">
      <MapView hideDefaultControls />
      <MapFloatingControls />
      <HomeOverlay />
    </div>
  );
}
