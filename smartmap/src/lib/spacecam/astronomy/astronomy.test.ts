import { describe, expect, it } from "vitest";
import { getCatalogObjectById, BRIGHT_STARS } from "./catalog";
import { searchAstronomicalObjects } from "./search";
import { identifyObjectsNearDirection } from "./identify";
import { getPlanetPosition } from "./ephemeris";
import type { ObserverContext } from "./types";

const OBSERVER: ObserverContext = {
  latitude: 40.7128,
  longitude: -74.006,
  date: new Date("2025-06-15T22:00:00Z"),
};

describe("astronomy catalog", () => {
  it("finds HIP catalog objects", () => {
    const obj = getCatalogObjectById("HIP 16228");
    expect(obj?.name).toBe("HIP 16228");
    expect(obj?.constellation).toBe("Taurus");
  });

  it("includes major bright stars offline", () => {
    expect(BRIGHT_STARS.find((s) => s.name === "Sirius")?.offlineAvailable).toBe(true);
    expect(BRIGHT_STARS.find((s) => s.name === "Aldebaran")?.offlineAvailable).toBe(true);
  });
});

describe("astronomy search", () => {
  it("finds planets by name", () => {
    const results = searchAstronomicalObjects("Jupiter", OBSERVER);
    expect(results[0]?.name).toBe("Jupiter");
  });

  it("finds constellations", () => {
    const results = searchAstronomicalObjects("Orion", OBSERVER);
    expect(results.some((r) => r.name === "Orion")).toBe(true);
  });

  it("finds catalog identifiers", () => {
    const results = searchAstronomicalObjects("HIP 16228", OBSERVER);
    expect(results[0]?.name).toBe("HIP 16228");
  });
});

describe("astronomy identify", () => {
  it("returns candidates near pointing direction", () => {
    const candidates = identifyObjectsNearDirection(
      { azimuthDeg: 180, altitudeDeg: 45 },
      OBSERVER,
    );
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates[0].confidence).toBeDefined();
  });
});

describe("astronomy ephemeris", () => {
  it("calculates planet positions", () => {
    const jupiter = getPlanetPosition("jupiter", OBSERVER.date);
    expect(jupiter).not.toBeNull();
    expect(jupiter!.raHours).toBeGreaterThan(0);
    expect(jupiter!.decDeg).toBeDefined();
  });
});
