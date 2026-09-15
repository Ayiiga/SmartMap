import type { VideoItem } from "@/types/media";

const local = (file: string) => `/images/news/${file}`;

export const VIDEO_NEWS: VideoItem[] = [
  {
    id: "v1",
    slug: "world-cup-squad-announcement",
    title: "World Cup 2026 Squad Announcement",
    summary: "National teams reveal final squads ahead of the tournament.",
    category: "sports",
    thumbnailUrl: local("sports.jpg"),
    duration: "12:34",
    publishedAt: "2026-07-10T16:00:00Z",
    views: 89000,
    isTrending: true,
  },
  {
    id: "v2",
    slug: "ghana-parliament-session",
    title: "Ghana Parliament Session Highlights",
    summary: "Key moments from today's parliamentary debate on economic reforms.",
    category: "politics",
    thumbnailUrl: local("politics.jpg"),
    duration: "8:15",
    publishedAt: "2026-07-10T14:00:00Z",
    views: 45000,
    isTrending: true,
  },
  {
    id: "v3",
    slug: "nigeria-tech-summit",
    title: "Lagos Tech Summit 2026 Keynote",
    summary: "Industry leaders discuss Africa's fintech and AI future.",
    category: "technology",
    thumbnailUrl: local("technology.jpg"),
    duration: "22:08",
    publishedAt: "2026-07-10T12:00:00Z",
    views: 32000,
  },
  {
    id: "v4",
    slug: "afcon-press-conference",
    title: "AFCON 2027 Press Conference",
    summary: "CAF officials announce host city infrastructure updates.",
    category: "sports",
    thumbnailUrl: local("sports.jpg"),
    duration: "15:42",
    publishedAt: "2026-07-09T18:00:00Z",
    views: 28000,
  },
  {
    id: "v5",
    slug: "kenya-renewable-energy",
    title: "Kenya's Renewable Energy Revolution",
    summary: "Documentary on geothermal and wind power expansion.",
    category: "science",
    thumbnailUrl: local("science.jpg"),
    duration: "18:30",
    publishedAt: "2026-07-09T16:00:00Z",
    views: 21000,
  },
  {
    id: "v6",
    slug: "nollywood-premiere",
    title: "Nollywood Premiere Night",
    summary: "Red carpet highlights from Lagos streaming platform launch.",
    category: "entertainment",
    thumbnailUrl: local("entertainment.jpg"),
    duration: "6:55",
    publishedAt: "2026-07-09T14:00:00Z",
    views: 67000,
    isTrending: true,
  },
];

export function getTrendingVideos(): VideoItem[] {
  return VIDEO_NEWS.filter((v) => v.isTrending);
}
