import { DEFAULT_POST_AUTH_PATH } from "@/lib/auth/constants";
import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/supabase/site-url";
import { validateSupabaseConfig, getSupabasePublishableKey } from "@/lib/supabase/env";
import { fetchWithRetry } from "@/lib/network/fetch-with-retry";
import { logClientError } from "@/lib/monitoring/logger";

export type AuthResult<T> = { data: T | null; error: AuthError | null };

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: "config" | "network" | "auth" | "unknown" = "unknown",
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

function mapAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) return error;

  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  if (lower.includes("invalid api key")) {
    return new AuthError(
      "Authentication is misconfigured. The Supabase API key does not match this app. Check your environment variables.",
      "config",
      error,
    );
  }

  if (lower.includes("failed to fetch") || lower.includes("network") || lower.includes("abort")) {
    return new AuthError(
      "We could not reach the server. Check your internet connection and try again.",
      "network",
      error,
    );
  }

  if (lower.includes("invalid login credentials")) {
    return new AuthError("Incorrect email or password. Please try again.", "auth", error);
  }

  if (lower.includes("user already registered")) {
    return new AuthError("An account with this email already exists. Try signing in.", "auth", error);
  }

  if (lower.includes("email not confirmed")) {
    return new AuthError("Please confirm your email before signing in.", "auth", error);
  }

  return new AuthError(message || "Authentication failed. Please try again.", "auth", error);
}

async function withAuthRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const msg = error instanceof Error ? error.message.toLowerCase() : "";
      if (!msg.includes("failed to fetch") && !msg.includes("network")) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)));
    }
  }
  throw lastError;
}

function assertSupabaseReady(): void {
  const config = validateSupabaseConfig();
  if (!config.ok) {
    throw new AuthError(
      `Authentication is not configured correctly. ${config.issues.join(" ")}`,
      "config",
    );
  }
}

export async function signInWithEmailPassword(
  email: string,
  password: string,
): Promise<AuthResult<true>> {
  try {
    assertSupabaseReady();
    const supabase = createClient();

    const { error } = await withAuthRetry(() =>
      supabase.auth.signInWithPassword({ email: email.trim(), password }),
    );

    if (error) {
      const mapped = mapAuthError(error);
      logClientError("auth_sign_in_failed", { code: mapped.code, message: mapped.message });
      return { data: null, error: mapped };
    }

    return { data: true, error: null };
  } catch (error) {
    const mapped = mapAuthError(error);
    logClientError("auth_sign_in_exception", { code: mapped.code, message: mapped.message });
    return { data: null, error: mapped };
  }
}

export type SignUpResult = { needsEmailConfirmation: boolean };

export async function signUpWithEmailPassword(
  email: string,
  password: string,
  metadata: { full_name: string; role: string },
): Promise<AuthResult<SignUpResult>> {
  try {
    assertSupabaseReady();
    const supabase = createClient();

    const { data, error } = await withAuthRetry(() =>
      supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: metadata },
      }),
    );

    if (error) {
      const mapped = mapAuthError(error);
      logClientError("auth_sign_up_failed", { code: mapped.code, message: mapped.message });
      return { data: null, error: mapped };
    }

    const needsEmailConfirmation = !data.session;
    return { data: { needsEmailConfirmation }, error: null };
  } catch (error) {
    const mapped = mapAuthError(error);
    logClientError("auth_sign_up_exception", { code: mapped.code, message: mapped.message });
    return { data: null, error: mapped };
  }
}

export async function signInWithGoogle(
  redirectPath = DEFAULT_POST_AUTH_PATH,
): Promise<AuthResult<{ url?: string }>> {
  try {
    assertSupabaseReady();
    const supabase = createClient();

    const { data, error } = await withAuthRetry(() =>
      supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getAuthCallbackUrl(redirectPath),
          queryParams: { access_type: "offline", prompt: "consent" },
          skipBrowserRedirect: false,
        },
      }),
    );

    if (error) {
      const mapped = mapAuthError(error);
      logClientError("auth_google_failed", { code: mapped.code, message: mapped.message });
      return { data: null, error: mapped };
    }

    return { data: { url: data?.url }, error: null };
  } catch (error) {
    const mapped = mapAuthError(error);
    logClientError("auth_google_exception", { code: mapped.code, message: mapped.message });
    return { data: null, error: mapped };
  }
}

/** Ping Supabase auth health endpoint through the anon API. */
export async function checkAuthConnectivity(): Promise<{ ok: boolean; message: string }> {
  const config = validateSupabaseConfig();
  if (!config.ok) {
    return { ok: false, message: config.issues.join(" ") };
  }

  try {
    const response = await fetchWithRetry(`${config.url}/auth/v1/health`, {
      headers: { apikey: getSupabasePublishableKey() },
      retries: 1,
      timeoutMs: 8000,
    });
    return {
      ok: response.ok,
      message: response.ok ? "Authentication service is reachable." : `Auth health returned ${response.status}`,
    };
  } catch {
    return { ok: false, message: "Could not reach authentication service." };
  }
}
