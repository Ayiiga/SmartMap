import type { Metadata } from "next";
import GigaOrbitGame from "@/components/gigaorbit/game";

export const metadata: Metadata = {
  title: "Play GigaOrbit: Beyond Earth | Giga3 AI",
  description: "Play GigaOrbit in your browser. Pilot a real-time 3D rocket from Earth to the Moon, land safely, explore as an astronaut, collect samples and unlock Mars. Created by Giga3 AI.",
  openGraph: {
    title: "Play GigaOrbit: Beyond Earth",
    description: "Launch. Explore. Discover. A playable space adventure by Giga3 AI.",
    images: [{ url: "/gigaorbit/gigaorbit-icon.webp", width: 1200, height: 1200, alt: "GigaOrbit orbital G logo" }],
  },
};

export default function GigaOrbitPage() {
  return <GigaOrbitGame />;
}
