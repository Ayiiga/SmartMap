import { signInWithGoogle as signInWithGoogleAuth } from "@/lib/auth/supabase-auth";
import { DEFAULT_POST_AUTH_PATH } from "@/lib/auth/constants";
import { createClient } from "@/lib/supabase/client";

/** @deprecated Use `@/lib/auth/supabase-auth` directly — kept for backward compatibility. */
export async function signInWithGoogle(redirectPath = DEFAULT_POST_AUTH_PATH) {
  const result = await signInWithGoogleAuth(redirectPath);
  return { data: result.data, error: result.error };
}

export async function signOut() {
  const supabase = createClient();
  return supabase.auth.signOut();
}

export async function getSession() {
  const supabase = createClient();
  return supabase.auth.getSession();
}

export async function getUser() {
  const supabase = createClient();
  return supabase.auth.getUser();
}
