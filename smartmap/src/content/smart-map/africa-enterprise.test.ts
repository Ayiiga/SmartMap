import { describe, expect, it } from "vitest";
import {
  buildAfricaExpansionCatalog,
  computeSafetyScore,
  SAMPLE_INCIDENTS,
} from "@/content/smart-map/africa-enterprise";
import { canAccess } from "@/lib/security/rbac";

describe("phase 6 africa enterprise", () => {
  it("builds a 54-country catalog", () => {
    const catalog = buildAfricaExpansionCatalog();
    expect(catalog.length).toBeGreaterThanOrEqual(54);
    expect(catalog.some((c) => c.code === "GH" && c.status === "live")).toBe(true);
  });

  it("computes safety scores from incidents", () => {
    const score = computeSafetyScore(SAMPLE_INCIDENTS);
    expect(score).toBeGreaterThanOrEqual(40);
    expect(score).toBeLessThanOrEqual(98);
  });

  it("enforces RBAC ordering", () => {
    expect(canAccess("admin", "agency")).toBe(true);
    expect(canAccess("user", "agency")).toBe(false);
  });
});
