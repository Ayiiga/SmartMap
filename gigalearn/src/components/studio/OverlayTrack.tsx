"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type OverlayKind = "sticker" | "text" | "logo";

export interface OverlayItem {
  id: string;
  kind: OverlayKind;
  label: string;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  /** z-index band: video 10, overlay 20, teleprompter 30 */
  zIndex: 10 | 20 | 30;
}

interface OverlayTrackProps {
  items: OverlayItem[];
  onChange: (items: OverlayItem[]) => void;
}

const KIND_LABEL: Record<OverlayKind, string> = {
  sticker: "Sticker",
  text: "Text",
  logo: "Logo",
};

export function OverlayTrack({ items, onChange }: OverlayTrackProps) {
  const [selectedId, setSelectedId] = useState<string | null>(items[0]?.id ?? null);
  const selected = items.find((i) => i.id === selectedId) ?? null;

  function patch(id: string, p: Partial<OverlayItem>) {
    onChange(items.map((i) => (i.id === id ? { ...i, ...p } : i)));
  }

  function bring(id: string, dir: 1 | -1) {
    const order: (10 | 20 | 30)[] = [10, 20, 30];
    const cur = items.find((i) => i.id === id);
    if (!cur) return;
    const next = order[Math.min(2, Math.max(0, order.indexOf(cur.zIndex) + dir))];
    patch(id, { zIndex: next });
  }

  return (
    <section aria-label="Timeline overlay track" className="rounded-2xl border border-[#E5E7EB] bg-white p-3">
      <h3 className="text-[12px] font-bold uppercase tracking-wide text-[#6B7280]">
        Overlays · Stickers / Text / Logo
      </h3>
      {items.length === 0 && (
        <p className="mt-2 text-[13px] text-[#9CA3AF]">No overlays yet — add a sticker, text, or logo.</p>
      )}
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setSelectedId(item.id)}
              aria-pressed={selectedId === item.id}
              className={cn(
                "flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-[13px]",
                selectedId === item.id ? "border-[#EAB308] bg-[#EAB308]/10 font-bold text-black" : "border-[#E5E7EB] text-[#374151]",
              )}
            >
              <span className="rounded bg-[#7C3AED] px-1.5 py-0.5 text-[10px] font-bold text-white">
                {KIND_LABEL[item.kind].toUpperCase()}
              </span>
              <span className="flex-1 truncate">{item.label}</span>
              <span className="text-[11px] text-[#9CA3AF]">z{item.zIndex}</span>
            </button>
          </li>
        ))}
      </ul>

      {selected && (
        <div className="mt-3 rounded-xl bg-[#F9FAFB] p-3" aria-label={`Edit ${selected.label}`}>
          <p className="text-[13px] font-bold text-black">{selected.label}</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="text-[12px] text-[#374151]">
              Opacity {Math.round(selected.opacity * 100)}%
              <input
                type="range"
                min={10}
                max={100}
                value={Math.round(selected.opacity * 100)}
                onChange={(e) => patch(selected.id, { opacity: Number(e.target.value) / 100 })}
                className="mt-1 w-full"
                aria-label="Overlay opacity"
              />
            </label>
            <label className="text-[12px] text-[#374151]">
              Scale {selected.scale.toFixed(1)}x
              <input
                type="range"
                min={50}
                max={200}
                value={Math.round(selected.scale * 100)}
                onChange={(e) => patch(selected.id, { scale: Number(e.target.value) / 100 })}
                className="mt-1 w-full"
                aria-label="Overlay scale"
              />
            </label>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => bring(selected.id, 1)}
              className="min-h-[44px] rounded-full border border-[#E5E7EB] bg-white px-3 text-[12px] font-bold text-[#374151]"
            >
              Bring front
            </button>
            <button
              type="button"
              onClick={() => bring(selected.id, -1)}
              className="min-h-[44px] rounded-full border border-[#E5E7EB] bg-white px-3 text-[12px] font-bold text-[#374151]"
            >
              Send back
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(items.filter((i) => i.id !== selected.id));
                setSelectedId(null);
              }}
              aria-label={`Delete ${selected.label}`}
              className="flex min-h-[44px] items-center gap-1 rounded-full bg-[#ef4444] px-3 text-[12px] font-bold text-white"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
