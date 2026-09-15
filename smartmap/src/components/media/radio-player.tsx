"use client";

import { useState, useRef } from "react";
import { Play, Pause, Volume2, Heart } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { useMediaStore } from "@/stores/media-store";
import type { RadioStation } from "@/types/media";
import { cn } from "@/lib/utils";

export function RadioPlayerCard({ station }: { station: RadioStation }) {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const toggleFavorite = useMediaStore((s) => s.toggleFavoriteRadio);
  const isFavorite = useMediaStore((s) => s.preferences.favoriteRadioStations.includes(station.id));

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(station.streamUrl);
      audioRef.current.volume = volume;
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => setPlaying(false));
      setPlaying(true);
    }
  };

  return (
    <div id={station.id}>
    <GlassCard hover className="flex items-center gap-4">
      <span className="text-3xl" aria-hidden>{station.logo}</span>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold truncate">{station.name}</h3>
        <p className="text-xs text-giga-muted">{station.country} · {station.genre}</p>
        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gtv-purple text-white hover:bg-gtv-purple/90"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </button>
          <div className="flex flex-1 items-center gap-2">
            <Volume2 className="h-4 w-4 text-giga-muted shrink-0" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setVolume(v);
                if (audioRef.current) audioRef.current.volume = v;
              }}
              className="w-full accent-gtv-purple"
              aria-label="Volume"
            />
          </div>
          <button
            onClick={() => toggleFavorite(station.id)}
            className={cn("p-2", isFavorite ? "text-gtv-red" : "text-giga-muted hover:text-gtv-red")}
            aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
          >
            <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
          </button>
        </div>
      </div>
    </GlassCard>
    </div>
  );
}
