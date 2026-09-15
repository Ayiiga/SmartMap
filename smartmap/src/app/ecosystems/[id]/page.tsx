import { getEcosystemLessons, type EcosystemId } from "@/content/ecosystem-lessons";
import { LEARNING_ECOSYSTEMS } from "@/content/ecosystems";
import { notFound } from "next/navigation";
import { EcosystemHubClient } from "./ecosystem-hub-client";

const VALID_IDS = new Set(["gigascience", "gigarobotics", "gigacoding", "gigaarts", "gigainnovation"]);

export function generateStaticParams() {
  return Array.from(VALID_IDS).map((id) => ({ id }));
}

export default async function EcosystemHubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!VALID_IDS.has(id)) notFound();

  const ecosystem = LEARNING_ECOSYSTEMS.find((e) => e.id === id);
  if (!ecosystem) notFound();

  const lessons = getEcosystemLessons(id as EcosystemId);
  return <EcosystemHubClient ecosystem={ecosystem} lessons={lessons} />;
}
