import { NextResponse } from "next/server";
import { nominatimSearch } from "@/lib/geo/nominatim";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(12, Math.max(1, Number(searchParams.get("limit") ?? 8) || 8));

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await nominatimSearch(q, { limit });
    return NextResponse.json({ results, provider: "nominatim" });
  } catch (error) {
    return NextResponse.json(
      {
        results: [],
        error: error instanceof Error ? error.message : "Search failed",
      },
      { status: 502 },
    );
  }
}
