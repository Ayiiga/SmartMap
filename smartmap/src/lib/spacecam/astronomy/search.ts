import { ALL_CATALOG_OBJECTS, CONSTELLATIONS } from "./catalog";
import { enrichObjectWithPosition } from "./ephemeris";
import type { ObserverContext, SearchResult } from "./types";
import { horizontalFromRaDec } from "./coordinates";
import { isSunAboveHorizon } from "./coordinates";

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}

function scoreMatch(name: string, aliases: string[] | undefined, query: string): number {
  const n = name.toLowerCase();
  if (n === query) return 100;
  if (n.startsWith(query)) return 80;
  if (n.includes(query)) return 60;
  if (aliases?.some((a) => a.toLowerCase() === query)) return 90;
  if (aliases?.some((a) => a.toLowerCase().includes(query))) return 50;
  return 0;
}

export function searchAstronomicalObjects(
  query: string,
  observer: ObserverContext,
  options?: { includeOfflineOnly?: boolean },
): SearchResult[] {
  const q = normalizeQuery(query);
  if (!q) return [];

  const isDaylight = isSunAboveHorizon(observer);
  const results: SearchResult[] = [];

  for (const obj of ALL_CATALOG_OBJECTS) {
    if (options?.includeOfflineOnly && !obj.offlineAvailable) continue;

    let score = scoreMatch(obj.name, obj.aliases, q);
    if (obj.catalogIds) {
      for (const cid of obj.catalogIds) {
        score = Math.max(score, scoreMatch(cid, undefined, q));
      }
    }
    if (obj.id.toLowerCase().includes(q)) score = Math.max(score, 40);

    if (score <= 0) continue;

    const enriched = enrichObjectWithPosition(obj, observer);
    const visibility = enriched.horizontal
      ? {
          altitudeDeg: enriched.horizontal.altitudeDeg,
          azimuthDeg: enriched.horizontal.azimuthDeg,
          isAboveHorizon: enriched.horizontal.altitudeDeg > 0,
          isDaylight,
          label: enriched.horizontal.altitudeDeg > 0
            ? "Above horizon"
            : enriched.horizontal.altitudeDeg > -6
              ? "Near horizon"
              : "Below horizon",
        }
      : undefined;

    results.push({ ...enriched, matchScore: score, visibility });
  }

  return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 20);
}

export function getConstellationByName(name: string) {
  const q = normalizeQuery(name);
  return CONSTELLATIONS.find(
    (c) => c.name.toLowerCase() === q || c.abbreviation.toLowerCase() === q || c.id === q,
  );
}

export function getObjectsInConstellation(constellationName: string, observer: ObserverContext) {
  const q = constellationName.toLowerCase();
  return ALL_CATALOG_OBJECTS.filter(
    (o) => o.constellation?.toLowerCase() === q && o.raHours != null && o.decDeg != null,
  ).map((o) => enrichObjectWithPosition(o, observer));
}

export function getVisibilityLabel(observer: ObserverContext, raHours: number, decDeg: number): string {
  const hor = horizontalFromRaDec(raHours, decDeg, observer);
  if (hor.altitudeDeg > 30) return "Well placed for viewing";
  if (hor.altitudeDeg > 0) return "Above horizon";
  if (hor.altitudeDeg > -6) return "Near horizon — twilight";
  return "Below horizon";
}
