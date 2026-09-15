import { describe, expect, it } from "vitest";
import { getAccuracyInfo, getAccuracyTier, formatRelativeTime } from "@/lib/geo/accuracy";
import { classifyFetchError, classifyGeolocationError } from "@/lib/errors/smart-map-errors";
import { formatDistance } from "@/lib/emergency/emergency-places-service";
import { coordinateLabel } from "@/lib/geo/reverse-geocode-service";

describe("accuracy helpers", () => {
  it("classifies accuracy tiers", () => {
    expect(getAccuracyTier(10)).toBe("excellent");
    expect(getAccuracyTier(30)).toBe("good");
    expect(getAccuracyTier(100)).toBe("fair");
    expect(getAccuracyTier(300)).toBe("low");
    expect(getAccuracyTier(600)).toBe("very_low");
  });

  it("provides guidance for low accuracy", () => {
    const info = getAccuracyInfo(600);
    expect(info.isLow).toBe(true);
    expect(info.guidance).toContain("low");
  });

  it("formats relative time", () => {
    expect(formatRelativeTime(Date.now() - 5000)).toBe("Just now");
  });
});

describe("smart map errors", () => {
  it("classifies fetch errors", () => {
    const err = classifyFetchError(new Error("Failed to fetch"));
    expect(err.code).toBe("NETWORK_OFFLINE");
  });

  it("classifies geolocation permission denied", () => {
    const err = classifyGeolocationError({ code: 1, message: "denied", PERMISSION_DENIED: 1 } as GeolocationPositionError);
    expect(err.code).toBe("LOCATION_PERMISSION_DENIED");
  });
});

describe("emergency service helpers", () => {
  it("formats distance in meters and km", () => {
    expect(formatDistance(0.65)).toBe("650 m");
    expect(formatDistance(1.2)).toBe("1.2 km");
  });
});

describe("reverse geocode helpers", () => {
  it("formats coordinate labels", () => {
    expect(coordinateLabel({ lat: 6.954598, lng: -1.507399 })).toBe("6.954598, -1.507399");
  });
});
