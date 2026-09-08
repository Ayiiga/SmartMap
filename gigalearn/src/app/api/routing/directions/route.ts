import { NextRequest, NextResponse } from "next/server";
import {
  coordsToOsrmParam,
  osrmRoutesToPlans,
  travelModeToOsrmProfile,
  type OsrmRouteResponse,
} from "@/lib/navigation/osrm";
import { planAdvancedRoutes } from "@/lib/navigation/route-engine";
import type { AdvancedTravelMode } from "@/lib/navigation/types";

const OSRM_BASE =
  process.env.OSRM_URL?.replace(/\/$/, "") ?? "https://router.project-osrm.org";

function parseCoordPair(value: string | null): { lat: number; lng: number } | null {
  if (!value) return null;
  const [latRaw, lngRaw] = value.split(",");
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const from = parseCoordPair(searchParams.get("from"));
  const to = parseCoordPair(searchParams.get("to"));
  const fromLabel = searchParams.get("fromLabel") ?? "Origin";
  const toLabel = searchParams.get("toLabel") ?? "Destination";
  const mode = (searchParams.get("mode") ?? "driving") as AdvancedTravelMode;
  const alternatives = searchParams.get("alternatives") !== "false";

  if (!from || !to) {
    return NextResponse.json({ error: "from and to coordinates required (lat,lng)" }, { status: 400 });
  }

  const waypointInput = {
    from: { id: "from", label: fromLabel, coordinates: from },
    to: { id: "to", label: toLabel, coordinates: to },
    mode,
    preferences: ["fastest", "shortest", "safest"] as const,
  };

  const fallback = () =>
    planAdvancedRoutes({
      ...waypointInput,
      preferences: ["fastest", "shortest", "safest"],
    });

  try {
    const profile = travelModeToOsrmProfile(mode);
    const coords = coordsToOsrmParam([from, to]);
    const url = `${OSRM_BASE}/route/v1/${profile}/${coords}?steps=true&geometries=geojson&overview=full&alternatives=${alternatives}`;

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(12_000),
    });

    if (!res.ok) {
      return NextResponse.json({ routes: fallback(), source: "synthetic", reason: "osrm_http_error" });
    }

    const data = (await res.json()) as OsrmRouteResponse;
    if (data.code !== "Ok" || !data.routes?.length) {
      return NextResponse.json({ routes: fallback(), source: "synthetic", reason: "osrm_no_route" });
    }

    const routes = osrmRoutesToPlans(data, {
      from: waypointInput.from,
      to: waypointInput.to,
      mode,
    });

    return NextResponse.json({
      routes,
      source: "osrm",
      count: routes.length,
    });
  } catch {
    return NextResponse.json({ routes: fallback(), source: "synthetic", reason: "osrm_fetch_failed" });
  }
}
