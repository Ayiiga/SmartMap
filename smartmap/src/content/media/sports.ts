import type { SportsFixture, SportsLeague } from "@/types/media";

export const SPORTS_LEAGUES: { id: SportsLeague; name: string; icon: string }[] = [
  { id: "world-cup-2026", name: "FIFA World Cup 2026", icon: "🏆" },
  { id: "premier-league", name: "Premier League", icon: "⚽" },
  { id: "champions-league", name: "Champions League", icon: "⭐" },
  { id: "afcon", name: "AFCON", icon: "🌍" },
  { id: "ghana-premier-league", name: "Ghana Premier League", icon: "🇬🇭" },
];

export const SPORTS_FIXTURES: SportsFixture[] = [
  {
    id: "f1",
    league: "world-cup-2026",
    homeTeam: "Ghana",
    awayTeam: "Portugal",
    kickoff: "2026-06-15T18:00:00Z",
    venue: "MetLife Stadium, USA",
    status: "scheduled",
    watchChannelId: "supersport",
  },
  {
    id: "f2",
    league: "world-cup-2026",
    homeTeam: "Nigeria",
    awayTeam: "France",
    kickoff: "2026-06-18T20:00:00Z",
    venue: "SoFi Stadium, USA",
    status: "scheduled",
    watchChannelId: "supersport",
  },
  {
    id: "f3",
    league: "premier-league",
    homeTeam: "Arsenal",
    awayTeam: "Chelsea",
    homeScore: 2,
    awayScore: 1,
    kickoff: "2026-07-10T15:00:00Z",
    venue: "Emirates Stadium",
    status: "finished",
    watchChannelId: "espn",
  },
  {
    id: "f4",
    league: "premier-league",
    homeTeam: "Liverpool",
    awayTeam: "Man City",
    homeScore: 1,
    awayScore: 1,
    kickoff: "2026-07-10T17:30:00Z",
    venue: "Anfield",
    status: "live",
    minute: 67,
    watchChannelId: "supersport",
  },
  {
    id: "f5",
    league: "champions-league",
    homeTeam: "Real Madrid",
    awayTeam: "Bayern Munich",
    kickoff: "2026-07-15T19:00:00Z",
    venue: "Santiago Bernabéu",
    status: "scheduled",
    watchChannelId: "espn",
  },
  {
    id: "f6",
    league: "afcon",
    homeTeam: "Morocco",
    awayTeam: "Senegal",
    homeScore: 3,
    awayScore: 2,
    kickoff: "2026-07-09T20:00:00Z",
    venue: "Stade Mohammed V",
    status: "finished",
    watchChannelId: "supersport",
  },
  {
    id: "f7",
    league: "ghana-premier-league",
    homeTeam: "Hearts of Oak",
    awayTeam: "Asante Kotoko",
    kickoff: "2026-07-12T16:00:00Z",
    venue: "Accra Sports Stadium",
    status: "scheduled",
    watchChannelId: "gtv",
  },
  {
    id: "f8",
    league: "premier-league",
    homeTeam: "Man United",
    awayTeam: "Tottenham",
    homeScore: 0,
    awayScore: 0,
    kickoff: "2026-07-10T20:00:00Z",
    venue: "Old Trafford",
    status: "live",
    minute: 23,
    watchChannelId: "espn",
  },
];

export const LEAGUE_STANDINGS: Record<SportsLeague, { team: string; played: number; points: number }[]> = {
  "premier-league": [
    { team: "Arsenal", played: 38, points: 89 },
    { team: "Liverpool", played: 38, points: 82 },
    { team: "Man City", played: 38, points: 80 },
    { team: "Chelsea", played: 38, points: 71 },
  ],
  "champions-league": [
    { team: "Real Madrid", played: 6, points: 15 },
    { team: "Bayern Munich", played: 6, points: 13 },
    { team: "Barcelona", played: 6, points: 12 },
  ],
  "world-cup-2026": [
    { team: "France", played: 0, points: 0 },
    { team: "Ghana", played: 0, points: 0 },
    { team: "Portugal", played: 0, points: 0 },
  ],
  afcon: [
    { team: "Morocco", played: 3, points: 7 },
    { team: "Senegal", played: 3, points: 6 },
    { team: "Nigeria", played: 3, points: 4 },
  ],
  "ghana-premier-league": [
    { team: "Asante Kotoko", played: 30, points: 58 },
    { team: "Hearts of Oak", played: 30, points: 55 },
    { team: "Medeama SC", played: 30, points: 48 },
  ],
};

export function getFixturesByLeague(league: SportsLeague): SportsFixture[] {
  return SPORTS_FIXTURES.filter((f) => f.league === league);
}

export function getLiveFixtures(): SportsFixture[] {
  return SPORTS_FIXTURES.filter((f) => f.status === "live");
}

export function getUpcomingFixtures(): SportsFixture[] {
  return SPORTS_FIXTURES.filter((f) => f.status === "scheduled");
}

export function getFixtureById(id: string): SportsFixture | undefined {
  return SPORTS_FIXTURES.find((f) => f.id === id);
}
