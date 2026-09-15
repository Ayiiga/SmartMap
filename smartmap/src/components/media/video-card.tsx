import Image from "next/image";
import Link from "next/link";
import { Play, Eye } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import type { VideoItem } from "@/types/media";
import { RelativeTime } from "@/components/ui/relative-time";

export function VideoCard({ video }: { video: VideoItem }) {
  return (
    <GlassCard hover className="overflow-hidden p-0">
      <Link href={`/videos#${video.slug}`} className="group block">
        <div className="relative h-48 sm:h-44 overflow-hidden">
          <Image src={video.thumbnailUrl} alt="" fill className="object-cover transition-transform group-hover:scale-105" sizes="320px" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
            <Play className="h-14 w-14 text-white" fill="white" strokeWidth={1.5} />
          </div>
          <span className="absolute bottom-3 right-3 rounded-lg bg-black/75 px-2.5 py-1 text-sm font-bold text-white">
            {video.duration}
          </span>
          {video.isTrending && (
            <span className="absolute top-3 left-3 rounded-full bg-gtv-gold px-3 py-1 text-xs font-bold uppercase text-gtv-deep">
              Trending
            </span>
          )}
        </div>
        <div className="p-5">
          <h3 className="font-bold text-base leading-snug line-clamp-2 group-hover:text-gtv-purple sm:text-lg">{video.title}</h3>
          <div className="mt-3 flex items-center gap-3 text-sm font-medium text-giga-muted">
            <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" strokeWidth={2.25} />{(video.views / 1000).toFixed(0)}k views</span>
            <RelativeTime date={video.publishedAt} />
          </div>
        </div>
      </Link>
    </GlassCard>
  );
}
