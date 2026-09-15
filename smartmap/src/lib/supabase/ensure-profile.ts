import { createClient } from "@supabase/supabase-js";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

/**
 * Ensures a profile row exists after OAuth signup (fallback if DB trigger missing).
 */
export async function ensureUserProfile(
  userId: string,
  email: string,
  metadata: Record<string, unknown>,
  accessToken: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const fullName =
    (metadata.full_name as string) ??
    (metadata.name as string) ??
    email.split("@")[0];

  const avatarUrl =
    (metadata.avatar_url as string) ?? (metadata.picture as string) ?? null;

  const role = (metadata.role as string) ?? "student";

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        avatar_url: avatarUrl,
        email,
      })
      .eq("id", userId);

    return error ? { ok: false, error: error.message } : { ok: true };
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    email,
    full_name: fullName,
    avatar_url: avatarUrl,
    role,
  });

  if (profileError) {
    return { ok: false, error: profileError.message };
  }

  await supabase.from("gamification").upsert({ user_id: userId }, { onConflict: "user_id" });

  return { ok: true };
}
