import { NextResponse } from "next/server";
import { validateSupabaseConfig, getSupabasePublishableKey } from "@/lib/supabase/env";
import { FEATURE_FLAGS } from "@/lib/features/flags";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = validateSupabaseConfig();
  const started = Date.now();

  let authReachable = false;
  let authStatus: number | null = null;
  let authError: string | null = null;

  if (config.hasValidKey) {
    try {
      const response = await fetch(`${config.url}/auth/v1/health`, {
        headers: { apikey: getSupabasePublishableKey() },
        cache: "no-store",
      });
      authStatus = response.status;
      authReachable = response.ok;
      if (!response.ok) {
        authError = `Auth health returned ${response.status}`;
      }
    } catch (error) {
      authReachable = false;
      authError = error instanceof Error ? error.message : "Auth health check failed";
    }
  }

  const status = config.ok && authReachable ? "healthy" : "degraded";
  const httpStatus = status === "healthy" ? 200 : 503;

  return NextResponse.json(
    {
      status,
      service: "smart-map",
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - started,
      features: {
        phase1Foundation: FEATURE_FLAGS.phase1Foundation,
        publicSafetyPhase2: FEATURE_FLAGS.publicSafetyPhase2,
        aiExpansionPhase3: FEATURE_FLAGS.aiExpansionPhase3,
        smartServicesPhase4: FEATURE_FLAGS.smartServicesPhase4,
        businessCommunityPhase5: FEATURE_FLAGS.businessCommunityPhase5,
        africaExpansionPhase6: FEATURE_FLAGS.africaExpansionPhase6,
        advancedNavigationPhase7: FEATURE_FLAGS.advancedNavigationPhase7,
        ai40PredictiveSafety: FEATURE_FLAGS.ai40PredictiveSafety,
      },
      supabase: {
        project: config.projectRef,
        configured: config.ok,
        authReachable,
        authStatus,
        authError,
        issues: config.issues,
      },
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
    },
    { status: httpStatus },
  );
}
