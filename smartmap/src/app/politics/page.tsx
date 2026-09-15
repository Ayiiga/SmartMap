import { CategoryNewsPage, categoryMetadata } from "@/components/media/category-news-page";

export const metadata = categoryMetadata(
  "Politics",
  "Political news, policy updates, and government coverage across Africa and the world.",
);

const TOPICS = ["Elections", "Policy", "Government", "Diplomacy", "Parliament"];

export default function PoliticsPage() {
  return (
    <CategoryNewsPage
      category="politics"
      title="Politics"
      subtitle="Policy, governance, and political developments"
      topics={TOPICS}
    />
  );
}
