import type { Metadata } from "next";
import { MediaPageShell, SectionHeader } from "@/components/media/section-header";
import { NewsCard } from "@/components/media/news-card";
import { FixtureCard, StandingsTable } from "@/components/media/sports-panel";
import { getFixturesByLeague, LEAGUE_STANDINGS } from "@/content/media";
import { getArticlesByCategory } from "@/content/media/articles";

export const metadata: Metadata = {
  title: "FIFA World Cup 2026",
  description: "World Cup 2026 news, fixtures, squad updates, and AI match analysis.",
};

export default function WorldCupPage() {
  const fixtures = getFixturesByLeague("world-cup-2026");
  const news = getArticlesByCategory("sports").filter((a) => a.tags.includes("World Cup 2026"));

  return (
    <MediaPageShell
      title="FIFA World Cup 2026"
      subtitle="Africa's teams, fixtures, and tournament coverage"
    >
      <SectionHeader title="Upcoming Matches" />
      <div className="grid gap-3 sm:grid-cols-2 mb-10">
        {fixtures.map((f) => (
          <FixtureCard key={f.id} fixture={f} />
        ))}
      </div>

      <SectionHeader title="Group Standings" />
      <div className="max-w-md mb-10">
        <StandingsTable standings={LEAGUE_STANDINGS["world-cup-2026"]} title="Group Preview" />
      </div>

      <SectionHeader title="World Cup News & AI Analysis" />
      <div className="grid gap-4 sm:grid-cols-2">
        {news.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </MediaPageShell>
  );
}
