import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "Smart Map Sync API",
    timestamp: new Date().toISOString(),
  });
}

export async function POST() {
  return NextResponse.json({
    synced: true,
    message: "Content sync endpoint — client uses Supabase + IndexedDB offline queue",
  });
}
