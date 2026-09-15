"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChannelBrowser } from "@/components/media/channel-browser";

function WatchContent() {
  const searchParams = useSearchParams();
  const channelId = searchParams.get("id") ?? undefined;
  const url = searchParams.get("url") ?? undefined;

  return <ChannelBrowser initialChannelId={channelId} initialUrl={url ?? undefined} />;
}

export default function WatchPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-gtv-deep text-white">Loading browser...</div>}>
      <WatchContent />
    </Suspense>
  );
}
