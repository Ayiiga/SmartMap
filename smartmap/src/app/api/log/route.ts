import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MAX_LOGS_PER_MINUTE = 60;
const recentLogCounts = new Map<string, number>();
let windowStart = Date.now();

function rateLimitOk(ip: string): boolean {
  const now = Date.now();
  if (now - windowStart > 60_000) {
    recentLogCounts.clear();
    windowStart = now;
  }
  const count = recentLogCounts.get(ip) ?? 0;
  if (count >= MAX_LOGS_PER_MINUTE) return false;
  recentLogCounts.set(ip, count + 1);
  return true;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimitOk(ip)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  try {
    const body = await request.json();
    const level = body?.level === "error" ? "error" : body?.level === "warn" ? "warn" : "info";
    const event = typeof body?.event === "string" ? body.event.slice(0, 120) : "unknown_event";

    // Server-side structured logging (visible in Vercel runtime logs)
    const payload = {
      event,
      level,
      message: typeof body?.message === "string" ? body.message.slice(0, 500) : undefined,
      context: body?.context,
      path: body?.path,
      online: body?.online,
      timestamp: body?.timestamp ?? new Date().toISOString(),
    };

    if (level === "error") {
      console.error("[SmartMap:client]", JSON.stringify(payload));
    } else if (level === "warn") {
      console.warn("[SmartMap:client]", JSON.stringify(payload));
    } else {
      console.info("[SmartMap:client]", JSON.stringify(payload));
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
