import { ALL_CATALOG_OBJECTS } from "./catalog";
import { angularSeparationDeg } from "./coordinates";
import { enrichObjectWithPosition } from "./ephemeris";
import type { HorizontalCoords, IdentifyCandidate, ObserverContext } from "./types";

const IDENTIFY_THRESHOLD_DEG = 8;
const HIGH_CONFIDENCE_DEG = 3;
const MEDIUM_CONFIDENCE_DEG = 6;

export function identifyObjectsNearDirection(
  pointingDirection: HorizontalCoords,
  observer: ObserverContext,
  options?: { maxResults?: number; sensorAccuracy?: "high" | "medium" | "low" },
): IdentifyCandidate[] {
  const maxResults = options?.maxResults ?? 5;
  const candidates: IdentifyCandidate[] = [];

  for (const obj of ALL_CATALOG_OBJECTS) {
    if (obj.type === "constellation" || obj.id === "earth") continue;

    const enriched = enrichObjectWithPosition(obj, observer);
    if (!enriched.horizontal) continue;

    const separation = angularSeparationDeg(pointingDirection, enriched.horizontal);
    if (separation > IDENTIFY_THRESHOLD_DEG) continue;

    let confidence: IdentifyCandidate["confidence"] = "low";
    if (separation <= HIGH_CONFIDENCE_DEG && options?.sensorAccuracy !== "low") confidence = "high";
    else if (separation <= MEDIUM_CONFIDENCE_DEG) confidence = "medium";

    candidates.push({
      object: enriched,
      horizontal: enriched.horizontal,
      angularSeparationDeg: separation,
      confidence,
    });
  }

  return candidates
    .sort((a, b) => a.angularSeparationDeg - b.angularSeparationDeg)
    .slice(0, maxResults);
}

/** Convert device orientation (alpha/beta/gamma) to approximate sky direction. */
export function orientationToHorizontal(
  alpha: number,
  beta: number,
  gamma: number,
  screenOrientationDeg = 0,
): HorizontalCoords {
  const alphaRad = ((alpha + screenOrientationDeg) * Math.PI) / 180;

  const azimuthDeg = ((alphaRad * 180) / Math.PI + 360) % 360;
  const altitudeDeg = Math.max(-90, Math.min(90, 90 - beta));

  return { azimuthDeg, altitudeDeg };
}

export function getIdentifyDisclaimer(sensorAccuracy: "high" | "medium" | "low" | "unavailable"): string {
  switch (sensorAccuracy) {
    case "high":
      return "Possible object — orientation sensors appear well calibrated.";
    case "medium":
      return "Possible object — sensor accuracy is moderate. Move phone in a slow figure-eight to improve compass calibration.";
    case "low":
      return "Possible object — low sensor accuracy. Results are approximate.";
    default:
      return "Possible object — orientation unavailable. Using manual calibration mode.";
  }
}
