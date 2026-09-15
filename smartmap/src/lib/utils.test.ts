import { describe, it, expect } from "vitest";
import { calculateLevel, xpForNextLevel, slugify } from "@/lib/utils";

describe("utils", () => {
  it("calculates level from XP", () => {
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(100)).toBe(2);
    expect(calculateLevel(400)).toBe(3);
  });

  it("computes XP for next level", () => {
    expect(xpForNextLevel(1)).toBe(100);
    expect(xpForNextLevel(2)).toBe(400);
  });

  it("slugifies text", () => {
    expect(slugify("Hello World!")).toBe("hello-world");
    expect(slugify("GigaPhonics Level 2")).toBe("gigaphonics-level-2");
  });
});

describe("curriculum", () => {
  it("has 9 learning levels including GigaMath", async () => {
    const { LEVELS } = await import("@/content/curriculum");
    expect(LEVELS).toHaveLength(9);
    expect(LEVELS.some((l) => l.id === "mathematics")).toBe(true);
  });

  it("includes A–Z alphabet lessons", async () => {
    const { LESSONS } = await import("@/content/curriculum");
    const alphabet = LESSONS.filter((l) => l.level === "alphabet");
    expect(alphabet).toHaveLength(26);
    expect(alphabet[0].slug).toBe("letter-a");
    expect(alphabet[25].slug).toBe("letter-z");
  });

  it("includes GigaPhonics as level 2", async () => {
    const { LEVELS } = await import("@/content/curriculum");
    expect(LEVELS[1].title).toBe("GigaPhonics");
    expect(LEVELS[1].id).toBe("phonics");
  });
});
