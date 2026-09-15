"use client";

import type { ReactNode } from "react";
import {
  isFeatureEnabled,
  type FeatureFlagKey,
  type FeaturePhaseLabel,
} from "@/lib/features/flags";
import { FeatureComingSoon } from "@/components/smart-map/feature-coming-soon";

export function FeatureGate({
  flag,
  title,
  phase,
  description,
  children,
}: {
  flag: FeatureFlagKey;
  title: string;
  phase: FeaturePhaseLabel;
  description: string;
  children: ReactNode;
}) {
  if (!isFeatureEnabled(flag)) {
    return <FeatureComingSoon title={title} phase={phase} description={description} />;
  }
  return <>{children}</>;
}
