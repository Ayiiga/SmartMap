import { CategoryNewsPage, categoryMetadata } from "@/components/media/category-news-page";

export const metadata = categoryMetadata(
  "Science",
  "Science news, research breakthroughs, and innovation from Africa and around the world.",
);

const TOPICS = ["Research", "Space", "Climate", "Innovation", "Discovery"];

export default function SciencePage() {
  return (
    <CategoryNewsPage
      category="science"
      title="Science"
      subtitle="Research, discovery, and scientific innovation"
      topics={TOPICS}
    />
  );
}
