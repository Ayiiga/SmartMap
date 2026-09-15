import { describe, expect, it } from "vitest";
import { haversineKm, nearbyPlaces, searchPlaces } from "./places";

describe("smart map places", () => {
  it("finds hospitals by search", () => {
    const results = searchPlaces("korle", "hospital");
    expect(results.some((p) => p.id === "gh-hospital-korle-bu")).toBe(true);
  });

  it("returns nearby places sorted by distance", () => {
    const origin = { lat: 5.6037, lng: -0.187 };
    const nearby = nearbyPlaces(origin, "all", 5);
    expect(nearby).toHaveLength(5);
    for (let i = 1; i < nearby.length; i += 1) {
      expect(nearby[i].distanceKm).toBeGreaterThanOrEqual(nearby[i - 1].distanceKm);
    }
  });

  it("computes haversine distance for Accra points", () => {
    const km = haversineKm({ lat: 5.6037, lng: -0.187 }, { lat: 5.6052, lng: -0.1668 });
    expect(km).toBeGreaterThan(1);
    expect(km).toBeLessThan(5);
  });
});
