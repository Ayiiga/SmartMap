"use client";

import Link from "next/link";
import { Tv, Heart } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { LiveIndicator } from "@/components/media/trending-panel";
import { useMediaStore } from "@/stores/media-store";
import type { TvStation } from "@/types/media";
import { cn } from "@/lib/utils";

export function TvStationCard({ station }: { station: TvStation }) {
  const toggleFavorite = useMediaStore((s) => s.toggleFavoriteTv);
  const isFavorite = useMediaStore((s) => s.preferences.favoriteTvStations.includes(station.id));

  return (
    <div id={station.id}>
      <GlassCard hover className="flex flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="text-5xl" aria-hidden>{station.logo}</span>
          {station.isLive && <LiveIndicator />}
        </div>
        <h3 className="font-display mt-4 text-xl font-extrabold">{station.name}</h3>
        <p className="mt-1 text-base text-giga-muted">{station.country} · {station.category}</p>
        <p className="mt-1 text-sm text-giga-muted">Source: {station.officialSource}</p>
        <div className="mt-5 flex gap-2">
          <Link href={`/watch?id=${station.id}`} className="flex-1">
            <Button className="w-full gap-2 text-base font-bold min-h-[52px]">
              <Tv className="h-5 w-5" /> Watch in Browser
            </Button>
          </Link>
          <button
            onClick={() => toggleFavorite(station.id)}
            className={cn(
              "touch-target flex items-center justify-center rounded-xl border-2 px-4 min-h-[52px] min-w-[52px]",
              isFavorite ? "border-gtv-red bg-gtv-red/10 text-gtv-red" : "border-giga-border hover:border-gtv-purple",
            )}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={cn("h-6 w-6", isFavorite && "fill-current")} />
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
