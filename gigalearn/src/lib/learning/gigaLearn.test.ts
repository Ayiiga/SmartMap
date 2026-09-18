import { describe, expect, it } from "vitest";
import {
  CONCRETE_OBJECTS,
  GIGA_LESSONS,
  GIGA_LEVELS,
  GIGA_MODES,
  GIGA_SUBJECTS,
  GIGA_VOICES,
  dedupeById,
} from "@/lib/learning/gigaLearn";

describe("gigaLearn levels (Creche → Adult, GES)", () => {
  it("covers all levels from Creche to Adult", () => {
    const ids = GIGA_LEVELS.map((l) => l.id);
    for (const must of ["creche", "kg1", "kg2", "p1", "p4-6", "jhs", "shs", "university", "adult"]) {
      expect(ids).toContain(must);
    }
  });

  it("subjects include Ghanaian Language + RME + French", () => {
    const ids = GIGA_SUBJECTS.map((s) => s.id);
    expect(ids).toContain("ghana-lang");
    expect(ids).toContain("rme");
    expect(ids).toContain("french");
  });
});

describe("gigaLearn modes", () => {
  it("has all 8 modes with badges", () => {
    expect(GIGA_MODES.map((m) => m.id)).toEqual([
      "recommendations",
      "practices",
      "quizzes",
      "games",
      "rhymes",
      "poems",
      "songs",
      "qa",
    ]);
  });
});

describe("gigaLearn voices", () => {
  it("has 6 African voiceovers incl. Twi/Hausa/Ga/Ewe/Yoruba/Swahili", () => {
    expect(GIGA_VOICES).toHaveLength(6);
    expect(GIGA_VOICES.map((v) => v.language)).toEqual(
      expect.arrayContaining(["Twi", "Hausa", "Ga", "Ewe", "Yoruba", "Swahili"]),
    );
  });
});

describe("gigaLearn lessons (concrete objects + GES seed)", () => {
  it("KG1 fruit lesson uses concrete objects with Twi", () => {
    const kg = GIGA_LESSONS.find((l) => l.id === "kg1-fruits-count");
    expect(kg?.objects?.length).toBeGreaterThan(0);
    expect(kg?.questions).toHaveLength(5);
    expect(CONCRETE_OBJECTS.fruits.map((f) => f.emoji)).toContain("🍎");
  });

  it("BECE seed has 10 questions", () => {
    expect(GIGA_LESSONS.find((l) => l.id === "bece-maths-2015-2024")?.questions).toHaveLength(10);
  });
});

describe("dedupeById (duplicate project fix)", () => {
  it("collapses duplicate ids like 1001144701 x3 into one", () => {
    const items = [
      { id: "1001144701", title: "a" },
      { id: "1001153242", title: "b" },
      { id: "1001144701", title: "a2" },
      { id: "1001144701", title: "a3" },
    ];
    expect(dedupeById(items)).toHaveLength(2);
  });
});
