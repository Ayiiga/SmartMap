import type { Metadata } from "next";
import { MediaPageShell } from "@/components/media/section-header";
import { NewsCard } from "@/components/media/news-card";
import { AdPlaceholder } from "@/components/media/ad-placeholder";
import { getArticlesByCategory } from "@/content/media/articles";
import type { NewsCategory } from "@/types/media";

interface CategoryNewsPageProps {
  category: NewsCategory;
  title: string;
  subtitle: string;
  topics?: string[];
}

export function CategoryNewsPage({ category, title, subtitle, topics }: CategoryNewsPageProps) {
  const articles = getArticlesByCategory(category);
  const related = articles.length > 0 ? articles : getArticlesByCategory("world");

  return (
    <MediaPageShell title={title} subtitle={subtitle}>
      {topics && topics.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {topics.map((topic) => (
            <span
              key={topic}
              className="rounded-full bg-gtv-purple/10 px-4 py-2 text-sm font-semibold text-gtv-purple"
            >
              {topic}
            </span>
          ))}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((article, i) => (
          <NewsCard key={article.id} article={article} featured={i === 0} />
        ))}
      </div>
      <AdPlaceholder slot="banner" className="mt-10" />
    </MediaPageShell>
  );
}

export function categoryMetadata(title: string, description: string): Metadata {
  return { title, description };
}
