"use client";

import Link from "next/link";
import { useState } from "react";
import { LayoutDashboard, LifeBuoy, Plus, Search, Wallet } from "lucide-react";
import {
  WORKSPACE_CARDS,
  WORKSPACE_TABS,
  filterWorkspaceCards,
  type WorkspaceTabId,
} from "@/lib/ai/giga3";
import { cn } from "@/lib/utils";

interface WorkspaceDrawerProps {
  activeTab: WorkspaceTabId;
  onTabChange: (tab: WorkspaceTabId) => void;
  onNewChat: () => void;
  conversations: { id: string; title: string }[];
  onSelectConversation: (id: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  open: boolean;
  onClose: () => void;
}

const ACCOUNT_LINKS = [
  { label: "GigaWallet", href: "/dashboard", icon: Wallet },
  { label: "Workspace", href: "/dashboard", icon: LayoutDashboard },
  { label: "Subscription", href: "/profile", icon: LayoutDashboard },
  { label: "Credits", href: "/dashboard", icon: Wallet },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Help Center", href: "/help", icon: LifeBuoy },
];

export function WorkspaceDrawer({
  activeTab,
  onTabChange,
  onNewChat,
  conversations,
  onSelectConversation,
  search,
  onSearchChange,
  open,
  onClose,
}: WorkspaceDrawerProps) {
  const [tab, setTab] = useState<WorkspaceTabId>(activeTab);
  const cards = filterWorkspaceCards(tab);
  const q = search.trim().toLowerCase();
  const filteredConversations = q
    ? conversations.filter((c) => c.title.toLowerCase().includes(q))
    : conversations;

  function pick(next: WorkspaceTabId) {
    setTab(next);
    onTabChange(next);
  }

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close workspace"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[300px] max-w-[85vw] flex-col border-r border-[#E5E7EB] bg-[#FFFFFF] transition-transform lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Workspace"
        aria-hidden={!open}
      >
        <div className="flex flex-col gap-3 overflow-y-auto p-4 pb-[96px]">
          <button
            type="button"
            onClick={onNewChat}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#7C3AED] text-[16px] font-bold text-white"
          >
            <Plus className="h-5 w-5" /> New Chat
          </button>

          <label className="flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] p-3">
            <Search className="h-4 w-4 shrink-0 text-[#9CA3AF]" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search conversations"
              aria-label="Search conversations"
              className="w-full bg-transparent text-[14px] text-black placeholder-[#9CA3AF] outline-none"
            />
          </label>

          {filteredConversations.length > 0 && (
            <ul className="space-y-1">
              {filteredConversations.slice(0, 8).map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onSelectConversation(c.id)}
                    className="w-full truncate rounded-xl px-3 py-2 text-left text-[13px] text-[#374151] hover:bg-[#F3F4F6]"
                  >
                    {c.title}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <section aria-label="Workspace">
            <h2 className="px-1 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
              Workspace
            </h2>
            <div className="relative">
              <div className="scrollbar-none flex gap-1 overflow-x-auto rounded-full bg-[#F3F4F6] p-1">
                {WORKSPACE_TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => pick(t.id)}
                    aria-pressed={tab === t.id}
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1 text-[12px] font-semibold",
                      tab === t.id ? "bg-[#EAB308] font-bold text-black" : "text-[#374151]",
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <span className="giga3-fade-right" aria-hidden="true" />
            </div>

            <ul className="mt-2 space-y-2">
              {cards.map((card) => (
                <li key={card.id}>
                  <Link
                    href={card.href}
                    className="block rounded-2xl border border-[#E5E7EB] bg-[#F3E8FF]/40 p-3 transition-colors hover:border-[#EAB308]"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-[14px] font-bold text-black">{card.title}</span>
                      <span className="flex shrink-0 items-center gap-1">
                        <span className="rounded bg-[#7C3AED] px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {card.badge}
                        </span>
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[9px] font-bold",
                            card.location === "ai-studio" ? "bg-[#EAB308] text-black" : "bg-[#F3F4F6] text-[#374151]",
                          )}
                        >
                          {card.location === "ai-studio" ? "AI STUDIO" : "ON DEVICE"}
                        </span>
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-[12px] text-[#6B7280]">
                      {card.description}
                    </span>
                  </Link>
                </li>
              ))}
              {cards.length === 0 && (
                <li className="rounded-2xl border border-dashed border-[#E5E7EB] p-3 text-[13px] text-[#6B7280]">
                  No tools in this tab yet.
                </li>
              )}
            </ul>
            <p className="sr-only">{WORKSPACE_CARDS.length} workspace tools total</p>
          </section>

          <section aria-label="Account">
            <h2 className="px-1 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
              Account
            </h2>
            <ul className="space-y-0.5">
              {ACCOUNT_LINKS.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="flex min-h-[44px] items-center gap-2 rounded-xl px-3 text-[14px] text-[#6B7280] hover:bg-[#F3F4F6] hover:text-black"
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </aside>
    </>
  );
}
