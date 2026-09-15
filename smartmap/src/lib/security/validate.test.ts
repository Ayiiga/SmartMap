import { describe, expect, it } from "vitest";
import { sanitizeText, isValidPhone, isValidCoord } from "./validate";
import { rateLimit } from "./rate-limit";

describe("security helpers", () => {
  it("sanitizes and truncates text", () => {
    expect(sanitizeText("  hello\u0000 world  ", 20)).toBe("hello world");
    expect(sanitizeText("x".repeat(100), 10)).toHaveLength(10);
  });

  it("validates phones and coordinates", () => {
    expect(isValidPhone("+233 24 000 0000")).toBe(true);
    expect(isValidPhone("abc")).toBe(false);
    expect(isValidCoord(5.6, -0.18)).toBe(true);
    expect(isValidCoord(200, 0)).toBe(false);
  });

  it("rate limits repeated keys", () => {
    const key = `test-${Date.now()}`;
    for (let i = 0; i < 3; i += 1) {
      expect(rateLimit(key, 3, 60_000).ok).toBe(true);
    }
    expect(rateLimit(key, 3, 60_000).ok).toBe(false);
  });
});
