/**
 * Giga3 AI — brand knowledge, workspace taxonomy, templates, and
 * web-search / news intent helpers.
 *
 * Single source of truth shared by the chat UI (WorkspaceDrawer,
 * WorkspaceDropdown, TemplatesDropdown) and the AI layer
 * (`lib/ai/openai.ts`, `/api/ai` route).
 *
 * Port of the `convex/aiModes.ts` brand fix into this Next.js repo
 * (there is no `convex/` or `web/` tree here — equivalents live under
 * `gigalearn/src/`).
 */

/** Direct logotype URLs — never reply "I don't have a direct URL". */
export const GIGA3_BRAND_KNOWLEDGE =
  "Logo = https://www.giga3ai.com/images/logo.png and /images/logo.png from web/public/images/logo.png. " +
  "When asked for the logotype URL, return the direct URL. PWA install via /manifest.json.";

export const GIGA3_LOGO_URLS = [
  "https://www.giga3ai.com/images/logo.png",
  "/images/logo.png",
] as const;

export const GIGA3_SYSTEM_PROMPT =
  "You are Giga3 AI - Africa's AI Super App - Built in Africa, Powered by AI, Designed for Everyone. " +
  "You can generate books (outlines, chapters), research writing (papers with citations), essays, " +
  "coding (with African context), CVs (Ghana format), read responses with African voices " +
  "(Twi/Hausa/Ga/Ewe/Yoruba/Swahili/Zulu/Amharic), have templates (Book, Research, Essay, CV, Code, Lesson Plan), " +
  "interconnected workspace, web search, news, politics, global standard, stable multi-provider failover OpenAI→Gemini→OpenRouter. " +
  GIGA3_BRAND_KNOWLEDGE;

export type WorkspaceTabId =
  | "all"
  | "chat"
  | "learn"
  | "create"
  | "social"
  | "research"
  | "books"
  | "code"
  | "cv";

export interface WorkspaceTab {
  id: WorkspaceTabId;
  label: string;
}

export const WORKSPACE_TABS: WorkspaceTab[] = [
  { id: "all", label: "All" },
  { id: "chat", label: "Chat" },
  { id: "learn", label: "Learn" },
  { id: "create", label: "Create" },
  { id: "social", label: "Social" },
  { id: "research", label: "Research" },
  { id: "books", label: "Books" },
  { id: "code", label: "Code" },
  { id: "cv", label: "CV" },
];

export interface WorkspaceCard {
  id: string;
  title: string;
  badge: string;
  badgeTone: "purple" | "yellow";
  description: string;
  tabs: WorkspaceTabId[];
  location: "on-device" | "ai-studio";
  href: string;
}

export const WORKSPACE_CARDS: WorkspaceCard[] = [
  { id: "gigasocial", title: "GigaSocial", badge: "SOCIAL", badgeTone: "purple", description: "Community & study groups", tabs: ["social", "chat"], location: "ai-studio", href: "/community" },
  { id: "gigaedits", title: "GigaEdits", badge: "EDIT", badgeTone: "purple", description: "Media studio & edits", tabs: ["create", "social"], location: "on-device", href: "/videos" },
  { id: "gigalearn", title: "GigaLearn", badge: "LEARN", badgeTone: "purple", description: "BECE / WASSCE practice", tabs: ["learn", "chat"], location: "ai-studio", href: "/learn" },
  { id: "media-studio", title: "Media Studio", badge: "STUDIO", badgeTone: "yellow", description: "Photos, video, audio tools", tabs: ["create"], location: "on-device", href: "/videos" },
  { id: "book-template", title: "Book Template", badge: "BOOKS", badgeTone: "yellow", description: "Generate book outline", tabs: ["books", "research"], location: "ai-studio", href: "/ai-assistant" },
  { id: "research-paper", title: "Research Paper", badge: "RESEARCH", badgeTone: "yellow", description: "Research writing with citations", tabs: ["research"], location: "ai-studio", href: "/ai-assistant" },
  { id: "essay", title: "Essay", badge: "ESSAY", badgeTone: "yellow", description: "Essay with citations", tabs: ["research", "learn"], location: "ai-studio", href: "/ai-assistant" },
  { id: "cv-ghana", title: "CV Ghana format", badge: "CV", badgeTone: "yellow", description: "CV for Ghana jobs", tabs: ["cv", "create"], location: "ai-studio", href: "/ai-assistant" },
  { id: "code-africa", title: "Code", badge: "CODE", badgeTone: "yellow", description: "Coding with African context", tabs: ["code", "create"], location: "ai-studio", href: "/ai-tutor?feature=coding_tutor" },
  { id: "lesson-plan", title: "Lesson Plan", badge: "LEARN", badgeTone: "purple", description: "GigaLearn practice plan", tabs: ["learn"], location: "ai-studio", href: "/ai-tutor?feature=lesson_generator" },
];

export function filterWorkspaceCards(tab: WorkspaceTabId): WorkspaceCard[] {
  if (tab === "all") return WORKSPACE_CARDS;
  return WORKSPACE_CARDS.filter((c) => c.tabs.includes(tab));
}

