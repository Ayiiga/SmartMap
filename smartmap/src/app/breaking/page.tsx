import type { Metadata } from "next";
import { MediaPageShell } from "@/components/media/section-header";
import { NewsCard } from "@/components/media/news-card";
import { getBreakingNews, NEWS_ARTICLES } from "@/content/media";

export const metadata: Metadata = {
  title: "Breaking News",
  description: "Latest breaking news from across Africa and the world.",
};

export default function BreakingNewsPage() {
  const breaking = getBreakingNews();
  const articles = breaking.length > 0 ? breaking : NEWS_ARTICLES.filter((a) => a.category === "politics");

  return (
    <MediaPageShell title="Breaking News" subtitle="Live updates and developing stories">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article, i) => (
          <NewsCard key={article.id} article={article} featured={i === 0} />
        ))}
      </div>
    </MediaPageShell>
  );
}
