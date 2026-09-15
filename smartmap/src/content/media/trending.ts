import type { TrendingItem } from "@/types/media";

export const TRENDING_STORIES: TrendingItem[] = [
  { id: "t1", label: "Ghana Economic Reform Bill", type: "story", count: 12400, change: "up" },
  { id: "t2", label: "World Cup 2026 African Teams", type: "story", count: 9800, change: "up" },
  { id: "t3", label: "Nigeria Startup Funding Record", type: "story", count: 7600, change: "new" },
  { id: "t4", label: "Kenya Renewable Energy 90%", type: "story", count: 5400, change: "up" },
];

export const TRENDING_VIDEOS: TrendingItem[] = [
  { id: "v1", label: "World Cup 2026 Squad Announcement", type: "video", count: 89000, change: "up" },
  { id: "v2", label: "CAF Press Conference Highlights", type: "video", count: 45000, change: "new" },
  { id: "v3", label: "Tech Summit Keynote", type: "video", count: 32000, change: "up" },
];

export const TRENDING_HASHTAGS: TrendingItem[] = [
  { id: "h1", label: "#WorldCup2026", type: "hashtag", count: 156000, change: "up" },
  { id: "h2", label: "#GhanaNews", type: "hashtag", count: 89000, change: "up" },
  { id: "h3", label: "#AFCON2027", type: "hashtag", count: 67000, change: "new" },
  { id: "h4", label: "#Nollywood", type: "hashtag", count: 45000, change: "up" },
  { id: "h5", label: "#AfricanTech", type: "hashtag", count: 38000, change: "up" },
];

export const TRENDING_SEARCHES: TrendingItem[] = [
  { id: "s1", label: "Ghana parliament vote", type: "search", change: "up" },
  { id: "s2", label: "Premier League results", type: "search", change: "up" },
  { id: "s3", label: "Bitcoin price today", type: "search", change: "new" },
  { id: "s4", label: "Live TV Ghana", type: "search", change: "up" },
];

export const VIRAL_TOPICS: TrendingItem[] = [
  { id: "tp1", label: "FIFA World Cup 2026", type: "topic", change: "up" },
  { id: "tp2", label: "African Fintech Boom", type: "topic", change: "new" },
  { id: "tp3", label: "Climate & Energy", type: "topic", change: "up" },
];

export const VIRAL_PEOPLE: TrendingItem[] = [
  { id: "p1", label: "Kwame Asante", type: "person", change: "up" },
  { id: "p2", label: "Ama Mensah", type: "person", change: "new" },
  { id: "p3", label: "Chidi Okonkwo", type: "person", change: "up" },
];
