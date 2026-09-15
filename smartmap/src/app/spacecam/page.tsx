import type { Metadata } from "next";
import { SpaceCamExplorer } from "@/components/smart-map/spacecam-explorer";

export const metadata: Metadata = {
  title: "SpaceCam",
  description: "Premium interactive 3D astronomy explorer — camera overlay, sky map, and deep space visualization.",
};

export default function SpaceCamPage() {
  return <SpaceCamExplorer />;
}
