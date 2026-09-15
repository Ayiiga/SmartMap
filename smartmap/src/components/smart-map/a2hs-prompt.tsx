"use client";

import { useEffect, useState } from "react";
import { Smartphone, X } from "lucide-react";
import { dismissA2hsPrompt, shouldShowA2hsPrompt } from "@/lib/offline/navigation-counter";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function AddToHomeScreenPrompt() {
  const [visible, setVisible] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (!shouldShowA2hsPrompt()) return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    if (shouldShowA2hsPrompt()) setVisible(true);

    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  if (!visible) return null;

  async function install() {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
    }
    dismissA2hsPrompt();
    setVisible(false);
  }

  function close() {
    dismissA2hsPrompt();
    setVisible(false);
  }

  return (
    <div className="pointer-events-auto rounded-2xl border border-[#0F5B8D]/30 bg-white/95 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0B1220]/95">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-[#0F5B8D]" />
          <div>
            <p className="font-bold text-[#0B1220] dark:text-white">Add Smart Map to Home Screen</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Install for faster offline navigation on 3G in Ashanti Region.
            </p>
          </div>
        </div>
        <button type="button" onClick={close} aria-label="Dismiss install prompt">
          <X className="h-4 w-4 text-slate-400" />
        </button>
      </div>
      <button
        type="button"
        onClick={() => void install()}
        className="mt-3 w-full rounded-2xl bg-[#0F5B8D] px-4 py-3 text-sm font-bold text-white"
      >
        Add to Home Screen
      </button>
    </div>
  );
}
