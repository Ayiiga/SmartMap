import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function resolvePublicSupabaseKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.ANON_PUBLIC_KEY?.trim() ||
    ""
  );
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  env: {
    // Bridge Cursor/Vercel secret names into the NEXT_PUBLIC_* vars the client bundle expects.
    NEXT_PUBLIC_SUPABASE_ANON_KEY: resolvePublicSupabaseKey(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: resolvePublicSupabaseKey(),
  },
  async headers() {
    return [
      {
        source: "/icons/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/manifest.json",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  async redirects() {
    return [
      // Legacy education routes
      { source: "/learn", destination: "/", permanent: false },
      { source: "/learn/:path*", destination: "/", permanent: false },
      { source: "/gigaphonics", destination: "/search", permanent: false },
      { source: "/gigamath", destination: "/navigate", permanent: false },
      { source: "/ai-tutor", destination: "/ai-assistant", permanent: false },
      { source: "/quests", destination: "/dashboard", permanent: false },
      { source: "/progress", destination: "/profile", permanent: false },
      { source: "/achievements", destination: "/profile", permanent: false },
      { source: "/games", destination: "/", permanent: false },
      { source: "/stories", destination: "/community", permanent: false },
      { source: "/vocabulary", destination: "/search", permanent: false },
      { source: "/grammar", destination: "/search", permanent: false },
      { source: "/parents", destination: "/about", permanent: false },
      { source: "/teachers", destination: "/about", permanent: false },
      { source: "/ecosystems/:path*", destination: "/", permanent: false },
      { source: "/certificates", destination: "/profile", permanent: false },
      // Legacy GigaTrend TV / media routes → Smart Map
      { source: "/breaking", destination: "/community", permanent: false },
      { source: "/live-tv", destination: "/", permanent: false },
      { source: "/watch", destination: "/navigate", permanent: false },
      { source: "/live-radio", destination: "/", permanent: false },
      { source: "/videos", destination: "/search", permanent: false },
      { source: "/trending", destination: "/dashboard", permanent: false },
      { source: "/sports", destination: "/navigate", permanent: false },
      { source: "/world-cup-2026", destination: "/", permanent: false },
      { source: "/entertainment", destination: "/search", permanent: false },
      { source: "/technology", destination: "/search", permanent: false },
      { source: "/africa", destination: "/dashboard/admin", permanent: false },
      { source: "/world", destination: "/search", permanent: false },
      { source: "/politics", destination: "/community", permanent: false },
      { source: "/health", destination: "/search", permanent: false },
      { source: "/science", destination: "/weather", permanent: false },
      { source: "/news/:slug*", destination: "/community", permanent: false },
    ];
  },
  ...(isGithubPages
    ? {
        output: "export",
        trailingSlash: true,
        basePath: basePath || undefined,
        assetPrefix: basePath || undefined,
      }
    : {}),
  images: {
    unoptimized: isGithubPages,
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "tiles.openfreemap.org" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{kebabCase member}}",
    },
  },
};

const withPwaConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development" || isGithubPages,
  register: true,
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
    navigateFallback: "/offline",
    navigateFallbackDenylist: [/^\/api\//, /^\/_next\/data\//],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "supabase-api",
          expiration: { maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 },
        },
      },
      {
        urlPattern: /\/api\/geo\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "ghana-pois",
          expiration: { maxEntries: 128, maxAgeSeconds: 7 * 24 * 60 * 60 },
        },
      },
      {
        urlPattern: /\/api\/routing\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "routing-cache",
          networkTimeoutSeconds: 8,
          expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
        },
      },
      {
        urlPattern: /^https:\/\/tiles\.openfreemap\.org\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "map-tiles",
          expiration: { maxEntries: 512, maxAgeSeconds: 14 * 24 * 60 * 60 },
        },
      },
      {
        urlPattern: /^https:\/\/server\.arcgisonline\.com\/ArcGIS\/rest\/services\/World_Imagery\/MapServer\/tile\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "satellite-tiles",
          expiration: { maxEntries: 128, maxAgeSeconds: 14 * 24 * 60 * 60 },
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-images",
          expiration: { maxEntries: 128, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
      },
      {
        urlPattern: /\.(?:js|css)$/i,
        handler: "StaleWhileRevalidate",
        options: { cacheName: "static-assets" },
      },
    ],
  },
});

const config = isGithubPages ? nextConfig : withPwaConfig(nextConfig);

if (!isGithubPages && process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}

export default config;
