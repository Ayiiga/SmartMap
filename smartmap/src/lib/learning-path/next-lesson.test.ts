import { describe, it, expect } from "vitest";
import { getNextCurriculumLesson, getNextEcosystemLesson } from "@/lib/learning-path/next-lesson";

describe("next-lesson", () => {
  it("returns the next lesson in the same level", () => {
    const next = getNextCurriculumLesson("alphabet-a", "alphabet");
    expect(next).not.toBeNull();
    expect(next?.href).toContain("/learn/alphabet/");
  });

  it("returns null for the last lesson in a level with one lesson", () => {
    const next = getNextCurriculumLesson("phonics-cvc-a", "phonics");
    expect(next).toBeNull();
  });

  it("returns next ecosystem lesson", () => {
    const next = getNextEcosystemLesson("gigascience", "science-plants");
    expect(next?.href).toBe("/ecosystems/gigascience/solar-system");
    expect(next?.title).toBe("Our Solar System");
  });
});
