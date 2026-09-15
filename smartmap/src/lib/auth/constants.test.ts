import { describe, it, expect } from "vitest";
import { DEFAULT_POST_AUTH_PATH, normalizeRedirectPath } from "@/lib/auth/constants";

describe("auth constants", () => {
  it("defaults post-auth path to dashboard", () => {
    expect(DEFAULT_POST_AUTH_PATH).toBe("/dashboard");
  });

  it("normalizes redirect paths safely", () => {
    expect(normalizeRedirectPath("/profile")).toBe("/profile");
    expect(normalizeRedirectPath(null)).toBe(DEFAULT_POST_AUTH_PATH);
    expect(normalizeRedirectPath("//evil.com")).toBe(DEFAULT_POST_AUTH_PATH);
    expect(normalizeRedirectPath("https://evil.com")).toBe(DEFAULT_POST_AUTH_PATH);
  });
});
