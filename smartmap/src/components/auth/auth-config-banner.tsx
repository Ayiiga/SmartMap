"use client";

import { useEffect, useState } from "react";
import { validateSupabaseConfig } from "@/lib/supabase/env";
import { checkAuthConnectivity } from "@/lib/auth/supabase-auth";
import { getSupabaseAuthSettingsUrl } from "@/lib/supabase/site-url";

export function AuthConfigBanner() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const config = validateSupabaseConfig();
    if (!config.ok) {
      setMessage(config.issues.join(" "));
      return;
    }

    void checkAuthConnectivity().then((result) => {
      if (!result.ok) setMessage(result.message);
    });
  }, []);

  if (!message) return null;

  return (
    <div
      className="mb-6 rounded-xl border border-giga-orange/40 bg-giga-orange/10 px-4 py-3 text-sm text-giga-orange"
      role="alert"
    >
      <p className="font-semibold">Authentication setup issue</p>
      <p className="mt-1">{message}</p>
      <p className="mt-2 text-xs">
        Verify Supabase Site URL and Redirect URLs in your{" "}
        <a href={getSupabaseAuthSettingsUrl()} className="underline font-semibold" target="_blank" rel="noreferrer">
          Supabase dashboard
        </a>
        .
      </p>
    </div>
  );
}
