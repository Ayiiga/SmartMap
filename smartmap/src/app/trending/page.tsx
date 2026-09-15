import type { Metadata } from "next";
import { MediaPageShell } from "@/components/media/section-header";
import { TrendingPanel } from "@/components/media/trending-panel";
import {
  TRENDING_STORIES,
  TRENDING_VIDEOS,
  TRENDING_HASHTAGS,
  TRENDING_SEARCHES,
  VIRAL_TOPICS,
  VIRAL_PEOPLE,
} from "@/content/media";

export const metadata: Metadata = {
  title: "Trending",
  description: "Trending stories, videos, hashtags, searches, and viral topics in real time.",
};

export default function TrendingPage() {
  return (
    <MediaPageShell title="Trending Now" subtitle="Real-time trending across news, sports, and entertainment">
      <TrendingPanel
        stories={TRENDING_STORIES}
        videos={TRENDING_VIDEOS}
        hashtags={TRENDING_HASHTAGS}
        searches={TRENDING_SEARCHES}
        topics={VIRAL_TOPICS}
        people={VIRAL_PEOPLE}
        showPeriodFilter
      />
    </MediaPageShell>
  );
}
