import { CategoryNewsPage, categoryMetadata } from "@/components/media/category-news-page";

export const metadata = categoryMetadata(
  "Health",
  "Health news, public health updates, and medical breakthroughs across Africa and the world.",
);

const TOPICS = ["Public Health", "Medicine", "Wellness", "Research", "Healthcare Policy"];

export default function HealthPage() {
  return (
    <CategoryNewsPage
      category="health"
      title="Health"
      subtitle="Medical news, wellness, and public health coverage"
      topics={TOPICS}
    />
  );
}
