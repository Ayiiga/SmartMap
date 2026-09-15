import { describe, expect, it } from "vitest";
import { formatSpaceCamScale, getZoomFusionState, getZoomFusionStateFromLevel, getZoomLevelFromSlider, requiresMapView } from "./zoom-fusion";

describe("Zoom Fusion Engine", () => {
  it("uses device capture at the closest scale", () => {
    expect(getZoomFusionState(0)).toMatchObject({ source: "real-capture", scaleMeters: 2.4, level: 0 });
  });

  it("moves outward through geospatial and conceptual sources", () => {
    expect(getZoomFusionState(45).source).toBe("map");
    expect(getZoomFusionState(70).source).toBe("earth");
    expect(getZoomFusionState(85).source).toBe("simulation");
    expect(getZoomFusionState(100).source).toBe("astronomical");
  });

  it("maps slider to 11 zoom levels", () => {
    expect(getZoomLevelFromSlider(0)).toBe(0);
    expect(getZoomLevelFromSlider(50)).toBe(5);
    expect(getZoomLevelFromSlider(100)).toBe(10);
  });

  it("provides level-based fusion state", () => {
    const state = getZoomFusionStateFromLevel(4);
    expect(state.level).toBe(4);
    expect(state.levelLabel).toBe("Solar System");
    expect(state.viewType).toBe("3d-visualization");
  });

  it("formats scales without presenting them as camera resolution", () => {
    expect(formatSpaceCamScale(2.4)).toBe("2.4 m");
    expect(formatSpaceCamScale(12_600)).toBe("12.6 km");
    expect(formatSpaceCamScale(384_400_000)).toBe("384,400 km");
  });

  it("only requests the existing map at the map-data stage", () => {
    expect(requiresMapView("map")).toBe(true);
    expect(requiresMapView("earth")).toBe(false);
  });
});