export interface ChatTemplate {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  prompt: string;
  workspaceTab: WorkspaceTabId;
}

export const CHAT_TEMPLATES: ChatTemplate[] = [
  { id: "book", title: "Book Template", subtitle: "Generate book outline", icon: "📚", prompt: "Generate a book outline for: ", workspaceTab: "books" },
  { id: "research", title: "Research Paper", subtitle: "Research writing", icon: "🔬", prompt: "Write a research plan with citations for: ", workspaceTab: "research" },
  { id: "essay", title: "Essay", subtitle: "Essay with citations", icon: "📝", prompt: "Write an essay with citations on: ", workspaceTab: "research" },
  { id: "cv", title: "CV", subtitle: "CV for Ghana job", icon: "💼", prompt: "Write a CV in Ghana format for: ", workspaceTab: "cv" },
  { id: "code", title: "Code", subtitle: "Coding with African context", icon: "💻", prompt: "Write code with African context for: ", workspaceTab: "code" },
  { id: "lesson", title: "Lesson Plan", subtitle: "GigaLearn practice", icon: "🎓", prompt: "Create a GigaLearn lesson plan for: ", workspaceTab: "learn" },
];

export const SUGGESTED_NEXT_STEPS: { label: string; prompt: string; workspaceTab: WorkspaceTabId }[] = [
  { label: "Explain fractions BECE", prompt: "Explain fractions for BECE with examples", workspaceTab: "learn" },
  { label: "Create 10-question maths quiz", prompt: "Create a 10-question maths quiz with answers", workspaceTab: "learn" },
  { label: "GigaLearn practice", prompt: "Create a GigaLearn practice plan for BECE", workspaceTab: "learn" },
  { label: "Generate book outline", prompt: "Generate a book outline for: ", workspaceTab: "books" },
  { label: "Research writing essay", prompt: "Write a research essay with citations on: ", workspaceTab: "research" },
  { label: "Write CV", prompt: "Write a CV in Ghana format for: ", workspaceTab: "cv" },
  { label: "Code with African context", prompt: "Write code with African context for: ", workspaceTab: "code" },
  { label: "Latest news Ghana politics", prompt: "Latest news on Ghana politics", workspaceTab: "chat" },
];

export interface UploadOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  section: "MEDIA" | "DOCUMENTS";
  location: "ON DEVICE" | "AI STUDIO";
  accept?: string;
  capture?: string;
}

export const UPLOAD_OPTIONS: UploadOption[] = [
  { id: "media", title: "Media", subtitle: "Photos, video, camera, audio, files", icon: "📎", section: "MEDIA", location: "ON DEVICE", accept: "*/*" },
  { id: "camera", title: "Camera", subtitle: "Capture photo", icon: "📷", section: "MEDIA", location: "ON DEVICE", accept: "image/*", capture: "environment" },
  { id: "photos", title: "Photos", subtitle: "One or more images", icon: "🖼️", section: "MEDIA", location: "ON DEVICE", accept: "image/*" },
  { id: "videos", title: "Videos", subtitle: "Attach video", icon: "🎥", section: "MEDIA", location: "ON DEVICE", accept: "video/*" },
  { id: "audio", title: "Audio", subtitle: "Music or voice file", icon: "🎵", section: "MEDIA", location: "ON DEVICE", accept: "audio/*" },
  { id: "pdf", title: "PDF", subtitle: "Documents & briefs", icon: "📄", section: "DOCUMENTS", location: "ON DEVICE", accept: "application/pdf,.doc,.docx,.txt" },
  { id: "action-research", title: "Action Research", subtitle: "Research plan template", icon: "🔬", section: "DOCUMENTS", location: "AI STUDIO" },
];

const WEB_SEARCH_KEYWORDS = ["news", "politics", "latest", "ghana", "africa", "global", "election", "parliament", "president", "covid", "weather alert", "breaking"];

/** Returns true when the prompt should be answered with web search / news citations. */
export function needsWebSearch(prompt: string): boolean {
  const q = prompt.toLowerCase();
  return WEB_SEARCH_KEYWORDS.some((k) => q.includes(k));
}

/** Offline web-search style briefing with citations (used when no search provider is configured). */
export function offlineWebSearchBriefing(prompt: string): string {
  const q = prompt.toLowerCase();
  if (q.includes("politics") || q.includes("ghana")) {
    return (
      "Ghana briefing (offline snapshot — connect for live results):\n" +
      "• Parliament & presidency updates move fast — verify on major Ghana outlets before quoting.\n" +
      "• For BECE/WASSCE essays on politics, structure: context → 3 arguments with examples → counterpoint → conclusion.\n" +
      "Sources to check when online: [1] Ghana News Agency [2] Joy Online [3] Citi Newsroom."
    );
  }
  return (
    "Web-search briefing (offline snapshot — connect for live results):\n" +
    `• No live index is configured, so here is a grounded starting brief for: "${prompt.slice(0, 120)}".\n` +
    "• Ask again when online for cited, up-to-date sources."
  );
}
