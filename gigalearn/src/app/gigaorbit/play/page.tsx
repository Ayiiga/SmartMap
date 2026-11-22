import type { Metadata } from "next";
import GigaOrbitGame from "@/components/gigaorbit/game";

export const metadata: Metadata = {
  title: "Play GigaOrbit · Rocket Missions, Coins & Awards | Giga3 AI",
  description: "Start playing GigaOrbit. Pilot to the Moon, unlock Mars, earn virtual coin rewards, buy fuel and repair your ship.",
};
export default function PlayGigaOrbitPage() {
  return <GigaOrbitGame />;
}
