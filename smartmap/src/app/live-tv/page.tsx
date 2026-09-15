import type { Metadata } from "next";
import Link from "next/link";
import { MediaPageShell, SectionHeader } from "@/components/media/section-header";
import { TvStationCard } from "@/components/media/tv-station-card";
import { TV_CATEGORIES, getTvByCategory, MOVIE_CHANNELS } from "@/content/media";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Film, Tv } from "lucide-react";

export const metadata: Metadata = {
  title: "Live TV",
  description: "Official live TV streams from Ghana, Nigeria, Kenya, South Africa, and international broadcasters.",
};

export default function LiveTvPage() {
  return (
    <MediaPageShell
      title="Live TV"
      subtitle="Watch official broadcaster streams in the GigaTrend TV Browser"
    >
      <GlassCard className="mb-10 border-gtv-purple/20 bg-gradient-to-r from-gtv-purple/5 to-gtv-cyan/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-extrabold flex items-center gap-2">
              <Tv className="h-6 w-6 text-gtv-purple" />
              GigaTrend TV Browser
            </h2>
            <p className="mt-2 text-base text-giga-muted max-w-xl">
              Browse and watch your preferred channels in-app. Official sources only — news, sports, movies, and entertainment.
            </p>
          </div>
          <Link href="/watch">
            <Button size="lg" className="gap-2 text-base font-bold min-h-[52px]">
              <Tv className="h-5 w-5" /> Open TV Browser
            </Button>
          </Link>
        </div>
      </GlassCard>

      <section className="mb-10">
        <SectionHeader title="Movies & Cinema" subtitle="Official streaming platforms — watch in browser" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOVIE_CHANNELS.map((movie) => (
            <GlassCard key={movie.id} hover className="flex flex-col p-5 sm:p-6">
              <div className="flex items-start justify-between">
                <span className="text-5xl">{movie.logo}</span>
                {movie.isLive && (
                  <span className="rounded-full bg-gtv-gold/20 px-3 py-1 text-xs font-bold uppercase text-gtv-gold">Streaming</span>
                )}
              </div>
              <h3 className="font-display mt-4 text-xl font-extrabold">{movie.name}</h3>
              <p className="mt-1 text-base text-giga-muted">{movie.country} · {movie.genre}</p>
              <p className="mt-1 text-sm text-giga-muted">{movie.officialSource}</p>
              <Link href={`/watch?id=${movie.id}`} className="mt-5">
                <Button className="w-full gap-2 text-base font-bold min-h-[52px]">
                  <Film className="h-5 w-5" /> Watch in Browser
                </Button>
              </Link>
            </GlassCard>
          ))}
        </div>
      </section>

      {TV_CATEGORIES.filter((c) => c !== "Movies & Cinema").map((category) => {
        const stations = getTvByCategory(category);
        if (!stations.length) return null;
        return (
          <section key={category} className="mb-10">
            <SectionHeader title={category} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stations.map((station) => (
                <TvStationCard key={station.id} station={station} />
              ))}
            </div>
          </section>
        );
      })}
    </MediaPageShell>
  );
}
