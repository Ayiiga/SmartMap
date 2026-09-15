import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_POST_AUTH_PATH } from "@/lib/auth/constants";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

export async function updateSession(request: NextRequest) {
  try {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const protectedPaths = ["/dashboard/admin"];

    const isProtected = protectedPaths.some((p) =>
      request.nextUrl.pathname.startsWith(p),
    );

    if (isProtected && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register")) {
      const url = request.nextUrl.clone();
      const redirect = request.nextUrl.searchParams.get("redirect");
      url.pathname =
        redirect && redirect.startsWith("/") && !redirect.startsWith("//")
          ? redirect
          : DEFAULT_POST_AUTH_PATH;
      url.searchParams.delete("redirect");
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch (error) {
    console.error("Middleware session update failed:", error);
    return NextResponse.next({ request });
  }
}
