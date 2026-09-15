import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-6 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-sm-emerald">About</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold text-sm-primary dark:text-white">
        {BRAND.name}
      </h1>
      <p className="mt-2 text-lg font-semibold text-slate-600 dark:text-slate-300">{BRAND.tagline}</p>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
        <p>{BRAND.description}</p>
        <p>{BRAND.mission}</p>
        <p>
          Launching first in Ghana with interactive maps, trusted public services, AI assistance,
          community reporting, and emergency tools — then expanding to all 54 African countries with
          local emergency numbers, languages, and mapping data.
        </p>
      </div>
    </div>
  );
}
