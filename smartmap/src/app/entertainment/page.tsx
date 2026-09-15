import type { Metadata } from "next";
import { MediaPageShell } from "@/components/media/section-header";
import { NewsCard } from "@/components/media/news-card";
import { getArticlesByCategory } from "@/content/media/articles";

export const metadata: Metadata = {
  title: "Entertainment",
  description: "Movies, music, celebrities, TV shows, and lifestyle news.",
};

const ENT_TOPICS = ["Movies", "Music", "Celebrities", "TV Shows", "Lifestyle"];

export default function EntertainmentPage() {
  const articles = getArticlesByCategory("entertainment");

  return (
    <MediaPageShell title="Entertainment" subtitle="Movies, music, celebrities, and lifestyle">
      <div className="mb-8 flex flex-wrap gap-2">
        {ENT_TOPICS.map((topic) => (
          <span key={topic} className="rounded-full bg-giga-pink/10 px-4 py-2 text-sm font-semibold text-giga-pink">
            {topic}
          </span>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </MediaPageShell>
  );
}
