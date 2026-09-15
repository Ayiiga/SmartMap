import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import type { NewsArticle } from "@/types/media";

/** Server-rendered hero for fast LCP — no client JS required for first paint */
export function HeroStatic({ article }: { article: NewsArticle }) {
  return (
    <section
      className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl px-4 sm:px-6"
      aria-label="Breaking news hero"
    >
      <div className="relative h-[380px] sm:h-[440px] lg:h-[500px]">
        <Image
          src={article.imageUrl}
          alt=""
          fill
          priority
          fetchPriority="high"
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1200px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gtv-deep/95 via-gtv-deep/55 to-gtv-deep/20" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
          <div className="max-w-2xl">
            <div className="flex flex-wrap gap-2.5">
              {article.isBreaking && (
                <span className="rounded-full bg-gtv-red px-4 py-1.5 text-sm font-bold uppercase tracking-wide text-white shadow-sm">
                  Breaking
                </span>
              )}
              <span className="rounded-full bg-white/25 px-4 py-1.5 text-sm font-bold uppercase tracking-wide text-white backdrop-blur-sm capitalize">
                {article.category}
              </span>
            </div>
            <h1 className="font-display mt-5 text-[1.75rem] font-extrabold leading-[1.15] text-white sm:text-4xl lg:text-5xl">
              {article.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/95 sm:text-lg line-clamp-3">{article.summary}</p>
            <p className="mt-3 text-sm font-medium text-white/80 sm:text-base">
              {format(new Date(article.publishedAt), "MMM d, yyyy")} · {article.author}
            </p>
            <div className="mt-7">
              <Link href={`/news/${article.slug}`} aria-label={`Read full story: ${article.title}`}>
                <Button size="lg" className="bg-white text-gtv-deep hover:bg-white/90 text-base font-bold px-8 shadow-lg">
                  Read Full Story
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
