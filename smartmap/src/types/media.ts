export type NewsCategory =
  | "breaking"
  | "politics"
  | "sports"
  | "technology"
  | "entertainment"
  | "business"
  | "africa"
  | "world"
  | "health"
  | "science"
  | "environment";

export type AfricaCountry =
  | "ghana"
  | "nigeria"
  | "kenya"
  | "south-africa"
  | "egypt"
  | "morocco"
  | "ethiopia"
  | "rwanda"
  | "uganda";

export type SportsLeague =
  | "world-cup-2026"
  | "premier-league"
  | "champions-league"
  | "afcon"
  | "ghana-premier-league";

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: NewsCategory;
  country?: AfricaCountry;
  imageUrl: string;
  publishedAt: string;
  author: string;
  readMinutes: number;
  isBreaking?: boolean;
  aiSummary30s: string;
  aiSummary2m: string;
  aiSummaryFull: string;
  /** Full article body paragraphs for on-site reading */
  body: string[];
  keyPoints: string[];
  timeline: { time: string; event: string }[];
  tags: string[];
}

export interface VideoItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: NewsCategory;
  thumbnailUrl: string;
  duration: string;
  publishedAt: string;
  views: number;
  isTrending?: boolean;
}

export interface TvStation {
  id: string;
  name: string;
  country: string;
  category: string;
  logo: string;
  streamUrl: string;
  isLive: boolean;
  officialSource: string;
  /** Optional embed-friendly URL when broadcaster allows in-app viewing */
  embedUrl?: string;
  channelType?: "news" | "sports" | "movies" | "entertainment" | "business";
}

export interface MovieChannel {
  id: string;
  name: string;
  country: string;
  logo: string;
  streamUrl: string;
  genre: string;
  officialSource: string;
  isLive: boolean;
}

export interface RadioStation {
  id: string;
  name: string;
  country: string;
  genre: string;
  streamUrl: string;
  logo: string;
}

export interface SportsFixture {
  id: string;
  league: SportsLeague;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  kickoff: string;
  venue: string;
  status: "scheduled" | "live" | "finished";
  /** Match minute when live */
  minute?: number;
  /** TV channel id to watch this match officially */
  watchChannelId?: string;
}

export interface TrendingItem {
  id: string;
  label: string;
  type: "story" | "video" | "hashtag" | "search" | "topic" | "person";
  count?: number;
  change?: "up" | "down" | "new";
}

export interface UserMediaPreferences {
  savedArticles: string[];
  watchHistory: string[];
  favoriteTvStations: string[];
  favoriteRadioStations: string[];
  followedTopics: string[];
  followedJournalists: string[];
  searchHistory: string[];
  recentChannels: string[];
  language: string;
  notifications: {
    breakingNews: boolean;
    sports: boolean;
    liveMatches: boolean;
    trending: boolean;
    aiRecommendations: boolean;
  };
}
