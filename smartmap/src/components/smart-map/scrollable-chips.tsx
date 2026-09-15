"use client";

import { cn } from "@/lib/utils";

interface Chip {
  id: string;
  label: string;
  emoji?: string;
}

interface ScrollableChipsProps {
  chips: Chip[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function ScrollableChips({ chips, activeId, onSelect, className }: ScrollableChipsProps) {
  return (
    <div className={cn("relative", className)}>
      <div
        className="flex gap-2 overflow-x-auto pb-1 pr-10 scrollbar-none"
        role="tablist"
        aria-label="Category filters"
      >
        {chips.map((chip) => {
          const active = activeId === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(chip.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors min-h-[44px]",
                active
                  ? "bg-gradient-to-r from-[#3B82F6] to-[#1E5EB8] text-white"
                  : "bg-[#141C2F] text-[#94A3B8] hover:text-white border border-[#1E293B]",
              )}
            >
              {chip.emoji ? `${chip.emoji} ` : ""}{chip.label}
            </button>
          );
        })}
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#0A0F1E] via-[#0A0F1E]/80 to-transparent"
        aria-hidden
      />
    </div>
  );
}
