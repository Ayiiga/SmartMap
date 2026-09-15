import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || serviceKey.startsWith("your-")) {
    return NextResponse.json({ entries: [], source: "offline" });
  }

  try {
    const supabase = createClient(getSupabaseUrl(), serviceKey);
    const { data: scores, error } = await supabase
      .from("gamification")
      .select("xp, user_id, profiles(full_name)")
      .order("xp", { ascending: false })
      .limit(20);

    if (error || !scores?.length) {
      return NextResponse.json({ entries: [], source: "empty" });
    }

    const entries = scores.map((row, i) => {
      const profile = Array.isArray(row.profiles)
        ? (row.profiles[0] as { full_name: string } | undefined)
        : (row.profiles as { full_name: string } | null);
      return {
        rank: i + 1,
        name: profile?.full_name ?? "Learner",
        xp: row.xp,
        avatar: "🎓",
      };
    });

    return NextResponse.json({ entries, source: "cloud" });
  } catch {
    return NextResponse.json({ entries: [], source: "error" });
  }
}
