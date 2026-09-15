/** Default GigaTrend TV Supabase project when env vars are unset */
export const DEFAULT_SUPABASE_PROJECT_REF = "vhgqzdxkjmsomclyrchv";

/** @deprecated Use `getSupabaseProjectRef()` from env — kept for static fallbacks */
export const SUPABASE_PROJECT_REF = DEFAULT_SUPABASE_PROJECT_REF;

export const SUPABASE_URL = `https://${DEFAULT_SUPABASE_PROJECT_REF}.supabase.co`;

export const SUPABASE_DB_HOST = `db.${DEFAULT_SUPABASE_PROJECT_REF}.supabase.co`;

export const SUPABASE_DASHBOARD_URL = `https://supabase.com/dashboard/project/${DEFAULT_SUPABASE_PROJECT_REF}`;

export function extractProjectRefFromUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const match = url.trim().match(/https?:\/\/([a-z0-9]+)\.supabase\.co/i);
  return match?.[1];
}

export function extractProjectRefFromJwt(key: string | undefined): string | undefined {
  if (!key?.startsWith("eyJ")) return undefined;
  try {
    const payload = JSON.parse(atob(key.split(".")[1] ?? "")) as { ref?: string };
    return payload.ref;
  } catch {
    return undefined;
  }
}
