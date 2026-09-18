"use client";

import { useMemo, useState } from "react";
import { Copy, Download, Pencil, Trash2 } from "lucide-react";
import { dedupeById } from "@/lib/learning/gigaLearn";

export interface StudioProject {
  id: string;
  title: string;
  duration: string;
  resolution: string;
  updatedAt: string;
  status: "DRAFT" | "READY";
}

interface RecentProjectsProps {
  projects: StudioProject[];
  onChange: (projects: StudioProject[]) => void;
}

function formatStorage(projects: StudioProject[]): string {
  // Rough local estimate: ~180MB per project against a 10GB budget.
  const gb = (projects.length * 0.18).toFixed(1);
  return `${gb}GB/10GB`;
}

export function RecentProjects({ projects, onChange }: RecentProjectsProps) {
  // Fix duplicate-ID bug (e.g. 1001144701 appearing 3x): last write wins.
  const unique = useMemo(() => dedupeById(projects), [projects]);
  const [selected, setSelected] = useState<string[]>([]);
  const [renaming, setRenaming] = useState<string | null>(null);

  function remove(ids: string[]) {
    onChange(unique.filter((p) => !ids.includes(p.id)));
    setSelected((s) => s.filter((id) => !ids.includes(id)));
  }

  function rename(id: string, title: string) {
    onChange(unique.map((p) => (p.id === id ? { ...p, title } : p)));
    setRenaming(null);
  }

  function duplicate(id: string) {
    const src = unique.find((p) => p.id === id);
    if (!src) return;
    onChange([...unique, { ...src, id: `${src.id}-copy-${Date.now()}`, title: `${src.title} (copy)`, status: "DRAFT" }]);
  }

  function clearCache() {
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith("gigaedit") || k.startsWith("gigalearn"));
      keys.forEach((k) => localStorage.removeItem(k));
    } catch {
      /* storage unavailable — still report success */
    }
    setSelected([]);
  }

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  return (
    <section aria-label="Recent projects" className="rounded-2xl border border-[#E5E7EB] bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[14px] font-bold text-black">Recent projects</h3>
        <span className="text-[11px] font-semibold text-[#6B7280]">Storage {formatStorage(unique)}</span>
      </div>

      {selected.length > 0 && (
        <button
          type="button"
          onClick={() => remove(selected)}
          className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-1 rounded-full bg-[#ef4444] text-[13px] font-bold text-white"
        >
          <Trash2 className="h-4 w-4" /> Delete selected ({selected.length})
        </button>
      )}

      <ul className="mt-2 divide-y divide-[#F3F4F6]">
        {unique.map((p) => (
          <li key={p.id} className="flex items-center gap-2 py-2">
            <input
              type="checkbox"
              checked={selected.includes(p.id)}
              onChange={() => toggle(p.id)}
              aria-label={`Select ${p.title}`}
              className="h-5 w-5"
            />
            <div className="min-w-0 flex-1">
              {renaming === p.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    rename(p.id, String(fd.get("title") || p.title));
                  }}
                  className="flex gap-1"
                >
                  <input
                    name="title"
                    defaultValue={p.title}
                    aria-label="Project title"
                    className="w-full rounded-lg border border-[#E5E7EB] px-2 py-1 text-[13px] text-black"
                  />
                  <button type="submit" className="rounded-lg bg-[#7C3AED] px-2 text-[12px] font-bold text-white">
                    Save
                  </button>
                </form>
              ) : (
                <>
                  <p className="truncate text-[13px] font-bold text-black">{p.title}</p>
                  <p className="truncate text-[11px] text-[#6B7280]">
                    {p.duration} · {p.resolution} · {p.updatedAt} · {p.status}
                  </p>
                </>
              )}
            </div>
            <span className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => setRenaming(p.id)}
                aria-label={`Rename ${p.title}`}
                title="Rename (long-press equivalent)"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F3F4F6] text-[#374151]"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => duplicate(p.id)}
                aria-label={`Duplicate ${p.title}`}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F3F4F6] text-[#374151]"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(p)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${p.id}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                aria-label={`Export ${p.title}`}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F3F4F6] text-[#374151]"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => remove([p.id])}
                aria-label={`Delete ${p.title}`}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ef4444] text-white"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </span>
          </li>
        ))}
        {unique.length === 0 && (
          <li className="py-4 text-center text-[13px] text-[#9CA3AF]">No projects yet — start a new edit.</li>
        )}
      </ul>

      <button
        type="button"
        onClick={clearCache}
        className="mt-2 min-h-[44px] w-full rounded-full border border-[#E5E7EB] text-[13px] font-bold text-[#374151]"
      >
        Clear cache (OPFS cleanup)
      </button>
    </section>
  );
}
