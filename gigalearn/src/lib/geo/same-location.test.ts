import { describe, expect, it } from "vitest";
import { isSameLocation } from "./same-location";
import type { NavEndpoint } from "@/lib/geo/types";

const bedomase: NavEndpoint = {
  id: "gh-bedomase",
  label: "Bedomase",
  coordinates: { lat: 6.1234, lng: -1.5678 },
  source: "search",
  placeId: "gh-bedomase",
};

const currentAtBedomase: NavEndpoint = {
  id: "gps-current",
  label: "Current Location · Bedomase",
  coordinates: { lat: 6.1235, lng: -1.5679 },
  source: "gps",
};

const accra: NavEndpoint = {
  id: "gh-accra",
  label: "Accra",
  coordinates: { lat: 5.6037, lng: -0.187 },
  source: "search",
};

describe("isSameLocation", () => {
  it("returns true for matching place ids", () => {
    expect(isSameLocation(bedomase, { ...bedomase, label: "Bedomase Market" })).toBe(true);
  });

  it("returns true when coordinates are within 150m", () => {
    expect(isSameLocation(currentAtBedomase, bedomase)).toBe(true);
  });

  it("returns false for distant endpoints", () => {
    expect(isSameLocation(bedomase, accra)).toBe(false);
  });

  it("returns false when either endpoint is null", () => {
    expect(isSameLocation(null, bedomase)).toBe(false);
    expect(isSameLocation(bedomase, null)).toBe(false);
  });
});
