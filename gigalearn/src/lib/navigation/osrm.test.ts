import { describe, expect, it } from "vitest";
import {
  coordsToOsrmParam,
  osrmRoutesToPlans,
  osrmStepsToInstructions,
  parseOsrmPolyline,
} from "@/lib/navigation/osrm";

describe("osrm", () => {
  it("formats coordinates for OSRM", () => {
    expect(
      coordsToOsrmParam([
        { lat: 5.6, lng: -0.18 },
        { lat: 5.7, lng: -0.2 },
      ]),
    ).toBe("-0.18,5.6;-0.2,5.7");
  });

  it("parses GeoJSON polyline", () => {
    const route = {
      geometry: {
        coordinates: [[-0.18, 5.6], [-0.2, 5.7]] as [number, number][],
      },
    };
    expect(parseOsrmPolyline(route)).toEqual([
      { lat: 5.6, lng: -0.18 },
      { lat: 5.7, lng: -0.2 },
    ]);
  });

  it("converts OSRM response to route plans", () => {
    const plans = osrmRoutesToPlans(
      {
        code: "Ok",
        routes: [
          {
            distance: 12000,
            duration: 900,
            geometry: {
              coordinates: [[-0.18, 5.6], [-0.19, 5.65], [-0.2, 5.7]],
            },
            legs: [
              {
                steps: [
                  {
                    maneuver: { instruction: "Head north on Main St" },
                    name: "Main St",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        from: { id: "a", label: "Agona", coordinates: { lat: 5.6, lng: -0.18 } },
        to: { id: "b", label: "Accra", coordinates: { lat: 5.7, lng: -0.2 } },
        mode: "driving",
      },
    );
    expect(plans).toHaveLength(1);
    expect(plans[0].distanceKm).toBe(12);
    expect(plans[0].durationMin).toBe(15);
    expect(plans[0].steps[0]).toContain("Agona");
  });

  it("extracts turn-by-turn instructions", () => {
    const steps = osrmStepsToInstructions(
      {
        legs: [
          {
            steps: [{ maneuver: { instruction: "Turn left onto Ring Rd" } }],
          },
        ],
      },
      "Start",
      "End",
    );
    expect(steps).toContain("Turn left onto Ring Rd");
    expect(steps[steps.length - 1]).toContain("End");
  });
});
