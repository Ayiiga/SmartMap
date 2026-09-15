"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BRAND } from "@/lib/brand";
import { NewsCard, NewsCardCompact } from "@/components/media/news-card";
import { SectionHeader } from "@/components/media/section-header";
import { TrendingPanel } from "@/components/media/trending-panel";
import { VideoCard } from "@/components/media/video-card";
import { TvStationCard } from "@/components/media/tv-station-card";
import { FixtureCard } from "@/components/media/sports-panel";
import { LiveMatchTracker } from "@/components/media/live-match-tracker";
import { GlobalSearchBar } from "@/components/media/search-bar";
import { AdPlaceholder } from "@/components/media/ad-placeholder";
import { AiComingSoon } from "@/components/media/ai-coming-soon";
import { GlassCard } from "@/components/ui/glass-card";
import {
  NEWS_ARTICLES,
  getAfricaNews,
  TRENDING_STORIES,
  TRENDING_VIDEOS,
  TRENDING_HASHTAGS,
  TRENDING_SEARCHES,
  VIRAL_TOPICS,
  VIRAL_PEOPLE,
  VIDEO_NEWS,
  TV_STATIONS,
  SPORTS_FIXTURES,
} from "@/content/media";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

export function NewsDashboard() {
  const liveFixtures = SPORTS_FIXTURES.filter((f) => f.status === "live");
  const africaNews = getAfricaNews();

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <motion.div {...fadeUp} className="mb-6">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-gtv-deep dark:text-gtv-cyan">{BRAND.tagline}</p>
        <GlobalSearchBar className="mt-4" />
      </motion.div>

      <motion.section {...fadeUp} transition={{ delay: 0.1 }} className="mt-10">
        <LiveMatchTracker compact />
      </motion.section>

      <motion.section {...fadeUp} transition={{ delay: 0.11 }} className="mt-10">
        <SectionHeader title="Trending Now" subtitle="Real-time stories, videos, and topics" href="/trending" />
        <TrendingPanel
          stories={TRENDING_STORIES}
          videos={TRENDING_VIDEOS}
          hashtags={TRENDING_HASHTAGS}
          searches={TRENDING_SEARCHES}
          topics={VIRAL_TOPICS}
          people={VIRAL_PEOPLE}
          showPeriodFilter
        />
      </motion.section>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <motion.div {...fadeUp} transition={{ delay: 0.12 }} className="lg:col-span-2 space-y-8">
          <section>
            <SectionHeader title="Latest News" href="/breaking" />
            <div className="grid gap-4 sm:grid-cols-2">
              {NEWS_ARTICLES.slice(0, 4).map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </section>

          <section>
            <SectionHeader title="Sports Center" subtitle="Live scores and fixtures" href="/sports" />
            <div className="grid gap-3 sm:grid-cols-2">
              {(liveFixtures.length > 0 ? liveFixtures : SPORTS_FIXTURES.slice(0, 2)).map((f) => (
                <FixtureCard key={f.id} fixture={f} />
              ))}
            </div>
            <Link href="/world-cup-2026" className="mt-3 inline-block text-sm font-bold text-gtv-purple hover:underline">
              FIFA World Cup 2026 →
            </Link>
          </section>

          <section>
            <SectionHeader title="Video News" href="/videos" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {VIDEO_NEWS.slice(0, 3).map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          </section>
        </motion.div>

        <motion.aside {...fadeUp} transition={{ delay: 0.14 }} className="space-y-6">
          <GlassCard className="bg-gradient-to-br from-gtv-deep to-gtv-purple text-white border-0">
            <h3 className="font-display text-lg font-bold">Africa News</h3>
            <div className="mt-3 space-y-1">
              {africaNews.slice(0, 5).map((a) => (
                <NewsCardCompact key={a.id} article={a} />
              ))}
            </div>
            <Link href="/africa" className="mt-3 inline-block text-sm font-bold text-gtv-gold hover:underline">
              All Africa coverage →
            </Link>
          </GlassCard>

          <section>
            <SectionHeader title="Live TV" href="/live-tv" />
            <div className="space-y-3">
              {TV_STATIONS.filter((s) => s.isLive).slice(0, 3).map((s) => (
                <TvStationCard key={s.id} station={s} />
              ))}
            </div>
          </section>

          <AdPlaceholder slot="sidebar" />

          <GlassCard className="border-dashed border-gtv-gold/40 bg-gtv-gold/5">
            <p className="text-xs font-semibold uppercase text-gtv-gold">Premium</p>
            <p className="mt-1 font-display font-bold">Go Ad-Free</p>
            <p className="mt-1 text-sm text-giga-muted">Membership, sponsored content & API access coming soon.</p>
          </GlassCard>
        </motion.aside>
      </div>

      <AdPlaceholder slot="banner" className="mt-8" />

      <section className="mt-10">
        <AiComingSoon />
      </section>
    </div>
  );
}
