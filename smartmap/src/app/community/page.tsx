"use client";

import { FeatureGate } from "@/components/smart-map/feature-gate";
import { useState } from "react";
import { Camera, MapPin, Mic, Plus } from "lucide-react";
import { REPORT_TYPES } from "@/content/smart-map/reports";
import { useMapStore } from "@/stores/map-store";
import type { ReportType } from "@/types/smart-map";
import { DEFAULT_CENTER } from "@/lib/map/styles";
import { sanitizeText } from "@/lib/security/validate";
import { isValidCoord } from "@/lib/security/validate";
import { verifyCommunityReport } from "@/lib/ai40/report-verification";

function CommunityPageContent() {
  const reports = useMapStore((s) => s.reports);
  const addReport = useMapStore((s) => s.addReport);
  const userLocation = useMapStore((s) => s.userLocation) ?? DEFAULT_CENTER;
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ReportType>("accident");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaCount, setMediaCount] = useState(0);
  const [hasVoice, setHasVoice] = useState(false);

  function submit() {
    const cleanTitle = sanitizeText(title, 120);
    const cleanDescription = sanitizeText(description, 2000);
    if (!cleanTitle || !cleanDescription) return;
    if (!isValidCoord(userLocation.lat, userLocation.lng)) return;

    const verification = verifyCommunityReport({
      type,
      title: cleanTitle,
      description: cleanDescription,
      hasMedia: mediaCount > 0 || hasVoice,
    });

    addReport({
      id: crypto.randomUUID(),
      type,
      title: cleanTitle,
      description: cleanDescription,
      coordinates: userLocation,
      city: "Accra",
      countryCode: "GH",
      status: verification.verified ? "verifying" : "submitted",
      createdAt: new Date().toISOString(),
      mediaCount: mediaCount + (hasVoice ? 1 : 0),
      aiSummary: verification.summary,
    });
    setTitle("");
    setDescription("");
    setMediaCount(0);
    setHasVoice(false);
    setOpen(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-6 sm:px-6">
      <header className="flex items-start justify-between gap-3 sm-fade-up">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sm-safety">Community Reporting</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold text-sm-primary dark:text-white">
            Report what you see
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Crime, accidents, floods, outages, road damage, and more — with GPS, media, and AI summaries.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-2xl bg-sm-primary px-4 py-3 text-sm font-bold text-white"
        >
          <Plus className="h-4 w-4" />
          Report
        </button>
      </header>

      {open && (
        <section className="mt-5 rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep">
          <div className="flex flex-wrap gap-2">
            {REPORT_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`rounded-full px-3 py-2 text-xs font-bold ${
                  type === t.id ? "bg-sm-primary text-white" : "bg-slate-100 dark:bg-white/10"
                }`}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Short title"
            className="mt-4 w-full rounded-2xl border border-sm-border bg-transparent px-4 py-3 outline-none dark:border-white/15"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what happened…"
            rows={4}
            className="mt-3 w-full rounded-2xl border border-sm-border bg-transparent px-4 py-3 outline-none dark:border-white/15"
          />
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-white/10">
              <MapPin className="h-3.5 w-3.5" /> GPS attached
            </span>
            <label className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-white/10">
              <Camera className="h-3.5 w-3.5" />
              Photo / video
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                className="sr-only"
                onChange={(e) => setMediaCount(e.target.files?.length ?? 0)}
              />
            </label>
            <label className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-white/10">
              <Mic className="h-3.5 w-3.5" />
              Voice note
              <input
                type="file"
                accept="audio/*"
                className="sr-only"
                onChange={(e) => setHasVoice(Boolean(e.target.files?.length))}
              />
            </label>
            {(mediaCount > 0 || hasVoice) && (
              <span className="rounded-full bg-sm-emerald/15 px-3 py-1.5 text-sm-emerald">
                {mediaCount + (hasVoice ? 1 : 0)} media attached
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={submit}
            className="mt-4 w-full rounded-2xl bg-sm-emerald px-4 py-3 text-sm font-bold text-white"
          >
            Submit report
          </button>
        </section>
      )}

      <ul className="mt-6 space-y-3">
        {reports.map((report) => {
          const meta = REPORT_TYPES.find((t) => t.id === report.type);
          return (
            <li
              key={report.id}
              className="rounded-3xl border border-sm-border bg-white p-4 shadow-sm dark:border-white/10 dark:bg-sm-primary-deep"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: meta?.color }}>
                    {meta?.emoji} {meta?.label} · {report.status}
                  </p>
                  <h2 className="mt-1 font-display text-lg font-bold">{report.title}</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{report.description}</p>
                  {report.aiSummary && (
                    <p className="mt-2 rounded-2xl bg-sm-primary/5 px-3 py-2 text-sm text-sm-primary dark:bg-white/5 dark:text-sky-200">
                      {report.aiSummary}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-xs text-slate-400">
                  {new Date(report.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}


export default function CommunityPage() {
  return (
    <FeatureGate
      flag="publicSafetyPhase2"
      title="Community Reporting"
      phase="Phase 2"
      description="Hazard reporting with photos, video, voice notes, and AI summaries is ready behind the Phase 2 flag."
    >
      <CommunityPageContent />
    </FeatureGate>
  );
}
