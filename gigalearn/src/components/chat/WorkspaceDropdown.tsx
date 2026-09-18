"use client";

import { useState } from "react";
import { LayoutGrid, Share2, X } from "lucide-react";
import {
  WORKSPACE_TABS,
  filterWorkspaceCards,
  type WorkspaceTabId,
} from "@/lib/ai/giga3";
import { cn } from "@/lib/utils";

interface WorkspaceDropdownProps {
  activeTab: WorkspaceTabId;
  onTabChange: (tab: WorkspaceTabId) => void;
  onShare: () => void;
}

/**
 * Top-right workspace menu. Deliberately NOT a duplicate of the drawer list:
 * it exposes workspace tools (tabs + filtered cards) and Share conversation
 * only, all driven by the same single source of truth (`lib/ai/giga3.ts`).
 */
export function WorkspaceDropdown({ activeTab, onTabChange, onShare }: WorkspaceDropdownProps) {
  const [open, setOpen] = useState(false);
  const cards = filterWorkspaceCards(activeTab);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Workspace tools"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#374151]"
      >
        {open ? <X className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-30 w-[300px] max-w-[85vw] rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-3 shadow-lg">
          <p className="px-1 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
            Workspace tools
          </p>
          <div className="scrollbar-none flex gap-1 overflow-x-auto rounded-full bg-[#F3F4F6] p-1">
            {WORKSPACE_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onTabChange(t.id)}
                aria-pressed={activeTab === t.id}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 text-[12px] font-semibold",
                  activeTab === t.id ? "bg-[#EAB308] font-bold text-black" : "text-[#374151]",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <ul className="mt-2 max-h-[40dvh] space-y-1 overflow-y-auto">
            {cards.slice(0, 6).map((card) => (
              <li
                key={card.id}
                className="flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-[13px] text-black hover:bg-[#F3F4F6]"
              >
                <span className="truncate font-semibold">{card.title}</span>
                <span className="shrink-0 rounded bg-[#7C3AED] px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {card.badge}
                </span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              onShare();
              setOpen(false);
            }}
            className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-[#E5E7EB] text-[13px] font-bold text-[#374151]"
          >
            <Share2 className="h-4 w-4" /> Share conversation
          </button>
        </div>
      )}
    </div>
  );
}
