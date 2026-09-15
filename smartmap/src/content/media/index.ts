import { NEWS_ARTICLES, getArticleBySlug, getArticlesByCategory, getBreakingNews, getAfricaNews, getHeroArticles } from "./articles";
import { RADIO_STATIONS, RADIO_COUNTRIES, getRadioByCountry } from "./radio";
import { SPORTS_FIXTURES, SPORTS_LEAGUES, LEAGUE_STANDINGS, getFixturesByLeague, getLiveFixtures, getUpcomingFixtures, getFixtureById } from "./sports";
import { TV_STATIONS, TV_CATEGORIES, MOVIE_CHANNELS, getTvByCategory, getMovieChannels, getTvStationById, getMovieChannelById, getAllWatchableChannels } from "./tv";
import {
  TRENDING_HASHTAGS,
  TRENDING_SEARCHES,
  TRENDING_STORIES,
  TRENDING_VIDEOS,
  VIRAL_PEOPLE,
  VIRAL_TOPICS,
} from "./trending";
import { VIDEO_NEWS, getTrendingVideos } from "./videos";

export {
  NEWS_ARTICLES,
  getArticleBySlug,
  getArticlesByCategory,
  getBreakingNews,
  getAfricaNews,
  getHeroArticles,
  RADIO_STATIONS,
  getRadioByCountry,
  RADIO_COUNTRIES,
  SPORTS_FIXTURES,
  SPORTS_LEAGUES,
  LEAGUE_STANDINGS,
  getFixturesByLeague,
  getLiveFixtures,
  getUpcomingFixtures,
  getFixtureById,
  TV_STATIONS,
  TV_CATEGORIES,
  MOVIE_CHANNELS,
  getTvByCategory,
  getMovieChannels,
  getTvStationById,
  getMovieChannelById,
  getAllWatchableChannels,
  TRENDING_HASHTAGS,
  TRENDING_SEARCHES,
  TRENDING_STORIES,
  TRENDING_VIDEOS,
  VIRAL_PEOPLE,
  VIRAL_TOPICS,
  VIDEO_NEWS,
  getTrendingVideos,
};

export type SearchResultType =
  | "article"
  | "video"
  | "tv"
  | "radio"
  | "team"
  | "player"
  | "country"
  | "competition"
  | "topic";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  href: string;
}

export type SearchFilter = "all" | SearchResultType;

const AFRICA_COUNTRIES = [
  { id: "ghana", name: "Ghana", href: "/africa#ghana" },
  { id: "nigeria", name: "Nigeria", href: "/africa#nigeria" },
  { id: "kenya", name: "Kenya", href: "/africa#kenya" },
  { id: "south-africa", name: "South Africa", href: "/africa#south-africa" },
  { id: "egypt", name: "Egypt", href: "/africa#egypt" },
  { id: "morocco", name: "Morocco", href: "/africa#morocco" },
  { id: "ethiopia", name: "Ethiopia", href: "/africa#ethiopia" },
  { id: "rwanda", name: "Rwanda", href: "/africa#rwanda" },
  { id: "uganda", name: "Uganda", href: "/africa#uganda" },
];

const SPORTS_PLAYERS = [
  { id: "p1", name: "Mohamed Salah", team: "Egypt", href: "/sports" },
  { id: "p2", name: "Victor Osimhen", team: "Nigeria", href: "/sports" },
  { id: "p3", name: "Sadio Mané", team: "Senegal", href: "/sports" },
  { id: "p4", name: "Mohammed Kudus", team: "Ghana", href: "/sports" },
  { id: "p5", name: "Achraf Hakimi", team: "Morocco", href: "/sports" },
];

export function globalSearch(query: string, filter: SearchFilter = "all"): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results: SearchResult[] = [];
  const include = (type: SearchResultType) => filter === "all" || filter === type;

  if (include("article")) {
    for (const article of NEWS_ARTICLES) {
      if (
        article.title.toLowerCase().includes(q) ||
        article.summary.toLowerCase().includes(q) ||
        article.category.includes(q) ||
        article.tags.some((t) => t.toLowerCase().includes(q)) ||
        (article.country && article.country.includes(q))
      ) {
        results.push({
          id: article.id,
          type: "article",
          title: article.title,
          subtitle: article.category,
          href: `/news/${article.slug}`,
        });
      }
    }
  }

  if (include("video")) {
    for (const video of VIDEO_NEWS) {
      if (video.title.toLowerCase().includes(q) || video.category.includes(q)) {
        results.push({
          id: video.id,
          type: "video",
          title: video.title,
          subtitle: video.duration,
          href: `/videos#${video.slug}`,
        });
      }
    }
  }

  if (include("tv")) {
    for (const station of TV_STATIONS) {
      if (
        station.name.toLowerCase().includes(q) ||
        station.country.toLowerCase().includes(q) ||
        station.category.toLowerCase().includes(q)
      ) {
        results.push({
          id: station.id,
          type: "tv",
          title: station.name,
          subtitle: station.country,
          href: `/live-tv#${station.id}`,
        });
      }
    }
  }

  if (include("radio")) {
    for (const radio of RADIO_STATIONS) {
      if (radio.name.toLowerCase().includes(q) || radio.country.toLowerCase().includes(q)) {
        results.push({
          id: radio.id,
          type: "radio",
          title: radio.name,
          subtitle: radio.country,
          href: `/live-radio#${radio.id}`,
        });
      }
    }
  }

  if (include("team") || include("competition")) {
    for (const fixture of SPORTS_FIXTURES) {
      if (fixture.homeTeam.toLowerCase().includes(q) || fixture.awayTeam.toLowerCase().includes(q)) {
        results.push({
          id: fixture.id,
          type: "team",
          title: `${fixture.homeTeam} vs ${fixture.awayTeam}`,
          subtitle: fixture.league,
          href: "/sports",
        });
      }
    }

    for (const league of SPORTS_LEAGUES) {
      if (league.name.toLowerCase().includes(q) || league.id.includes(q)) {
        results.push({
          id: league.id,
          type: "competition",
          title: league.name,
          subtitle: "Competition",
          href: league.id === "world-cup-2026" ? "/world-cup-2026" : "/sports",
        });
      }
    }
  }

  if (include("player")) {
    for (const player of SPORTS_PLAYERS) {
      if (player.name.toLowerCase().includes(q) || player.team.toLowerCase().includes(q)) {
        results.push({
          id: player.id,
          type: "player",
          title: player.name,
          subtitle: player.team,
          href: player.href,
        });
      }
    }
  }

  if (include("country")) {
    for (const country of AFRICA_COUNTRIES) {
      if (country.name.toLowerCase().includes(q) || country.id.includes(q)) {
        results.push({
          id: country.id,
          type: "country",
          title: country.name,
          subtitle: "Africa",
          href: country.href,
        });
      }
    }
  }

  if (include("topic")) {
    for (const topic of VIRAL_TOPICS) {
      if (topic.label.toLowerCase().includes(q)) {
        results.push({
          id: topic.id,
          type: "topic",
          title: topic.label,
          subtitle: "Trending topic",
          href: "/trending",
        });
      }
    }
    for (const tag of TRENDING_HASHTAGS) {
      if (tag.label.toLowerCase().includes(q)) {
        results.push({
          id: tag.id,
          type: "topic",
          title: tag.label,
          subtitle: "Hashtag",
          href: "/trending",
        });
      }
    }
  }

  return results.slice(0, 20);
}

export function getSearchSuggestions(): string[] {
  return TRENDING_SEARCHES.map((s) => s.label);
}
