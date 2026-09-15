"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NewsArticle } from "@/types/media";
import { RelativeTime } from "@/components/ui/relative-time";

export function HeroSlider({ articles }: { articles: NewsArticle[] }) {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % articles.length);
  }, [articles.length]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + articles.length) % articles.length);
  }, [articles.length]);

  useEffect(() => {
    if (articles.length <= 1) return;
    const timer = setInterval(next, 7000);
    return () => clearInterval(timer);
  }, [articles.length, next]);

  if (!articles.length) return null;

  const article = articles[index];

  return (
    <section className="relative overflow-hidden rounded-3xl" aria-label="Breaking news hero">
      <AnimatePresence mode="wait">
        <motion.div
          key={article.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="relative h-[320px] sm:h-[420px] lg:h-[480px]"
        >
          <Image
            src={article.imageUrl}
            alt=""
            fill
            priority={index === 0}
            loading={index === 0 ? undefined : "lazy"}
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1200px"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gtv-deep/95 via-gtv-deep/70 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
            <div className="max-w-2xl">
              <div className="flex flex-wrap gap-2">
                {article.isBreaking && (
                  <span className="rounded-full bg-gtv-red px-3 py-1 text-xs font-bold text-white">Breaking</span>
                )}
                <span className="rounded-full bg-gtv-cyan/20 px-3 py-1 text-xs font-bold text-gtv-cyan capitalize">
                  {article.category}
                </span>
              </div>
              <h1 className="font-display mt-4 text-2xl font-bold text-white sm:text-4xl lg:text-5xl leading-tight">
                {article.title}
              </h1>
              <p className="mt-3 text-sm text-white/80 sm:text-base line-clamp-2">{article.summary}</p>
              <p className="mt-2 text-xs text-white/60 sm:text-base">
                <RelativeTime date={article.publishedAt} /> · {article.author}
              </p>
              <div className="mt-6">
                <Link href={`/news/${article.slug}`}>
                  <Button size="lg" className="bg-white text-gtv-deep hover:bg-white/90">
                    Read Full Story
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {articles.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 backdrop-blur-sm hover:bg-white/30"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 backdrop-blur-sm hover:bg-white/30"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
          <div className="absolute bottom-4 right-6 flex gap-1.5">
            {articles.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full p-3`}
                aria-label={`Go to slide ${i + 1}`}
              >
                <span className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-gtv-gold" : "w-2 bg-white/40"}`} />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
