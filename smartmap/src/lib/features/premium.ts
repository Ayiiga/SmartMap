/**
 * Phase 3 premium subscription support (disabled until aiExpansionPhase3).
 * Local entitlement state only — no secrets; billing providers plug in later.
 */

export type PremiumPlan = "free" | "plus" | "pro" | "business";

export interface PremiumEntitlement {
  plan: PremiumPlan;
  renewsAt?: string;
  features: {
    offlineMaps: boolean;
    voiceNavigation: boolean;
    adFree: boolean;
    analytics: boolean;
  };
}

export const FREE_ENTITLEMENT: PremiumEntitlement = {
  plan: "free",
  features: {
    offlineMaps: false,
    voiceNavigation: false,
    adFree: false,
    analytics: false,
  },
};

export function entitlementForPlan(plan: PremiumPlan): PremiumEntitlement {
  if (plan === "free") return FREE_ENTITLEMENT;
  return {
    plan,
    features: {
      offlineMaps: true,
      voiceNavigation: true,
      adFree: plan !== "plus",
      analytics: plan === "pro" || plan === "business",
    },
  };
}
