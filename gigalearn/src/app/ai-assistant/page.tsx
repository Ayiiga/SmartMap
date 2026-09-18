"use client";

import { FeatureGate } from "@/components/smart-map/feature-gate";
import { AfricanVoiceReader } from "@/components/chat/AfricanVoiceReader";
import { ChatInput } from "@/components/chat/ChatInput";
import { SuggestedPills, TemplatesDropdown } from "@/components/chat/TemplatesDropdown";
import { WorkspaceDrawer } from "@/components/chat/WorkspaceDrawer";
import { WorkspaceDropdown } from "@/components/chat/WorkspaceDropdown";
import { GIGA3_LOGO_URLS, type ChatTemplate, type WorkspaceTabId } from "@/lib/ai/giga3";
import { useRef, useState, useTransition } from "react";
import { Bot, Menu, Sparkles } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  files?: string[];
}

function answerLogoQuestion(prompt: string): string | null {
  const q = prompt.toLowerCase();
  if (q.includes("logo") || q.includes("logotype")) {
    return (
      `Here is the direct logotype URL: ${GIGA3_LOGO_URLS[0]} ` +
      `(mirror: ${GIGA3_LOGO_URLS[1]}). Install the PWA via /manifest.json.`
    );
  }
  return null;
}

function AIAssistantPageContent() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "I'm Giga3 AI — Africa's AI Super App. I can generate books, research papers, essays, code with African context, CVs in Ghana format, read replies with African voices (Twi/Hausa/Ga/Ewe/Yoruba/Swahili), and search the latest news & politics.",
    },
  ]);
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTabId>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  function ask(prompt: string, files?: File[]) {
    const text = prompt.trim();
    if ((!text && !files?.length) || pending) return;
    // Fixed logotype URL bug: answer locally with the direct URL, no "I don't have a URL".
    const logoAnswer = text ? answerLogoQuestion(text) : null;
    setMessages((m) => [
      ...m,
      { role: "user", content: text || "(attachment)", files: files?.map((f) => f.name) },
      ...(logoAnswer ? [{ role: "assistant" as const, content: logoAnswer }] : []),
    ]);
    setInput("");
    if (logoAnswer) return;
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
          { role: "assistant", content: data.response ?? offlineReply(text) },
        ]);
      } catch {
        setMessages((m) => [...m, { role: "assistant", content: offlineReply(text) }]);
      }
    });
  }

  function newChat() {
    setMessages([
      {
        role: "assistant",
        content: "New chat started. Ask me anything — books, research, essays, code, CVs, news, or Ghana politics.",
      },
    ]);
    setInput("");
    setDrawerOpen(false);
    inputRef.current?.focus();
  }

  function applyTemplate(t: ChatTemplate) {
    setWorkspaceTab(t.workspaceTab);
    setInput(t.prompt);
    inputRef.current?.focus();
  }

  const conversations = messages
    .filter((m) => m.role === "user")
    .map((m, i) => ({ id: `c-${i}`, title: m.content.slice(0, 48) || "Untitled" }));

  return (
    <div className="giga3-chat mx-auto flex min-h-dvh w-full max-w-5xl bg-[#FFFFFF] pb-[72px] text-[14px] leading-[1.6]">
      <WorkspaceDrawer
        activeTab={workspaceTab}
        onTabChange={setWorkspaceTab}
        onNewChat={newChat}
        conversations={conversations}
        onSelectConversation={() => setDrawerOpen(false)}
        search={search}
        onSearchChange={setSearch}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-[#E5E7EB] bg-[#FFFFFF]/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen((v) => !v)}
              aria-label="Open workspace"
              aria-expanded={drawerOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] text-[#374151] lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-[#0E9F6E]">
              <Sparkles className="h-4 w-4" />
              Giga3 AI Chat
            </span>
            <span className="ml-auto" />
            <TemplatesDropdown onSelect={applyTemplate} />
            <WorkspaceDropdown
              activeTab={workspaceTab}
              onTabChange={setWorkspaceTab}
              onShare={() => {
                const text = messages.map((m) => `${m.role}: ${m.content}`).join("\n");
                void navigator.clipboard?.writeText(text).catch(() => {});
              }}
            />
          </div>
          <h1 className="mt-1 text-[20px] font-extrabold text-black">Ask Giga3 AI</h1>
          <p className="text-[13px] text-[#6B7280]">
            Books · Research · Essays · Coding · CV · African voices · Web search · News &amp; politics
          </p>
        </header>

        <div className="giga3-scroll flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((msg, i) => (
            <div key={`${msg.role}-${i}`} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-[20px] px-4 py-3 ${
                  msg.role === "user" ? "bg-[#7C3AED] text-white" : "border border-[#E5E7EB] bg-white text-black"
                }`}
              >
                {msg.role === "assistant" && (
                  <span className="mb-1 flex items-center gap-1 text-[12px] font-bold text-[#0E9F6E]">
                    <Bot className="h-3.5 w-3.5" /> Giga3 AI
                  </span>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.files?.length ? (
                  <p className="mt-1 text-[12px] opacity-80">📎 {msg.files.join(", ")}</p>
                ) : null}
                {msg.role === "assistant" && i > 0 && <AfricanVoiceReader text={msg.content} />}
              </div>
            </div>
          ))}
          {pending && <p className="text-[13px] text-[#6B7280]">Thinking…</p>}
        </div>

        <div className="px-4 pb-2">
          <SuggestedPills
            onPick={(prompt, tab) => {
              setWorkspaceTab(tab);
              ask(prompt);
            }}
          />
        </div>

        <ChatInput
          value={input}
          onChange={setInput}
          onSend={(text, files) => ask(text, files)}
          disabled={pending}
          inputRef={inputRef}
        />
      </div>
    </div>
  );
}

function offlineReply(input: string): string {
  const q = input.toLowerCase();
  if (q.includes("logo") || q.includes("logotype")) {
    return (
      `Direct logotype URL: ${GIGA3_LOGO_URLS[0]} (mirror: ${GIGA3_LOGO_URLS[1]}). ` +
      "PWA install via /manifest.json."
    );
  }
  if (q.includes("book") && q.includes("outline")) {
    return "Book outline template:\n1. Title & premise\n2. Audience (e.g. BECE learners in Ghana)\n3. Chapter-by-chapter outline\n4. Sample Chapter 1\nTell me your topic and I'll draft it.";
  }
  if (q.includes("research") || q.includes("citation")) {
    return "Research plan template:\n• Title • Objectives • Method • Findings • Citations [1][2]\nGive me a topic and I'll draft the paper.";
  }
  if (q.includes("essay")) {
    return "Essay structure: introduction → 3 arguments with Ghanaian examples → counterpoint → conclusion with citations. Give me the motion.";
  }
  if (q.includes("cv")) {
    return "Ghana CV format: Bio-data → Objective → Education (WASSCE/BECE) → NSS → Experience → Skills → Referees. Tell me the role.";
  }
  if (q.includes("code")) {
    return "I can code with African context — MoMo APIs, Twi/Hausa UI strings, low-bandwidth 3G builds. Describe the feature.";
  }
  if (q.includes("news") || q.includes("politics") || q.includes("latest")) {
    return "Ghana briefing (offline snapshot — connect for live results):\n• Parliament & presidency updates move fast — verify on major Ghana outlets before quoting.\nSources to check when online: [1] Ghana News Agency [2] Joy Online [3] Citi Newsroom.";
  }
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
    return "Twi: “Polis station no wɔ he?” (Where is the police station?) · Ga: “Polis station yɛ mli?” Safety numbers: Police 191, Fire 192, Ambulance 193.";
  }
  if (q.includes("fraction") || q.includes("bece") || q.includes("maths") || q.includes("quiz")) {
    return "BECE fractions: numerator/denominator → simplify → mixed numbers. Example: 3/4 + 1/8 = 7/8. Want a 10-question quiz next?";
  }
  return "I'm Giga3 AI — ask for a book outline, research paper, essay, code, Ghana-format CV, BECE/WASSCE help, or the latest Ghana news & politics.";
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
