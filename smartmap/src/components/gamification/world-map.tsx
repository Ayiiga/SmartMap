"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LEARNING_WORLDS } from "@/content/worlds";
import { useGamification } from "@/stores/app-store";
import { GlassCard } from "@/components/ui/glass-card";

export function WorldMap() {
  const { xp, unlocked_worlds } = useGamification();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {LEARNING_WORLDS.map((world, index) => {
        const unlocked = unlocked_worlds.includes(world.id) || xp >= world.unlockXp;
        return (
          <motion.div
            key={world.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.06 }}
          >
            <Link href={world.level === "mathematics" ? "/gigamath" : `/learn?level=${world.level}`}>
              <GlassCard hover className={!unlocked ? "opacity-60" : undefined}>
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{unlocked ? world.icon : "🔒"}</span>
                  <div>
                    <p className="font-display font-bold">{world.title}</p>
                    <p className="text-sm text-giga-muted">{world.description}</p>
                    {!unlocked && <p className="mt-2 text-xs font-semibold text-giga-orange">{world.unlockXp} XP to unlock</p>}
                  </div>
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
