import {
  SUPABASE_URL,
  DEFAULT_SUPABASE_PROJECT_REF,
  extractProjectRefFromUrl,
  extractProjectRefFromJwt,
} from "@/lib/supabase/project";

function cleanEnv(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed === '""' || trimmed === "''") return undefined;
  return trimmed;
}

/** Strip invisible unicode that breaks fetch headers when copied from dashboards. */
export function sanitizeSupabaseKey(value: string): string {
  return value.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
}

function isPlaceholderValue(value: string): boolean {
  const lower = value.toLowerCase();
  return (
    lower === "placeholder-key" ||
    lower.startsWith("your-") ||
    lower.includes("placeholder") ||
    lower.includes("changeme")
  );
}

/** True when the value is a Supabase HTTP URL, not a key or placeholder. */
export function isValidSupabaseHttpUrl(value: string | undefined): value is string {
  if (!value || isPlaceholderValue(value)) return false;
  const trimmed = value.trim();
  if (trimmed.startsWith("eyJ") || trimmed.startsWith("sb_publishable_")) return false;
  if (!/^https?:\/\//i.test(trimmed)) return false;
  try {
    return new URL(trimmed).hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}

function isValidSupabaseKey(value: string | undefined): value is string {
  if (!value || isPlaceholderValue(value)) return false;
  const trimmed = sanitizeSupabaseKey(value);
  if (/^https?:\/\//i.test(trimmed) || trimmed.endsWith(".supabase.co")) return false;
  return trimmed.startsWith("eyJ") || trimmed.startsWith("sb_publishable_");
}

function collectKeyCandidates(): string[] {
  const raw = [
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY1),
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
    cleanEnv(process.env.ANON_PUBLIC_KEY),
    cleanEnv(process.env.Anon_public_key),
  ];

  const keys: string[] = [];
  for (const candidate of raw) {
    if (isValidSupabaseKey(candidate)) {
      keys.push(sanitizeSupabaseKey(candidate));
    }
  }
  return keys;
}

/** Resolved project ref: env override → URL hostname → anon JWT ref → default */
export function getSupabaseProjectRef(): string {
  const fromEnv = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF);
  if (fromEnv) return fromEnv;

  const fromUrl = extractProjectRefFromUrl(getSupabaseUrl());
  if (fromUrl) return fromUrl;

  for (const key of collectKeyCandidates()) {
    const fromKey = extractProjectRefFromJwt(key);
    if (fromKey) return fromKey;
  }

  return DEFAULT_SUPABASE_PROJECT_REF;
}

/**
 * Resolves the Supabase client API key.
 * Prefers a key whose JWT `ref` matches the configured project URL.
 */
export function getSupabasePublishableKey(): string {
  const urlRef = extractProjectRefFromUrl(getSupabaseUrl());
  const keys = collectKeyCandidates();

  if (urlRef) {
    const matching = keys.find((key) => extractProjectRefFromJwt(key) === urlRef);
    if (matching) return matching;
  }

  if (keys.length > 0) return keys[0];

  return "placeholder-key";
}

export function getSupabaseUrl(): string {
  const candidates = [
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL),
    cleanEnv(process.env.SUPABASE_URL),
  ];

  for (const candidate of candidates) {
    if (isValidSupabaseHttpUrl(candidate)) {
      return candidate.trim();
    }
  }

  return SUPABASE_URL;
}

export interface SupabaseConfigStatus {
  ok: boolean;
  url: string;
  hasValidKey: boolean;
  projectRef: string;
  issues: string[];
}

/** Validates client-side Supabase configuration for auth flows. */
export function validateSupabaseConfig(): SupabaseConfigStatus {
  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();
  const projectRef = getSupabaseProjectRef();
  const urlRef = extractProjectRefFromUrl(url);
  const keyRef = extractProjectRefFromJwt(key);
  const issues: string[] = [];

  if (!url.startsWith("https://") || !url.includes(".supabase.co")) {
    issues.push("Supabase URL is missing or invalid.");
  }

  if (!key.startsWith("eyJ") && !key.startsWith("sb_publishable_")) {
    issues.push("Supabase anon key is missing or invalid.");
  }

  if (urlRef && keyRef && urlRef !== keyRef) {
    issues.push(
      `Supabase anon key belongs to project "${keyRef}" but Smart Map expects "${urlRef}".`,
    );
  } else if (key.startsWith("eyJ") && keyRef && keyRef !== projectRef) {
    issues.push(
      `Supabase anon key belongs to project "${keyRef}" but Smart Map expects "${projectRef}".`,
    );
  } else if (!keyRef && urlRef && urlRef !== projectRef) {
    issues.push(
      `Supabase URL points to project "${urlRef}" but Smart Map expects "${projectRef}".`,
    );
  }

  return {
    ok: issues.length === 0,
    url,
    hasValidKey: key.startsWith("eyJ") || key.startsWith("sb_publishable_"),
    projectRef,
    issues,
  };
}
