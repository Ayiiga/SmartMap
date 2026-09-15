"use client";

import { useState } from "react";
import { Shield, X } from "lucide-react";
import { useMapStore } from "@/stores/map-store";
import type { PrivacyConsentKey } from "@/lib/ai40/types";
import { Button } from "@/components/ui/button";

interface PrivacyConsentSheetProps {
  open: boolean;
  onClose: () => void;
  requiredKeys?: PrivacyConsentKey[];
}

export function PrivacyConsentSheet({ open, onClose, requiredKeys }: PrivacyConsentSheetProps) {
  const consents = useMapStore((s) => s.privacyConsents);
  const setPrivacyConsent = useMapStore((s) => s.setPrivacyConsent);
  const revokeAllPrivacyConsents = useMapStore((s) => s.revokeAllPrivacyConsents);
  const [expanded, setExpanded] = useState<PrivacyConsentKey | null>(null);

  if (!open) return null;

  const items = requiredKeys
    ? consents.filter((c) => requiredKeys.includes(c.key))
    : consents;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-sm-border bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-sm-primary-deep"
        role="dialog"
        aria-labelledby="privacy-consent-title"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-sm-primary" />
            <h2 id="privacy-consent-title" className="font-display text-xl font-bold">
              Privacy & permissions
            </h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          Smart Map AI 4.0 only uses data you explicitly permit. You can revoke access at any time.
        </p>

        <ul className="mt-4 space-y-2">
          {items.map((consent) => (
            <li
              key={consent.key}
              className="rounded-2xl border border-sm-border p-3 dark:border-white/10"
            >
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  className="text-left text-sm font-semibold capitalize"
                  onClick={() => setExpanded(expanded === consent.key ? null : consent.key)}
                >
                  {consent.key.replace(/_/g, " ")}
                </button>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={consent.granted}
                    onChange={(e) => setPrivacyConsent(consent.key, e.target.checked)}
                  />
                  <div className="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-sm-primary peer-checked:after:translate-x-full dark:bg-white/20" />
                </label>
              </div>
              {(expanded === consent.key || !consent.granted) && (
                <p className="mt-1 text-xs text-slate-500">{consent.purpose}</p>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-col gap-2">
          <Button onClick={onClose} className="w-full">Done</Button>
          <Button variant="ghost" onClick={revokeAllPrivacyConsents} className="w-full text-sm">
            Disable all data sharing
          </Button>
        </div>
      </div>
    </div>
  );
}
