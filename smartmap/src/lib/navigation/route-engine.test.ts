import { describe, expect, it } from "vitest";
import {
  buildElevationProfile,
  buildPolyline,
  classifyDifficulty,
  estimateArrival,
  estimateFuelLiters,
  formatDuration,
  kmToMiles,
  pathDistanceKm,
  planAdvancedRoutes,
  recalculateRoute,
} from "@/lib/navigation/route-engine";
import { analyzeRouteSafety } from "@/lib/navigation/safety-analysis";
import { nearbyEmergencyServices, isOpenNow } from "@/lib/navigation/emergency";
import { buildTripSummary } from "@/lib/navigation/trip-summary";
import { buildVoiceScript, turnGuidanceLine } from "@/lib/navigation/voice";
import { basemapStyleForLayers, MAP_LAYERS } from "@/lib/navigation/layers";
import { DEFAULT_CENTER } from "@/lib/map/styles";

const from = {
  id: "a",
  label: "Origin",
  coordinates: DEFAULT_CENTER,
};

const to = {
  id: "b",
  label: "Korle Bu Teaching Hospital",
  coordinates: { lat: 5.537, lng: -0.226 },
};

describe("route engine", () => {
  it("computes accurate haversine-based distances and ETA", () => {
    const plans = planAdvancedRoutes({ from, to, mode: "driving" });
    expect(plans.length).toBe(5);
    const fastest = plans.find((p) => p.preference === "fastest");
    expect(fastest).toBeTruthy();
    expect(fastest!.distanceKm).toBeGreaterThan(1);
    expect(fastest!.distanceMiles).toBeCloseTo(kmToMiles(fastest!.distanceKm), 2);
    expect(fastest!.durationMin).toBeGreaterThan(2);
    expect(new Date(fastest!.etaIso).getTime()).toBeGreaterThan(Date.now() - 1000);
    expect(formatDuration(90)).toBe("1 h 30 min");
  });

  it("supports avoid options and alternative preferences", () => {
    const plans = planAdvancedRoutes({
      from,
      to,
      mode: "motorcycle",
      avoid: { tolls: true, traffic: true, ferries: true, unpaved: true },
      preferences: ["fastest", "safest", "shortest"],
    });
    expect(plans).toHaveLength(3);
    expect(plans.every((p) => p.avoided.includes("tolls"))).toBe(true);
    const shortest = plans.find((p) => p.preference === "shortest")!;
    const safest = plans.find((p) => p.preference === "safest")!;
    expect(shortest.distanceKm).toBeLessThanOrEqual(safest.distanceKm + 0.01);
    expect(safest.safetyScore).toBeGreaterThanOrEqual(shortest.safetyScore - 5);
  });

  it("estimates fuel for car/motorcycle and elevation difficulty", () => {
    expect(estimateFuelLiters(10, "driving")).toBeCloseTo(0.85, 2);
    expect(estimateFuelLiters(10, "motorcycle")).toBeCloseTo(0.32, 2);
    expect(estimateFuelLiters(10, "walking")).toBeUndefined();
    const profile = buildElevationProfile(12, 2);
    expect(profile.length).toBeGreaterThan(5);
    expect(classifyDifficulty(50, profile, "driving")).toMatch(/challenging|difficult|moderate|easy/);
  });

  it("recalculates from a new position", () => {
    const [plan] = planAdvancedRoutes({ from, to, mode: "driving", preferences: ["fastest"] });
    const next = recalculateRoute(plan, { lat: 5.59, lng: -0.2 });
    expect(next.distanceKm).toBeGreaterThan(0);
    expect(next.to.id).toBe(plan.to.id);
  });

  it("builds polyline path distance", () => {
    const line = buildPolyline(from.coordinates, to.coordinates, [], "shortest");
    expect(line.length).toBeGreaterThanOrEqual(3);
    expect(pathDistanceKm(line)).toBeGreaterThan(0);
  });

  it("estimates arrival correctly", () => {
    const now = new Date("2026-07-27T12:00:00.000Z");
    expect(estimateArrival(now, 30).toISOString()).toBe("2026-07-27T12:30:00.000Z");
  });
});

describe("AI route safety", () => {
  it("returns labeled warnings for a route", () => {
    const warnings = analyzeRouteSafety({
      distanceKm: 12,
      polyline: [from.coordinates, to.coordinates],
      preference: "fastest",
      mode: "driving",
      seed: 3,
    });
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0].label).toMatch(/⚠️/);
  });
});

describe("emergency navigation", () => {
  it("lists nearby emergency services with distance and ETA", () => {
    const items = nearbyEmergencyServices(DEFAULT_CENTER, "driving", 8);
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].distanceKm).toBeLessThanOrEqual(items[items.length - 1].distanceKm);
    expect(items[0].durationMin).toBeGreaterThan(0);
    expect(["open", "closed", "unknown"]).toContain(items[0].openStatus);
  });

  it("parses open hours", () => {
    expect(isOpenNow("24 hours")).toBe("open");
    expect(isOpenNow(undefined)).toBe("unknown");
  });
});

describe("voice + trip summary + layers", () => {
  it("builds voice guidance lines", () => {
    expect(turnGuidanceLine(200, "left")).toBe("Turn left in 200 meters.");
    const [plan] = planAdvancedRoutes({ from, to, mode: "driving", preferences: ["fastest"] });
    const script = buildVoiceScript(plan);
    expect(script.some((l) => /Hospital|Police|Turn|Traffic|route/i.test(l))).toBe(true);
  });

  it("builds trip summary metrics", () => {
    const [plan] = planAdvancedRoutes({ from, to, mode: "driving", preferences: ["eco"] });
    const summary = buildTripSummary(plan);
    expect(summary.totalDistanceKm).toBe(plan.distanceKm);
    expect(summary.averageSpeedKmh).toBeGreaterThan(0);
    expect(summary.warnings).toEqual(plan.warnings);
  });

  it("maps basemap layers to styles", () => {
    expect(MAP_LAYERS.length).toBeGreaterThanOrEqual(12);
    expect(basemapStyleForLayers(["night", "traffic"])).toBe("dark");
    expect(basemapStyleForLayers(["satellite"])).toBe("satellite");
    expect(basemapStyleForLayers(["standard"])).toBe("streets");
  });
});
