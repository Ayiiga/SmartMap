"use client";

import { FEATURE_FLAGS, type FeatureFlagKey, isFeatureEnabled } from "@/lib/features/flags";

export function useFeatureFlag(flag: FeatureFlagKey): boolean {
  return isFeatureEnabled(flag);
}

export function usePublicSafetyEnabled(): boolean {
  return FEATURE_FLAGS.publicSafetyPhase2;
}

export function useAiExpansionEnabled(): boolean {
  return FEATURE_FLAGS.aiExpansionPhase3;
}

export function useSmartServicesEnabled(): boolean {
  return FEATURE_FLAGS.smartServicesPhase4;
}

export function useBusinessCommunityEnabled(): boolean {
  return FEATURE_FLAGS.businessCommunityPhase5;
}

export function useAfricaExpansionEnabled(): boolean {
  return FEATURE_FLAGS.africaExpansionPhase6;
}

export function useAdvancedNavigationEnabled(): boolean {
  return FEATURE_FLAGS.advancedNavigationPhase7;
}

export function useAi40Enabled(): boolean {
  return FEATURE_FLAGS.ai40PredictiveSafety;
}
