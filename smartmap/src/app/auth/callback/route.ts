import { NextResponse } from "next/server";
import { normalizeRedirectPath } from "@/lib/auth/constants";
import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/supabase/ensure-profile";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextPath = normalizeRedirectPath(searchParams.get("redirect"));
  const errorParam = searchParams.get("error_description") ?? searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?message=${encodeURIComponent(errorParam)}`,
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error?message=missing_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?message=${encodeURIComponent(error.message)}`,
    );
  }

  const user = data.user;
  const session = data.session;

  if (user && session?.access_token) {
    await ensureUserProfile(
      user.id,
      user.email ?? "",
      user.user_metadata ?? {},
      session.access_token,
    );
  }

  return NextResponse.redirect(`${origin}${nextPath}`);
}
