import type { Metadata } from "next";
import { MediaPageShell } from "@/components/media/section-header";
import { NewsCard } from "@/components/media/news-card";
import { getAfricaNews } from "@/content/media";

export const metadata: Metadata = {
  title: "Africa News",
  description: "News from Ghana, Nigeria, Kenya, South Africa, Egypt, Morocco, Ethiopia, Rwanda, and Uganda.",
};

const AFRICA_COUNTRIES = [
  "Ghana", "Nigeria", "Kenya", "South Africa", "Egypt", "Morocco", "Ethiopia", "Rwanda", "Uganda",
];

export default function AfricaPage() {
  const articles = getAfricaNews();

  return (
    <MediaPageShell title="Africa News" subtitle="Dedicated coverage across the continent">
      <div className="mb-8 flex flex-wrap gap-2">
        {AFRICA_COUNTRIES.map((country) => (
          <span key={country} className="rounded-full border border-giga-border px-4 py-2 text-sm font-semibold hover:border-gtv-cyan hover:bg-gtv-cyan/5">
            {country}
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
