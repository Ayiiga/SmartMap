"use client";

export function MapLoadingSkeleton() {
  return (
    <div
      className="absolute inset-0 z-10 flex flex-col bg-[#0A0F1E]"
      role="status"
      aria-label="Loading map"
      aria-busy="true"
    >
      {/* Shimmer map grid */}
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 sm-shimmer opacity-40" />
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-px opacity-20">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="border border-[#1E293B]/50" />
          ))}
        </div>
        {/* Fake road lines */}
        <svg className="absolute inset-0 h-full w-full opacity-15" aria-hidden>
          <line x1="10%" y1="30%" x2="90%" y2="45%" stroke="#3B82F6" strokeWidth="2" />
          <line x1="20%" y1="60%" x2="80%" y2="70%" stroke="#1E293B" strokeWidth="3" />
          <line x1="40%" y1="10%" x2="55%" y2="90%" stroke="#1E293B" strokeWidth="2" />
        </svg>
        {/* Center pin skeleton */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="h-10 w-10 animate-pulse rounded-full bg-[#3B82F6]/30" />
          <div className="mx-auto mt-1 h-3 w-3 rounded-full bg-[#3B82F6]/50" />
        </div>
      </div>

      {/* Bottom card skeleton */}
      <div className="border-t border-[#1E293B] bg-[#141C2F] px-4 py-4">
        <div className="flex gap-3">
          <div className="h-10 flex-1 animate-pulse rounded-xl bg-[#1E293B]" />
          <div className="h-10 w-10 animate-pulse rounded-xl bg-[#1E293B]" />
        </div>
        <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-[#1E293B]" />
        <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-[#1E293B]/70" />
      </div>

      <p className="absolute left-1/2 top-8 -translate-x-1/2 font-display text-sm font-bold text-white/80">
        Loading Smart Map…
      </p>
    </div>
  );
}
