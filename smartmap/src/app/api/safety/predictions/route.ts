import { NextResponse } from "next/server";
import type { WeatherSnapshot } from "@/types/smart-map";
import type { CommunityReport } from "@/types/smart-map";
import { buildSafetyDashboard } from "@/lib/ai40/safety-dashboard";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      from: { lat: number; lng: number };
      to?: { lat: number; lng: number };
      weather?: WeatherSnapshot;
      reports?: CommunityReport[];
    };

    if (!body.from?.lat || !body.from?.lng) {
      return NextResponse.json({ error: "from coordinates required" }, { status: 400 });
    }

    const dashboard = buildSafetyDashboard({
      from: body.from,
      to: body.to ?? body.from,
      weather: body.weather,
      reports: body.reports ?? [],
    });

    return NextResponse.json({
      dashboard,
      disclaimer:
        "AI forecasts are estimates based on available data. Always follow official emergency alerts.",
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
