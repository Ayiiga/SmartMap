"use client";

import { Bookmark, Share2 } from "lucide-react";
import { useMediaStore } from "@/stores/media-store";

export function ArticleActions({ slug, title }: { slug: string; title: string }) {
  const toggleSaved = useMediaStore((s) => s.toggleSavedArticle);
  const isSaved = useMediaStore((s) => s.isArticleSaved(slug));

  const share = async () => {
    const url = `${window.location.origin}/news/${slug}`;
    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="mt-4 flex gap-2">
      <button
        onClick={() => toggleSaved(slug)}
        className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold min-h-[44px] ${
          isSaved ? "border-gtv-gold bg-gtv-gold/10 text-gtv-gold" : "border-giga-border hover:border-gtv-purple"
        }`}
        aria-pressed={isSaved}
      >
        <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
        {isSaved ? "Saved" : "Save"}
      </button>
      <button
        onClick={share}
        className="flex items-center gap-2 rounded-xl border border-giga-border px-4 py-2 text-sm font-semibold hover:border-gtv-purple min-h-[44px]"
      >
        <Share2 className="h-4 w-4" /> Share
      </button>
    </div>
  );
}
