import { NextResponse } from "next/server";
import { overpassNearbyEmergency } from "@/lib/geo/nominatim";
import { nearbyEmergencyServices } from "@/lib/navigation/emergency";
import { PLACES } from "@/content/smart-map/places";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const radiusM = Math.min(25000, Math.max(1000, Number(searchParams.get("radiusM") ?? 8000) || 8000));

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  const origin = { lat, lng };

  try {
    const live = await overpassNearbyEmergency(origin, { radiusM });
    if (live.length > 0) {
      return NextResponse.json({ results: live, source: "overpass" });
    }
  } catch {
    // Fall through to curated catalog relative to live GPS.
  }

  // Fallback: curated demo places measured from the user's live GPS (not Accra default).
  const fallback = nearbyEmergencyServices(origin, "driving", 12, PLACES).map((item) => ({
    id: item.place.id,
    name: item.place.name,
    category: item.place.category,
    coordinates: item.place.coordinates,
    address: item.place.address,
    phone: item.place.phone,
    distanceKm: item.distanceKm,
    durationMin: item.durationMin,
  }));

  return NextResponse.json({ results: fallback, source: "catalog-fallback" });
}
