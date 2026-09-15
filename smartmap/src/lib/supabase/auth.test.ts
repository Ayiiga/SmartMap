import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DEFAULT_POST_AUTH_PATH } from "@/lib/auth/constants";
import {
  getAuthCallbackUrl,
  getRequiredRedirectUrls,
  getSiteUrl,
} from "@/lib/supabase/site-url";

describe("site-url OAuth helpers", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("defaults site URL to localhost in server context", () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });

  it("uses NEXT_PUBLIC_APP_URL when set", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://smartmap.app/";
    expect(getSiteUrl()).toBe("https://smartmap.app");
  });

  it("ignores empty NEXT_PUBLIC_APP_URL and falls back to localhost", () => {
    process.env.NEXT_PUBLIC_APP_URL = "";
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });

  it("builds auth callback with redirect param", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://smartmap.app";
    expect(getAuthCallbackUrl(DEFAULT_POST_AUTH_PATH)).toBe(
      "https://smartmap.app/auth/callback?redirect=%2Fdashboard",
    );
  });

  it("includes localhost redirect URLs", () => {
    const urls = getRequiredRedirectUrls();
    expect(urls).toContain("http://localhost:3000/auth/callback");
  });

  it("includes production URL when configured", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://smartmap.app";
    const urls = getRequiredRedirectUrls();
    expect(urls).toContain("https://smartmap.app/auth/callback");
  });
});

describe("Google OAuth implementation", () => {
  it("auth callback route file exists in app router", async () => {
    const fs = await import("node:fs");
    expect(fs.existsSync("src/app/auth/callback/route.ts")).toBe(true);
  });

  it("Google sign-in button component exists", async () => {
    const fs = await import("node:fs");
    expect(fs.existsSync("src/components/auth/google-sign-in-button.tsx")).toBe(true);
  });
});
