import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export function GET() {
  return NextResponse.json({
    app: "GigaOrbit",
    release: "play-economy-2026-11-22",
    playable: true,
    workshop: true,
    virtualAwards: true,
    entry: "/gigaorbit/play",
    note: "Version identifies this source build, not a certified public deployment.",
  }, { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" } });
}
