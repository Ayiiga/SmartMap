import type { Metadata } from "next";
import { MediaPageShell } from "@/components/media/section-header";
import { NewsCard } from "@/components/media/news-card";
import { getArticlesByCategory } from "@/content/media/articles";

export const metadata: Metadata = {
  title: "Technology",
  description: "AI, mobile, gadgets, space, cybersecurity, and software news.",
};

const TECH_TOPICS = ["AI", "Mobile", "Gadgets", "Space", "Cybersecurity", "Software"];

export default function TechnologyPage() {
  const articles = getArticlesByCategory("technology");

  return (
    <MediaPageShell title="Technology" subtitle="Innovation, AI, and digital transformation across Africa">
      <div className="mb-8 flex flex-wrap gap-2">
        {TECH_TOPICS.map((topic) => (
          <span key={topic} className="rounded-full bg-gtv-purple/10 px-4 py-2 text-sm font-semibold text-gtv-purple">
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
