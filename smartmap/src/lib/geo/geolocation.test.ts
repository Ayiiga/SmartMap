import { describe, expect, it } from "vitest";
import { formatAccuracy, fixFromPosition, isValidCoordinates } from "@/lib/geo/geolocation";
import { parseResolvedAddress, toGeoResult } from "@/lib/geo/nominatim";
import { haversineKm } from "@/content/smart-map/places";
import { planAdvancedRoutes } from "@/lib/navigation/route-engine";

describe("geolocation helpers", () => {
  it("validates coordinates", () => {
    expect(isValidCoordinates({ lat: 5.6, lng: -0.2 })).toBe(true);
    expect(isValidCoordinates({ lat: 95, lng: 0 })).toBe(false);
    expect(isValidCoordinates(null)).toBe(false);
  });

  it("formats accuracy", () => {
    expect(formatAccuracy(12.4)).toBe("±12 m");
    expect(formatAccuracy(2500)).toBe("±2.5 km");
    expect(formatAccuracy(null)).toBe("Unknown");
  });

  it("builds a fix from a GeolocationPosition-like object", () => {
    const fix = fixFromPosition({
      coords: {
        latitude: 51.5074,
        longitude: -0.1278,
        accuracy: 8,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: 1.5,
        toJSON() {
          return this;
        },
      },
      timestamp: 1,
      toJSON() {
        return this;
      },
    } as GeolocationPosition);
    expect(fix.coordinates.lat).toBeCloseTo(51.5074, 3);
    expect(fix.accuracyM).toBe(8);
  });
});

describe("nominatim parsers", () => {
  it("parses address components", () => {
    const address = parseResolvedAddress({
      place_id: 1,
      lat: "5.6",
      lon: "-0.2",
      display_name: "Independence Ave, Accra, Ghana",
      address: {
        road: "Independence Avenue",
        city: "Accra",
        state: "Greater Accra",
        country: "Ghana",
        country_code: "gh",
        suburb: "Ridge",
      },
    });
    expect(address.city).toBe("Accra");
    expect(address.region).toBe("Greater Accra");
    expect(address.countryCode).toBe("GH");
    expect(address.label).toContain("Accra");
  });

  it("maps search results including airports", () => {
    const result = toGeoResult({
      place_id: 2,
      lat: "40.64",
      lon: "-73.78",
      display_name: "John F. Kennedy International Airport, New York, USA",
      name: "JFK",
      class: "aeroway",
      type: "aerodrome",
      address: { country: "United States", country_code: "us", city: "New York" },
    });
    expect(result.category).toBe("airport");
    expect(result.coordinates.lat).toBeCloseTo(40.64, 2);
  });
});

describe("live-relative routing", () => {
  it("computes distance/ETA from arbitrary worldwide coordinates", () => {
    const london = { lat: 51.5074, lng: -0.1278 };
    const paris = { lat: 48.8566, lng: 2.3522 };
    const km = haversineKm(london, paris);
    expect(km).toBeGreaterThan(300);
    expect(km).toBeLessThan(400);

    const [plan] = planAdvancedRoutes({
      from: { id: "a", label: "London", coordinates: london },
      to: { id: "b", label: "Paris", coordinates: paris },
      mode: "driving",
      preferences: ["fastest"],
    });
    expect(plan.distanceKm).toBeGreaterThan(300);
    expect(plan.durationMin).toBeGreaterThan(60);
    expect(plan.etaIso).toBeTruthy();
  });
});
