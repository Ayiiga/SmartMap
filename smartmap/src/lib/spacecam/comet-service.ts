import type { AstronomicalObject } from "./astronomy/types";

export interface CometRecord {
  id: string;
  name: string;
  designation: string;
  constellation?: string;
  magnitude?: number;
  raHours?: number;
  decDeg?: number;
  perihelionDate?: string;
  fetchedAt: number;
  isStale: boolean;
}

export interface CometFetchResult {
  comets: CometRecord[];
  source: "live" | "cache" | "unavailable";
  message: string;
}

const CACHE_KEY = "spacecam-comet-cache";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Baseline comets available offline — positions are illustrative, not live. */
const OFFLINE_COMETS: CometRecord[] = [
  {
    id: "c-2023-a3",
    name: "Comet Tsuchinshan-ATLAS",
    designation: "C/2023 A3",
    constellation: "Virgo",
    magnitude: 5.0,
    raHours: 13.5,
    decDeg: -5.0,
    fetchedAt: 0,
    isStale: true,
  },
];

function readCache(): CometRecord[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { fetchedAt: number; comets: CometRecord[] };
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS * 7) return null;
    return parsed.comets.map((c) => ({ ...c, isStale: Date.now() - parsed.fetchedAt > CACHE_TTL_MS }));
  } catch {
    return null;
  }
}

export async function fetchCometData(isOnline: boolean): Promise<CometFetchResult> {
  if (!isOnline) {
    return {
      comets: OFFLINE_COMETS,
      source: "cache",
      message: "Offline — comet positions are approximate catalog references only.",
    };
  }

  const cached = readCache();
  if (cached?.length && !cached[0].isStale) {
    return {
      comets: cached,
      source: "live",
      message: "Comet positions from cached astronomical data.",
    };
  }

  return {
    comets: OFFLINE_COMETS.map((c) => ({ ...c, isStale: true })),
    source: "unavailable",
    message: "Live comet ephemeris unavailable — showing known comet catalog entries with approximate positions.",
  };
}

export function cometsToAstronomicalObjects(comets: CometRecord[]): AstronomicalObject[] {
  return comets.map((c) => ({
    id: c.id,
    name: c.name,
    type: "comet" as const,
    aliases: [c.designation],
    constellation: c.constellation,
    raHours: c.raHours,
    decDeg: c.decDeg,
    magnitude: c.magnitude,
    description: c.isStale
      ? "Approximate comet position — live ephemeris not available."
      : "Comet position from astronomical catalog.",
    offlineAvailable: false,
    requiresLiveData: true,
  }));
}
