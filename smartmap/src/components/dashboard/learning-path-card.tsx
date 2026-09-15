"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { buildPersonalizedLearningPath, type LearningPathItem } from "@/lib/learning-path/recommendations";
import { useGamification } from "@/stores/app-store";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";

export function LearningPathCard() {
  const gamification = useGamification();
  const [items, setItems] = useState<LearningPathItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const path = buildPersonalizedLearningPath(gamification);
    setItems(path);
    setLoading(false);
  }, [gamification]);

  if (loading) {
    return (
      <GlassCard>
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-16 w-full mb-2" />
        <Skeleton className="h-16 w-full" />
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-giga-purple" />
        <h2 className="font-display text-xl font-bold">Your AI Learning Path</h2>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <motion.div key={item.lessonId} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
            <Link href={item.href} className="block rounded-2xl border border-giga-border/60 p-4 transition hover:border-giga-purple/40 hover:bg-giga-purple/5 dark:border-giga-border-dark">
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-giga-muted">{item.reason}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
