"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tv, Clock } from "lucide-react";
import { getLiveFixtures, getUpcomingFixtures, getTvStationById } from "@/content/media";
import type { SportsFixture } from "@/types/media";
import { GlassCard } from "@/components/ui/glass-card";
import { LiveIndicator } from "@/components/media/trending-panel";
import { FixedDateTime } from "@/components/ui/relative-time";
import { cn } from "@/lib/utils";

function LiveFixtureRow({ fixture, tick }: { fixture: SportsFixture; tick: number }) {
  const minute = fixture.status === "live" && fixture.minute
    ? Math.min(fixture.minute + Math.floor(tick / 60), 90)
    : fixture.minute;

  const channel = fixture.watchChannelId ? getTvStationById(fixture.watchChannelId) : null;

  return (
    <GlassCard className="border-gtv-red/20 bg-gradient-to-r from-gtv-red/5 to-transparent p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <LiveIndicator />
        {minute !== undefined && (
          <span className="rounded-full bg-gtv-red/10 px-3 py-1 text-sm font-bold text-gtv-red">
            {minute}&apos;
          </span>
        )}
        <span className="text-sm font-semibold uppercase text-giga-muted">{fixture.league.replace(/-/g, " ")}</span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 text-center">
          <p className="text-lg font-extrabold sm:text-xl">{fixture.homeTeam}</p>
          <p className="font-display mt-1 text-3xl font-extrabold text-gtv-purple sm:text-4xl">{fixture.homeScore ?? 0}</p>
        </div>
        <p className="text-sm font-bold text-giga-muted">VS</p>
        <div className="flex-1 text-center">
          <p className="text-lg font-extrabold sm:text-xl">{fixture.awayTeam}</p>
          <p className="font-display mt-1 text-3xl font-extrabold text-gtv-purple sm:text-4xl">{fixture.awayScore ?? 0}</p>
        </div>
      </div>

      <p className="mt-3 text-center text-sm text-giga-muted">{fixture.venue}</p>

      {channel && (
        <Link
          href={`/watch?id=${channel.id}&match=${fixture.id}`}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gtv-purple px-4 py-3.5 text-base font-bold text-white hover:bg-gtv-purple/90 min-h-[52px] shadow-md shadow-gtv-purple/25"
        >
          <Tv className="h-5 w-5" />
          Watch on {channel.name}
        </Link>
      )}
    </GlassCard>
  );
}

function UpcomingRow({ fixture }: { fixture: SportsFixture }) {
  const channel = fixture.watchChannelId ? getTvStationById(fixture.watchChannelId) : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-giga-border px-4 py-4 hover:border-gtv-purple/30 transition-colors">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Clock className="h-5 w-5 shrink-0 text-gtv-cyan" />
        <div className="min-w-0">
          <p className="font-bold text-base truncate">{fixture.homeTeam} vs {fixture.awayTeam}</p>
          <p className="text-sm text-giga-muted">
            <FixedDateTime date={fixture.kickoff} /> · {fixture.venue}
          </p>
        </div>
      </div>
      {channel && (
        <Link
          href={`/watch?id=${channel.id}`}
          className="shrink-0 rounded-xl bg-gtv-purple/10 px-4 py-2.5 text-sm font-bold text-gtv-purple hover:bg-gtv-purple/20 min-h-[44px] flex items-center"
        >
          {channel.logo} {channel.name}
        </Link>
      )}
    </div>
  );
}

export function LiveMatchTracker({ compact = false }: { compact?: boolean }) {
  const [tick, setTick] = useState(0);
  const liveFixtures = getLiveFixtures();
  const upcoming = getUpcomingFixtures().slice(0, compact ? 3 : 5);

  useEffect(() => {
    if (liveFixtures.length === 0) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [liveFixtures.length]);

  if (liveFixtures.length === 0 && upcoming.length === 0) return null;

  return (
    <section className={cn(!compact && "mb-10")}>
      {!compact && (
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-[1.65rem] font-extrabold sm:text-3xl">Live Match Tracker</h2>
            <p className="mt-2 text-base text-giga-muted">Real-time scores with official watch links</p>
          </div>
          <Link href="/sports" className="text-base font-bold text-gtv-purple hover:underline shrink-0">
            Sports Center →
          </Link>
        </div>
      )}

      {liveFixtures.length > 0 && (
        <div className={cn("grid gap-4", compact ? "grid-cols-1" : "sm:grid-cols-2")}>
          {liveFixtures.map((f) => (
            <LiveFixtureRow key={f.id} fixture={f} tick={tick} />
          ))}
        </div>
      )}

      {upcoming.length > 0 && (
        <div className={cn(liveFixtures.length > 0 && "mt-6")}>
          {!compact && <h3 className="mb-3 font-display text-lg font-bold">Upcoming Fixtures</h3>}
          <div className="space-y-2">
            {upcoming.map((f) => (
              <UpcomingRow key={f.id} fixture={f} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
