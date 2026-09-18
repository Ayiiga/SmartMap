"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  CHAT_TEMPLATES,
  SUGGESTED_NEXT_STEPS,
  type ChatTemplate,
  type WorkspaceTabId,
} from "@/lib/ai/giga3";

interface TemplatesDropdownProps {
  onSelect: (template: ChatTemplate) => void;
}

export function TemplatesDropdown({ onSelect }: TemplatesDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex min-h-[44px] items-center gap-1 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-bold text-black"
      >
        Templates <ChevronDown className="h-4 w-4" />
      </button>
      {open && (
        <div
          className="absolute left-0 top-12 z-30 w-[320px] max-w-[85vw] rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-3 shadow-lg"
          role="dialog"
          aria-label="Templates"
        >
          <div className="grid grid-cols-2 gap-2">
            {CHAT_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  onSelect(t);
                  setOpen(false);
                }}
                className="rounded-xl border border-[#E5E7EB] bg-white p-2.5 text-left transition-colors hover:border-[#EAB308]"
              >
                <span className="text-xl leading-none" aria-hidden="true">
                  {t.icon}
                </span>
                <span className="mt-1 block text-[13px] font-bold text-black">{t.title}</span>
                <span className="block truncate text-[11px] text-[#6B7280]">{t.subtitle}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SuggestedPills({
  onPick,
}: {
  onPick: (prompt: string, workspaceTab: WorkspaceTabId) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Suggested next steps">
      {SUGGESTED_NEXT_STEPS.map((s) => (
        <button
          key={s.label}
          type="button"
          onClick={() => onPick(s.prompt, s.workspaceTab)}
          className="min-h-[44px] rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-[13px] text-[#374151] transition-colors hover:border-[#EAB308] hover:bg-[#EAB308] hover:text-black"
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
