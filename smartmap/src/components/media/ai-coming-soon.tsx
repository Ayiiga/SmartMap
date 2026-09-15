"use client";

import Link from "next/link";
import { Bot, Sparkles, Bell } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMediaStore } from "@/stores/media-store";

const ROADMAP = [
  "Intelligent news summaries",
  "Sports insights & match analysis",
  "Multilingual explanations",
  "Voice assistance",
  "Personalized recommendations",
];

interface AiComingSoonProps {
  compact?: boolean;
  className?: string;
}

/** Premium Coming Soon card — no fake chat UI. Architecture ready for future AI enablement. */
export function AiComingSoon({ compact = false, className }: AiComingSoonProps) {
  const updateNotifications = useMediaStore((s) => s.updateNotifications);
  const aiNotify = useMediaStore((s) => s.preferences.notifications.aiRecommendations);

  const handleNotify = () => {
    updateNotifications({ aiRecommendations: true });
    alert("We'll notify you when GigaTrend AI launches!");
  };

  if (compact) {
    return (
      <GlassCard className={cn("border-gtv-purple/20 bg-gradient-to-br from-gtv-purple/5 to-gtv-cyan/5", className)}>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gtv-purple to-gtv-cyan text-white">
            <Bot className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold">GigaTrend AI</h3>
              <span className="rounded-full bg-gtv-gold/20 px-2.5 py-0.5 text-[10px] font-bold uppercase text-gtv-gold">
                Coming Soon
              </span>
            </div>
            <p className="mt-1 text-sm text-giga-muted">
              Intelligent summaries, sports insights, and voice assistance are in development.
            </p>
            <Link href="/ai-assistant" className="mt-2 inline-block text-sm font-semibold text-gtv-purple hover:underline">
              Learn more →
            </Link>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <section className={cn("relative overflow-hidden", className)} aria-labelledby="ai-coming-soon-title">
      <GlassCard className="border-gtv-purple/30 bg-gradient-to-br from-gtv-deep/5 via-gtv-purple/10 to-gtv-cyan/10 p-8 sm:p-12">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gtv-purple/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gtv-cyan/10 blur-3xl" />

        <div className="relative mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-gtv-purple to-gtv-cyan text-white shadow-xl">
            <Bot className="h-10 w-10" />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-gtv-gold/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-gtv-gold">
            <Sparkles className="h-3.5 w-3.5" />
            Coming Soon
          </span>

          <h2 id="ai-coming-soon-title" className="font-display mt-4 text-3xl font-bold sm:text-4xl">
            GigaTrend AI
          </h2>

          <p className="mt-4 text-base text-giga-muted sm:text-lg leading-relaxed">
            Intelligent news summaries, sports insights, multilingual explanations, voice assistance,
            and personalized recommendations are currently in development.
          </p>

          <ul className="mt-8 grid gap-2 text-left sm:grid-cols-2">
            {ROADMAP.map((item) => (
              <li key={item} className="flex items-center gap-2 rounded-xl bg-white/50 px-4 py-2.5 text-sm dark:bg-giga-surface/50">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gtv-cyan" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button onClick={handleNotify} variant={aiNotify ? "outline" : "primary"} className="gap-2">
              <Bell className="h-4 w-4" />
              {aiNotify ? "Notifications Enabled" : "Notify Me"}
            </Button>
            <Link href="/search">
              <Button variant="outline">Use Search Instead</Button>
            </Link>
          </div>
        </div>
      </GlassCard>
    </section>
  );
}
