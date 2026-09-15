"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined;

    try {
      const supabase = createClient();

      supabase.auth.getUser().then(({ data }) => {
        setUser(data.user);
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });

      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });
      subscription = authSubscription;
    } catch (error) {
      console.error("Supabase auth initialization failed:", error);
      setLoading(false);
    }

    return () => subscription?.unsubscribe();
  }, []);

  return { user, loading, isAuthenticated: !!user };
}
