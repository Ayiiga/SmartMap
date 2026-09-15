"use client";

import { FeatureGate } from "@/components/smart-map/feature-gate";
import { AdvancedNavClient } from "@/components/navigation/advanced-nav-client";

export default function AdvancedNavigationPage() {
  return (
    <FeatureGate
      flag="advancedNavigationPhase7"
      title="Advanced Navigation"
      phase="Phase 7"
      description="Professional routing, map layers, emergency navigation, AI safety warnings, and trip summaries are ready behind the Phase 7 flag."
    >
      <AdvancedNavClient />
    </FeatureGate>
  );
}
