import { describe, expect, it } from "vitest";
import {
  CHAT_TEMPLATES,
  GIGA3_LOGO_URLS,
  SUGGESTED_NEXT_STEPS,
  UPLOAD_OPTIONS,
  WORKSPACE_TABS,
  filterWorkspaceCards,
  needsWebSearch,
  offlineWebSearchBriefing,
} from "@/lib/ai/giga3";

describe("giga3 brand knowledge (logotype URL fix)", () => {
  it("exposes a direct logotype URL, never an 'I don't have a URL' path", () => {
    expect(GIGA3_LOGO_URLS[0]).toBe("https://www.giga3ai.com/images/logo.png");
    expect(GIGA3_LOGO_URLS[1]).toBe("/images/logo.png");
  });
});

describe("workspace single source of truth", () => {
  it("has the All/Chat/Learn/Create/Social/Research/Books/Code/CV tabs", () => {
    expect(WORKSPACE_TABS.map((t) => t.id)).toEqual([
      "all",
      "chat",
      "learn",
      "create",
      "social",
      "research",
      "books",
      "code",
      "cv",
    ]);
  });

  it("filters research cards to Book/Research/Essay/CV set", () => {
    const titles = filterWorkspaceCards("research").map((c) => c.title);
    expect(titles).toContain("Book Template");
    expect(titles).toContain("Research Paper");
    expect(titles).toContain("Essay");
  });

  it("upload grid covers media + documents without a full-screen modal", () => {
    const sections = new Set(UPLOAD_OPTIONS.map((o) => o.section));
    expect(sections).toEqual(new Set(["MEDIA", "DOCUMENTS"]));
    expect(UPLOAD_OPTIONS.some((o) => o.title === "Action Research")).toBe(true);
  });
});

describe("templates interconnected", () => {
  it("every template maps to a workspace tab", () => {
    const tabIds = new Set(WORKSPACE_TABS.map((t) => t.id));
    for (const t of CHAT_TEMPLATES) expect(tabIds.has(t.workspaceTab)).toBe(true);
    expect(CHAT_TEMPLATES).toHaveLength(6);
  });

  it("suggested pills keep BECE items and add global ones", () => {
    const labels = SUGGESTED_NEXT_STEPS.map((s) => s.label);
    expect(labels).toContain("Explain fractions BECE");
    expect(labels).toContain("Latest news Ghana politics");
    expect(labels).toContain("Write CV");
  });
});

describe("web search / news / politics", () => {
  it("detects news/politics/latest intent", () => {
    expect(needsWebSearch("Latest news Ghana politics")).toBe(true);
    expect(needsWebSearch("Explain fractions for BECE")).toBe(false);
  });

  it("offline briefing always returns citations", () => {
    expect(offlineWebSearchBriefing("Latest news Ghana politics")).toMatch(/\[1\]/);
  });
});
