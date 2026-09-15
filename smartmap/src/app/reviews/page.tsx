"use client";

import { useMemo, useState } from "react";
import { Flag, Star, ThumbsUp } from "lucide-react";
import { FeatureGate } from "@/components/smart-map/feature-gate";
import { SAMPLE_REVIEWS } from "@/content/smart-map/business-community";
import { moderateText, simpleHash } from "@/lib/moderation/ai-moderation";
import { sanitizeText } from "@/lib/security/validate";

function ReviewsPageContent() {
  const [reviews, setReviews] = useState(SAMPLE_REVIEWS);
  const [draft, setDraft] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [modNote, setModNote] = useState<string | null>(null);

  const hashes = useMemo(
    () => reviews.map((r) => simpleHash(r.text.toLowerCase())),
    [reviews],
  );

  function submitReview() {
    const text = sanitizeText(draft, 1000);
    const place = sanitizeText(placeName, 120);
    if (!text || !place) return;
    const mod = moderateText(text, hashes);
    if (mod.label !== "clean") {
      setModNote(`Blocked by AI moderation (${mod.label}): ${mod.reasons.join(", ")}`);
      return;
    }
    setReviews((prev) => [
      {
        id: crypto.randomUUID(),
        placeName: place,
        rating: 5,
        text,
        helpfulVotes: 0,
        hasImage: false,
        hasVideo: false,
        reported: false,
      },
      ...prev,
    ]);
    setDraft("");
    setPlaceName("");
    setModNote("Review accepted.");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-6 sm:px-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-sm-emerald">Reviews</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-sm-primary dark:text-white">
          Ratings with AI moderation
        </h1>
      </header>

      <section className="mt-6 rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep">
        <h2 className="font-bold">Write a review</h2>
        <input
          value={placeName}
          onChange={(e) => setPlaceName(e.target.value)}
          placeholder="Place name"
          className="mt-3 w-full rounded-2xl border border-sm-border bg-transparent px-4 py-3 outline-none dark:border-white/15"
        />
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Share a helpful, respectful experience…"
          rows={3}
          className="mt-2 w-full rounded-2xl border border-sm-border bg-transparent px-4 py-3 outline-none dark:border-white/15"
        />
        <button
          type="button"
          onClick={submitReview}
          className="mt-3 rounded-2xl bg-sm-primary px-4 py-3 text-sm font-bold text-white"
        >
          Submit
        </button>
        {modNote && <p className="mt-2 text-sm text-slate-500">{modNote}</p>}
      </section>

      <ul className="mt-6 space-y-3">
        {reviews.map((r) => (
          <li
            key={r.id}
            className="rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold">{r.placeName}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-sm text-amber-600">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {r.rating.toFixed(1)}
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{r.text}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                  {r.hasImage && <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-white/10">Image</span>}
                  {r.hasVideo && <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-white/10">Video</span>}
                  {r.reported && <span className="rounded-full bg-sm-danger/10 px-2 py-1 text-sm-danger">Reported</span>}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 text-xs font-semibold text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {r.helpfulVotes}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Flag className="h-3.5 w-3.5" />
                  Report
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <FeatureGate
      flag="businessCommunityPhase5"
      title="Reviews & Moderation"
      phase="Phase 5"
      description="Ratings, media reviews, helpful votes, and AI moderation are ready behind the Phase 5 flag."
    >
      <ReviewsPageContent />
    </FeatureGate>
  );
}
