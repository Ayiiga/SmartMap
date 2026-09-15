"use client";

import { FeatureGate } from "@/components/smart-map/feature-gate";
import { useState, useTransition } from "react";
import { Bot, Send, Sparkles } from "lucide-react";

const SUGGESTIONS = [
  "Nearest hospital from Airport City",
  "Safest evening route to Legon",
  "What should I do during a flood alert?",
  "Translate: Where is the police station?",
  "Plan a tourist day in Accra with safe stops",
];

function AIAssistantPageContent() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([
    {
      role: "assistant",
      content:
        "I'm Smart Map AI. I can find nearest services, recommend safer routes, explain landmarks, translate local phrases, and guide you through emergencies across Africa.",
    },
  ]);
  const [pending, startTransition] = useTransition();

  function ask(prompt: string) {
    const text = prompt.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    startTransition(async () => {
      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feature: "map_assistant", input: text }),
        });
        const data = (await res.json()) as { response?: string; error?: string };
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: data.response ?? offlineReply(text),
          },
        ]);
      } catch {
        setMessages((m) => [...m, { role: "assistant", content: offlineReply(text) }]);
      }
    });
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-6rem)] max-w-3xl flex-col px-4 pb-6 pt-6 sm:px-6">
      <header className="sm-fade-up">
        <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-sm-emerald">
          <Sparkles className="h-4 w-4" />
          AI Assistant
        </p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-sm-primary dark:text-white">
          Ask Smart Map AI
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Navigation help, emergency guidance, travel planning, and local language support.
        </p>
      </header>

      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => ask(s)}
            className="rounded-full border border-sm-border bg-white px-3 py-2 text-xs font-semibold dark:border-white/10 dark:bg-sm-primary-deep"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-5 flex-1 space-y-3 overflow-y-auto rounded-[2rem] border border-sm-border bg-white/70 p-4 dark:border-white/10 dark:bg-sm-primary-deep/70">
        {messages.map((msg, i) => (
          <div
            key={`${msg.role}-${i}`}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-sm-primary text-white"
                  : "bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-white"
              }`}
            >
              {msg.role === "assistant" && (
                <span className="mb-1 flex items-center gap-1 text-xs font-bold text-sm-emerald">
                  <Bot className="h-3.5 w-3.5" /> Smart Map AI
                </span>
              )}
              {msg.content}
            </div>
          </div>
        ))}
        {pending && <p className="text-sm text-slate-500">Thinking…</p>}
      </div>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about routes, safety, or nearby services…"
          className="flex-1 rounded-2xl border border-sm-border bg-white px-4 py-3 outline-none dark:border-white/15 dark:bg-sm-primary-deep"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-2xl bg-sm-primary px-4 text-white disabled:opacity-50"
          aria-label="Send"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}

function offlineReply(input: string): string {
  const q = input.toLowerCase();
  if (q.includes("hospital")) {
    return "Nearest major hospitals in Accra: Korle Bu Teaching Hospital and 37 Military Hospital. Both are verified, open 24 hours, and support emergency intake. Want a safer walking or driving route?";
  }
  if (q.includes("flood")) {
    return "Flood guidance: avoid underpasses, move to higher ground, share your live location with emergency contacts, and call 192/193 if anyone is trapped. Check Community Alerts for verified reports.";
  }
  if (q.includes("safe") || q.includes("route")) {
    return "For evening travel in Accra, prefer well-lit arterial roads, keep Women Safety Mode on, and avoid poorly lit shortcuts. I can bias routes toward verified police/hospital corridors.";
  }
  if (q.includes("translate") || q.includes("police")) {
    return "Twi: “Polis station no wɔ he?” (Where is the police station?) · Ga: “Polis station yɛ mli?” Keep the Safety Center numbers handy: Police 191, Fire 192, Ambulance 193.";
  }
  return "I can help with nearest services, safer routes, landmark context, emergency steps, and travel planning across Ghana and expanding African cities. Ask me something specific about where you are going.";
}


export default function AIAssistantPage() {
  return (
    <FeatureGate
      flag="aiExpansionPhase3"
      title="Smart Map AI"
      phase="Phase 3"
      description="AI assistant, voice search, and travel guidance are ready behind the Phase 3 flag."
    >
      <AIAssistantPageContent />
    </FeatureGate>
  );
}
