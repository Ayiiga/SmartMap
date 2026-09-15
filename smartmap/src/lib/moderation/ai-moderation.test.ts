import { describe, expect, it } from "vitest";
import { moderateText, simpleHash } from "./ai-moderation";

describe("ai moderation", () => {
  it("flags spam and offensive content", () => {
    expect(moderateText("Buy now click here http://spam.example").label).toBe("spam");
    expect(moderateText("I hate this place").label).toBe("offensive");
  });

  it("detects duplicates via hash list", () => {
    const text = "Pothole near 37 hospital junction";
    const hash = simpleHash(text.toLowerCase());
    expect(moderateText(text, [hash]).label).toBe("duplicate");
  });

  it("returns clean for normal reviews", () => {
    const result = moderateText("Helpful staff and clear directions to the pharmacy.");
    expect(result.label).toBe("clean");
  });
});
