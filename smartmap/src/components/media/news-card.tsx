"use client";

import { RelativeTime } from "@/components/ui/relative-time";
import Link from "next/link";
import Image from "next/image";
import { Bookmark, Clock } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import type { NewsArticle } from "@/types/media";

export function NewsCard({
  article,
  featured = false,
}: {
  article: NewsArticle;
  featured?: boolean;
  /** @deprecated AI summaries coming soon — kept for API compatibility */
  showAiButton?: boolean;
}) {
  return (
    <GlassCard hover className={cn("overflow-hidden p-0", featured && "sm:col-span-2")}>
      <Link href={`/news/${article.slug}`} className="group block">
        <div className={cn("relative overflow-hidden", featured ? "h-60 sm:h-72" : "h-52 sm:h-48")}>
          <Image
            src={article.imageUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={featured ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <div className="flex flex-wrap gap-2">
              <span className="inline-block rounded-full bg-gtv-cyan px-3 py-1 text-xs font-bold uppercase tracking-wider sm:text-sm">
                {article.category}
              </span>
              {article.isBreaking && (
                <span className="inline-block rounded-full bg-gtv-red px-3 py-1 text-xs font-bold uppercase tracking-wider sm:text-sm">
                  Breaking
                </span>
              )}
            </div>
            <h3 className={cn("font-display mt-3 font-extrabold leading-snug", featured ? "text-xl sm:text-2xl" : "text-lg sm:text-xl")}>
              {article.title}
            </h3>
          </div>
        </div>
        <div className="p-5">
          <p className="text-base leading-relaxed text-giga-muted line-clamp-2">{article.summary}</p>
          <div className="mt-4 flex items-center justify-between text-sm font-medium text-giga-muted">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" strokeWidth={2.25} />
              <RelativeTime date={article.publishedAt} />
            </span>
            <span>{article.readMinutes} min read</span>
          </div>
        </div>
      </Link>
    </GlassCard>
  );
}

export function NewsCardCompact({ article }: { article: NewsArticle }) {
  return (
    <Link href={`/news/${article.slug}`} className="group flex gap-4 rounded-2xl p-3 transition-colors hover:bg-gtv-purple/5 min-h-[72px]">
      <div className="relative h-[4.5rem] w-24 shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-28">
        <Image src={article.imageUrl} alt="" fill className="object-cover" sizes="112px" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wider text-gtv-cyan sm:text-sm">{article.category}</p>
        <h4 className="mt-1 font-bold text-base leading-snug line-clamp-2 group-hover:text-gtv-purple">{article.title}</h4>
        <p className="mt-1 text-sm text-giga-muted">
          <RelativeTime date={article.publishedAt} />
        </p>
      </div>
      <Bookmark className="h-5 w-5 shrink-0 text-giga-muted opacity-0 group-hover:opacity-100" strokeWidth={2} aria-hidden />
    </Link>
  );
}
