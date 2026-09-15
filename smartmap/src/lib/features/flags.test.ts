import { describe, expect, it } from "vitest";
import {
  FEATURE_FLAGS,
  isFeatureEnabled,
  isPhase2Route,
  isPhase3Route,
  isPhase4Route,
  isPhase5Route,
  isPhase6Route,
  isPhase7Route,
  PHASE1_NEARBY_CATEGORIES,
} from "./flags";

describe("feature flags", () => {
  it("keeps Phase 1 on and Phases 2–7 off by default", () => {
    expect(FEATURE_FLAGS.phase1Foundation).toBe(true);
    expect(FEATURE_FLAGS.publicSafetyPhase2).toBe(false);
    expect(FEATURE_FLAGS.aiExpansionPhase3).toBe(false);
    expect(FEATURE_FLAGS.smartServicesPhase4).toBe(false);
    expect(FEATURE_FLAGS.businessCommunityPhase5).toBe(false);
    expect(FEATURE_FLAGS.africaExpansionPhase6).toBe(false);
    expect(FEATURE_FLAGS.advancedNavigationPhase7).toBe(false);
    expect(isFeatureEnabled("advancedNavigationPhase7")).toBe(false);
  });

  it("classifies phase routes correctly", () => {
    expect(isPhase2Route("/safety")).toBe(true);
    expect(isPhase3Route("/ai-assistant")).toBe(true);
    expect(isPhase4Route("/services")).toBe(true);
    expect(isPhase4Route("/transport")).toBe(true);
    expect(isPhase4Route("/trips")).toBe(true);
    expect(isPhase5Route("/portal")).toBe(true);
    expect(isPhase5Route("/groups")).toBe(true);
    expect(isPhase5Route("/reviews")).toBe(true);
    expect(isPhase6Route("/enterprise")).toBe(true);
    expect(isPhase6Route("/countries")).toBe(true);
    expect(isPhase6Route("/command-center")).toBe(true);
    expect(isPhase7Route("/advanced-navigation")).toBe(true);
    expect(isPhase7Route("/trip-summary")).toBe(true);
    expect(isPhase7Route("/navigate")).toBe(false);
    expect(isPhase4Route("/search")).toBe(false);
  });

  it("defines Phase 1 nearby essentials", () => {
    expect(PHASE1_NEARBY_CATEGORIES).toContain("police");
    expect(PHASE1_NEARBY_CATEGORIES).toContain("hospital");
    expect(PHASE1_NEARBY_CATEGORIES).toContain("hostel");
  });
});
