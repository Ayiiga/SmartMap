import { describe, expect, it } from "vitest";
import { modeEtaMinutes } from "./mode-eta";
import type { AdvancedRoutePlan } from "./types";

const activeRoute: AdvancedRoutePlan = {
  id: "r1",
  label: "Fastest",
  preference: "fastest",
  distanceKm: 5,
  durationMin: 11,
  polyline: [],
  steps: [],
  warnings: [],
  avoided: [],
  safetyScore: 80,
  etaIso: new Date().toISOString(),
};

const multiModeEta = {
  driving: { ...activeRoute, durationMin: 5 },
  walking: { ...activeRoute, durationMin: 30 },
  cycling: { ...activeRoute, durationMin: 15 },
  transit: { ...activeRoute, durationMin: 8 },
  motorcycle: { ...activeRoute, durationMin: 5 },
} as Record<string, AdvancedRoutePlan>;

describe("modeEtaMinutes", () => {
  it("uses active route duration for the selected travel mode", () => {
    expect(modeEtaMinutes("driving", "driving", activeRoute, multiModeEta)).toBe(11);
  });

  it("uses multiModeEta for non-selected modes", () => {
    expect(modeEtaMinutes("walking", "driving", activeRoute, multiModeEta)).toBe(30);
  });
});
