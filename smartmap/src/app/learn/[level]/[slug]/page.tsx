import { LESSONS } from "@/content/curriculum";
import { LessonPageClient } from "./lesson-page-client";

export function generateStaticParams() {
  return LESSONS.map((lesson) => ({
    level: lesson.level,
    slug: lesson.slug,
  }));
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ level: string; slug: string }>;
}) {
  const { level, slug } = await params;
  return <LessonPageClient level={level} slug={slug} />;
}
