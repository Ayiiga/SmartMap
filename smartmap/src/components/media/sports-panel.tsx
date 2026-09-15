"use client";

import Link from "next/link";
import { Tv } from "lucide-react";
import type { SportsFixture } from "@/types/media";
import { getTvStationById } from "@/content/media";
import { GlassCard } from "@/components/ui/glass-card";
import { LiveIndicator } from "@/components/media/trending-panel";
import { FixedDateTime } from "@/components/ui/relative-time";
import { cn } from "@/lib/utils";

export function FixtureCard({ fixture }: { fixture: SportsFixture }) {
  const channel = fixture.watchChannelId ? getTvStationById(fixture.watchChannelId) : null;

  return (
    <GlassCard className={cn("text-center p-5", fixture.status === "live" && "border-gtv-red/30 bg-gtv-red/5")}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-base font-extrabold sm:text-lg">{fixture.homeTeam}</p>
          {fixture.homeScore !== undefined && (
            <p className="font-display text-3xl font-extrabold text-gtv-purple">{fixture.homeScore}</p>
          )}
        </div>
        <div className="shrink-0">
          {fixture.status === "live" ? (
            <div className="flex flex-col items-center gap-1">
              <LiveIndicator />
              {fixture.minute !== undefined && (
                <span className="text-sm font-bold text-gtv-red">{fixture.minute}&apos;</span>
              )}
            </div>
          ) : fixture.status === "finished" ? (
            <span className="text-sm font-bold text-giga-muted">FT</span>
          ) : (
            <span className="text-sm font-semibold text-giga-muted">
            <FixedDateTime date={fixture.kickoff} pattern="MMM d · HH:mm" />
            </span>
          )}
          {fixture.status !== "scheduled" && fixture.homeScore !== undefined && (
            <p className="mt-1 font-display text-lg font-bold text-giga-muted">vs</p>
          )}
        </div>
        <div className="flex-1">
          <p className="text-base font-extrabold sm:text-lg">{fixture.awayTeam}</p>
          {fixture.awayScore !== undefined && (
            <p className="font-display text-3xl font-extrabold text-gtv-purple">{fixture.awayScore}</p>
          )}
        </div>
      </div>
      <p className="mt-3 text-sm text-giga-muted">{fixture.venue}</p>
      {channel && (
        <Link
          href={`/watch?id=${channel.id}&match=${fixture.id}`}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gtv-purple/10 px-4 py-2.5 text-sm font-bold text-gtv-purple hover:bg-gtv-purple/20 min-h-[44px]"
        >
          <Tv className="h-4 w-4" />
          Watch on {channel.name}
        </Link>
      )}
    </GlassCard>
  );
}

export function StandingsTable({
  standings,
  title,
}: {
  standings: { team: string; played: number; points: number }[];
  title: string;
}) {
  return (
    <GlassCard className="p-5">
      <h3 className="font-display mb-4 text-lg font-extrabold">{title}</h3>
      <table className="w-full text-base">
        <thead>
          <tr className="border-b border-giga-border text-left text-giga-muted">
            <th className="pb-2 font-semibold">#</th>
            <th className="pb-2 font-semibold">Team</th>
            <th className="pb-2 font-semibold text-center">P</th>
            <th className="pb-2 font-semibold text-right">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, i) => (
            <tr key={row.team} className={cn("border-b border-giga-border/50", i < 3 && "font-semibold")}>
              <td className="py-2.5">{i + 1}</td>
              <td className="py-2.5">{row.team}</td>
              <td className="py-2.5 text-center">{row.played}</td>
              <td className="py-2.5 text-right text-gtv-purple font-bold">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </GlassCard>
  );
}
