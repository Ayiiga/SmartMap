import { describe, it, expect } from "vitest";
import { analyzePredictiveSafety, computeSafetyScore, actionLabel } from "@/lib/ai40/predictive-safety";
import { planAi40Routes } from "@/lib/ai40/route-options";
import { verifyCommunityReport } from "@/lib/ai40/report-verification";
import { buildSafetyDashboard } from "@/lib/ai40/safety-dashboard";
import { hasConsent, grantConsent, DEFAULT_CONSENTS } from "@/lib/ai40/privacy";

const FROM = { lat: 5.6037, lng: -0.187 };
const TO = { lat: 5.65, lng: -0.15 };

describe("predictive safety", () => {
  it("generates risks from weather data", () => {
    const risks = analyzePredictiveSafety({
      from: FROM,
      to: TO,
      weather: {
        tempC: 28,
        condition: "Rain",
        humidity: 90,
        windKph: 45,
        uvIndex: 3,
        aqi: 40,
        rainChance: 75,
        floodRisk: "moderate",
        heatAlert: false,
      },
    });
    expect(risks.length).toBeGreaterThan(0);
    expect(risks[0].confidencePercent).toBeGreaterThan(0);
    expect(risks[0].minutesToImpact).toBeLessThanOrEqual(30);
  });

  it("computes safety score from risks", () => {
    const score = computeSafetyScore([]);
    expect(score).toBeGreaterThanOrEqual(90);
  });

  it("labels recommended actions", () => {
    expect(actionLabel("reroute")).toBe("Consider alternate route");
  });
});

describe("AI 4.0 route options", () => {
  it("plans multiple route preferences", () => {
    const routes = planAi40Routes({
      from: FROM,
      to: TO,
      fromLabel: "Accra",
      toLabel: "Airport",
      preferences: ["fastest", "safest", "night_safe"],
    });
    expect(routes).toHaveLength(3);
    expect(routes[0].scores.safety).toBeGreaterThan(0);
    expect(routes[0].scores.traffic).toBeGreaterThan(0);
    expect(routes[0].polyline.length).toBeGreaterThan(1);
  });
});

describe("report verification", () => {
  it("verifies credible accident reports", () => {
    const result = verifyCommunityReport({
      type: "accident",
      title: "Vehicle collision on highway",
      description: "Two vehicles crashed near the junction. Ambulance on scene.",
      hasMedia: true,
    });
    expect(result.verified).toBe(true);
    expect(result.confidence).toBeGreaterThan(60);
  });

  it("flags spam reports", () => {
    const result = verifyCommunityReport({
      type: "crime",
      title: "Free money click here",
      description: "Buy now crypto",
    });
    expect(result.verified).toBe(false);
    expect(result.flags).toContain("spam_pattern");
  });
});

describe("safety dashboard", () => {
  it("builds dashboard snapshot", () => {
    const dashboard = buildSafetyDashboard({ from: FROM, to: TO });
    expect(dashboard.safetyScore).toBeGreaterThan(0);
    expect(dashboard.aiSummary).toBeTruthy();
    expect(dashboard.updatedAt).toBeTruthy();
  });
});

describe("privacy consents", () => {
  it("tracks consent grants", () => {
    expect(hasConsent(DEFAULT_CONSENTS, "location")).toBe(false);
    const updated = grantConsent(DEFAULT_CONSENTS, "location");
    expect(hasConsent(updated, "location")).toBe(true);
  });
});
