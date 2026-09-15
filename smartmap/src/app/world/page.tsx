import type { Metadata } from "next";
import { MediaPageShell } from "@/components/media/section-header";
import { NewsCard } from "@/components/media/news-card";
import { NEWS_ARTICLES } from "@/content/media";

export const metadata: Metadata = {
  title: "World News",
  description: "Global politics, business, technology, science, health, and environment news.",
};

const WORLD_CATEGORIES = ["Politics", "Business", "Economy", "Technology", "Science", "Health", "Environment"];

export default function WorldPage() {
  const worldArticles = NEWS_ARTICLES.filter((a) => !a.country || a.category === "technology");

  return (
    <MediaPageShell title="World News" subtitle="Global coverage and international developments">
      <div className="mb-8 flex flex-wrap gap-2">
        {WORLD_CATEGORIES.map((cat) => (
          <span key={cat} className="rounded-full bg-gtv-deep/5 px-4 py-2 text-sm font-semibold dark:bg-white/5">
            {cat}
          </span>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {worldArticles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </MediaPageShell>
  );
}
