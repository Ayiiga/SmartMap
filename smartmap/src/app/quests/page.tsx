"use client";

import { QuestPanel } from "@/components/gamification/quest-panel";
import { WorldMap } from "@/components/gamification/world-map";
import { ProgressBar } from "@/components/gamification/progress-bar";

export default function QuestsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-display text-3xl font-bold">Quests & Rewards</h1>
      <p className="mt-2 text-giga-muted">Complete daily quests, unlock worlds, and earn bonus XP and coins.</p>
      <div className="mt-6 max-w-md"><ProgressBar /></div>
      <div className="mt-10"><QuestPanel /></div>
      <div className="mt-12">
        <h2 className="font-display text-2xl font-bold mb-6">Unlockable Worlds</h2>
        <WorldMap />
      </div>
    </div>
  );
}
