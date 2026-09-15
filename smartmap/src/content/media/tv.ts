import type { TvStation, MovieChannel } from "@/types/media";

/** Official broadcaster links only — view in GigaTrend TV Browser at /watch */
export const TV_STATIONS: TvStation[] = [
  { id: "gtv", name: "GTV Ghana", country: "Ghana", category: "Ghana TV", logo: "📺", streamUrl: "https://www.gbcghana.com/gtv-live", isLive: true, officialSource: "Ghana Broadcasting Corporation", channelType: "news" },
  { id: "tv3", name: "TV3 Ghana", country: "Ghana", category: "Ghana TV", logo: "📡", streamUrl: "https://www.tv3network.com/live", isLive: true, officialSource: "Media General Ghana", channelType: "news" },
  { id: "nta", name: "NTA Nigeria", country: "Nigeria", category: "Nigeria TV", logo: "🇳🇬", streamUrl: "https://www.nta.ng/live", isLive: true, officialSource: "Nigerian Television Authority", channelType: "news" },
  { id: "channels", name: "Channels TV", country: "Nigeria", category: "Nigeria TV", logo: "📺", streamUrl: "https://www.channelstv.com/live", isLive: true, officialSource: "Channels Media Group", channelType: "news" },
  { id: "citizen", name: "Citizen TV", country: "Kenya", category: "Kenya TV", logo: "🇰🇪", streamUrl: "https://www.citizentv.co.ke/live", isLive: true, officialSource: "Royal Media Services", channelType: "news" },
  { id: "sabc", name: "SABC News", country: "South Africa", category: "South Africa TV", logo: "🇿🇦", streamUrl: "https://www.sabcnews.com/sabcnews/live", isLive: true, officialSource: "South African Broadcasting Corporation", channelType: "news" },
  { id: "bbc", name: "BBC News", country: "UK", category: "International News", logo: "🌐", streamUrl: "https://www.bbc.com/news/live", embedUrl: "https://www.bbc.com/news", isLive: true, officialSource: "BBC", channelType: "news" },
  { id: "cnn", name: "CNN International", country: "USA", category: "International News", logo: "🌍", streamUrl: "https://edition.cnn.com/videos/live", isLive: true, officialSource: "CNN", channelType: "news" },
  { id: "supersport", name: "SuperSport", country: "South Africa", category: "Sports", logo: "⚽", streamUrl: "https://www.supersport.com", isLive: true, officialSource: "SuperSport", channelType: "sports" },
  { id: "espn", name: "ESPN Africa", country: "Pan-Africa", category: "Sports", logo: "🏆", streamUrl: "https://www.espn.com/soccer/", isLive: true, officialSource: "ESPN", channelType: "sports" },
  { id: "mtvbase", name: "MTV Base Africa", country: "Pan-Africa", category: "Entertainment", logo: "🎵", streamUrl: "https://www.mtvbase.com", isLive: false, officialSource: "Paramount Africa", channelType: "entertainment" },
  { id: "cnbcafrica", name: "CNBC Africa", country: "Pan-Africa", category: "Business", logo: "💼", streamUrl: "https://www.cnbcafrica.com/live", isLive: true, officialSource: "CNBC Africa", channelType: "business" },
];

export const MOVIE_CHANNELS: MovieChannel[] = [
  { id: "showmax", name: "Showmax", country: "Pan-Africa", logo: "🎬", streamUrl: "https://www.showmax.com", genre: "Movies & Series", officialSource: "MultiChoice", isLive: true },
  { id: "africamagic", name: "Africa Magic", country: "Pan-Africa", logo: "🎭", streamUrl: "https://www.dstv.com/africamagic", genre: "Nollywood & African Films", officialSource: "MultiChoice", isLive: true },
  { id: "netflix-africa", name: "Netflix", country: "Global", logo: "🍿", streamUrl: "https://www.netflix.com/browse/genre/83", genre: "Movies & Series", officialSource: "Netflix", isLive: true },
  { id: "irokotv", name: "IROKOtv", country: "Nigeria", logo: "📽️", streamUrl: "https://www.irokotv.com", genre: "Nollywood Movies", officialSource: "IROKO Partners", isLive: true },
  { id: "zeeworld", name: "Zee World", country: "Pan-Africa", logo: "✨", streamUrl: "https://www.zee5.com/global", genre: "Drama & Movies", officialSource: "Zee Entertainment", isLive: true },
  { id: "filmone", name: "FilmOne+", country: "Nigeria", logo: "🎞️", streamUrl: "https://www.filmone.ng", genre: "Cinema & Streaming", officialSource: "FilmOne Entertainment", isLive: true },
  { id: "canalplus", name: "CANAL+ Afrique", country: "Francophone Africa", logo: "📡", streamUrl: "https://www.canalplus.com", genre: "Movies & Sports", officialSource: "CANAL+", isLive: true },
  { id: "dstv-movies", name: "DStv Movies", country: "Pan-Africa", logo: "🌟", streamUrl: "https://www.dstv.com/channels/m-net-movies", genre: "Hollywood & African Cinema", officialSource: "MultiChoice", isLive: true },
];

export const TV_CATEGORIES = [
  "Ghana TV",
  "Nigeria TV",
  "Kenya TV",
  "South Africa TV",
  "International News",
  "Sports",
  "Movies & Cinema",
  "Entertainment",
  "Business",
] as const;

export function getTvByCategory(category: string): TvStation[] {
  if (category === "Movies & Cinema") return [];
  return TV_STATIONS.filter((s) => s.category === category);
}

export function getMovieChannels(): MovieChannel[] {
  return MOVIE_CHANNELS;
}

export function getTvStationById(id: string): TvStation | undefined {
  return TV_STATIONS.find((s) => s.id === id);
}

export function getMovieChannelById(id: string): MovieChannel | undefined {
  return MOVIE_CHANNELS.find((m) => m.id === id);
}

export function getAllWatchableChannels(): { id: string; name: string; logo: string; url: string; category: string; type: "tv" | "movie" }[] {
  const tv = TV_STATIONS.map((s) => ({
    id: s.id,
    name: s.name,
    logo: s.logo,
    url: s.embedUrl ?? s.streamUrl,
    category: s.category,
    type: "tv" as const,
  }));
  const movies = MOVIE_CHANNELS.map((m) => ({
    id: m.id,
    name: m.name,
    logo: m.logo,
    url: m.streamUrl,
    category: "Movies & Cinema",
    type: "movie" as const,
  }));
  return [...tv, ...movies];
}
