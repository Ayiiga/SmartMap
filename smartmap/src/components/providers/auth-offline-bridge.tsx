"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { OfflineInitializer } from "@/components/providers/offline-initializer";
import { useAppStore } from "@/stores/app-store";
import { createClient } from "@/lib/supabase/client";
import { syncOfflineData } from "@/lib/offline/sync";

export function AuthOfflineBridge() {
  const { user, loading } = useAuth();
  const hydrateGamification = useAppStore((s) => s.hydrateGamification);
  const refreshLearningInsights = useAppStore((s) => s.refreshLearningInsights);
  const checkAchievements = useAppStore((s) => s.checkAchievements);

  useEffect(() => {
    if (loading || !user) return;

    const loadRemoteState = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.from("gamification").select("*").eq("user_id", user.id).single();
        if (data) {
          hydrateGamification({
            xp: data.xp ?? 0,
            coins: data.coins ?? 0,
            level: data.level ?? 1,
            streak: data.streak ?? 0,
            unlocked_lessons: data.unlocked_lessons ?? [],
            badges: [],
          });
        }
        await syncOfflineData(user.id);
        refreshLearningInsights();
        checkAchievements();
      } catch {
        // Gracefully continue with local state when remote fetch fails
      }
    };

    void loadRemoteState();
  }, [user, loading, hydrateGamification, refreshLearningInsights, checkAchievements]);

  return <OfflineInitializer userId={user?.id} />;
}
