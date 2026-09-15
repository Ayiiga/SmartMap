import { ECOSYSTEM_LESSONS, type EcosystemId } from "@/content/ecosystem-lessons";
import { notFound } from "next/navigation";
import { EcosystemLessonClient } from "./ecosystem-lesson-client";

const VALID_IDS = new Set(["gigascience", "gigarobotics", "gigacoding", "gigaarts", "gigainnovation"]);

export function generateStaticParams() {
  return ECOSYSTEM_LESSONS.map((lesson) => ({
    id: lesson.ecosystemId,
    slug: lesson.slug,
  }));
}

export default async function EcosystemLessonPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = await params;
  if (!VALID_IDS.has(id)) notFound();

  const lesson = ECOSYSTEM_LESSONS.find((l) => l.ecosystemId === id && l.slug === slug);
  if (!lesson) notFound();

  return <EcosystemLessonClient lesson={lesson} ecosystemId={id as EcosystemId} />;
}
