"use client";

import Link from "next/link";
import { useState } from "react";
import { TrendingUp, Flame, Hash } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import type { TrendingItem } from "@/types/media";
import { cn } from "@/lib/utils";

type TrendingPeriod = "today" | "week" | "month";

const PERIOD_LABELS: Record<TrendingPeriod, string> = {
  today: "Today",
  week: "This Week",
  month: "This Month",
};

function filterByPeriod(items: TrendingItem[], period: TrendingPeriod): TrendingItem[] {
  if (period === "today") return items;
  if (period === "week") return [...items].sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
  return [...items].reverse();
}

function TrendingList({ title, items, icon }: { title: string; items: TrendingItem[]; icon: React.ReactNode }) {
  return (
    <GlassCard className="h-full p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gtv-purple/10">{icon}</span>
        <h3 className="font-display text-lg font-extrabold sm:text-xl">{title}</h3>
      </div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={item.id}>
            <Link
              href={`/search?q=${encodeURIComponent(item.label)}`}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-base transition-colors hover:bg-gtv-purple/5 min-h-[48px]"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gtv-deep/5 text-sm font-extrabold text-gtv-purple">
                {i + 1}
              </span>
              <span className="flex-1 font-semibold leading-snug">{item.label}</span>
              {item.change === "new" && (
                <span className="rounded-full bg-gtv-gold/20 px-2.5 py-1 text-xs font-bold uppercase text-gtv-gold">NEW</span>
              )}
              {item.change === "up" && <TrendingUp className="h-5 w-5 shrink-0 text-gtv-green" strokeWidth={2.5} aria-label="Trending up" />}
              {item.count && (
                <span className="text-sm font-semibold text-giga-muted">{(item.count / 1000).toFixed(1)}k</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

const iconClass = "h-6 w-6";

export function TrendingPanel({
  stories,
  videos,
  hashtags,
  searches,
  topics,
  people,
  showPeriodFilter = false,
}: {
  stories: TrendingItem[];
  videos: TrendingItem[];
  hashtags: TrendingItem[];
  searches: TrendingItem[];
  topics: TrendingItem[];
  people: TrendingItem[];
  showPeriodFilter?: boolean;
}) {
  const [period, setPeriod] = useState<TrendingPeriod>("today");

  const filteredStories = filterByPeriod(stories, period);
  const filteredVideos = filterByPeriod(videos, period);
  const filteredHashtags = filterByPeriod(hashtags, period);
  const filteredSearches = filterByPeriod(searches, period);
  const filteredTopics = filterByPeriod(topics, period);
  const filteredPeople = filterByPeriod(people, period);

  return (
    <div>
      {showPeriodFilter && (
        <div className="mb-6 flex flex-wrap gap-2.5" role="tablist" aria-label="Trending period">
          {(Object.keys(PERIOD_LABELS) as TrendingPeriod[]).map((p) => (
            <button
              key={p}
              role="tab"
              aria-selected={period === p}
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-full px-5 py-2.5 text-base font-bold transition-colors min-h-[48px]",
                period === p
                  ? "bg-gtv-purple text-white shadow-md shadow-gtv-purple/25"
                  : "bg-gtv-purple/10 text-gtv-purple hover:bg-gtv-purple/20",
              )}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <TrendingList title="Trending Stories" items={filteredStories} icon={<Flame className={cn(iconClass, "text-gtv-red")} strokeWidth={2.25} />} />
        <TrendingList title="Trending Videos" items={filteredVideos} icon={<TrendingUp className={cn(iconClass, "text-gtv-cyan")} strokeWidth={2.25} />} />
        <TrendingList title="Trending Hashtags" items={filteredHashtags} icon={<Hash className={cn(iconClass, "text-gtv-purple")} strokeWidth={2.25} />} />
        <TrendingList title="Trending Searches" items={filteredSearches} icon={<TrendingUp className={cn(iconClass, "text-gtv-gold")} strokeWidth={2.25} />} />
        <TrendingList title="Trending Topics" items={filteredTopics} icon={<Flame className={cn(iconClass, "text-gtv-orange")} strokeWidth={2.25} />} />
        <TrendingList title="Popular People" items={filteredPeople} icon={<TrendingUp className={cn(iconClass, "text-gtv-purple")} strokeWidth={2.25} />} />
      </div>
    </div>
  );
}

export function LiveIndicator({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full bg-gtv-red/10 px-3 py-1 text-sm font-bold uppercase tracking-wide text-gtv-red", className)}>
      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-gtv-red" aria-hidden />
      LIVE
    </span>
  );
}
