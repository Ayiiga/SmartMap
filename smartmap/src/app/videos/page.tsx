import type { Metadata } from "next";
import { MediaPageShell, SectionHeader } from "@/components/media/section-header";
import { VideoCard } from "@/components/media/video-card";
import { VIDEO_NEWS, getTrendingVideos } from "@/content/media";

export const metadata: Metadata = {
  title: "Video News",
  description: "Latest videos, trending clips, interviews, and sports highlights.",
};

export default function VideosPage() {
  const trending = getTrendingVideos();

  return (
    <MediaPageShell title="Video News" subtitle="Latest videos, interviews, press conferences, and highlights">
      <SectionHeader title="Trending Videos" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
        {trending.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>

      <SectionHeader title="Latest Videos" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {VIDEO_NEWS.map((video) => (
          <div key={video.id} id={video.slug}>
            <VideoCard video={video} />
          </div>
        ))}
      </div>
    </MediaPageShell>
  );
}
