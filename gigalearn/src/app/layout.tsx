import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";
import { ThemeProvider, OnlineStatusProvider } from "@/components/providers/app-providers";
import { AuthOfflineBridge } from "@/components/providers/auth-offline-bridge";
import { MonitoringProvider } from "@/components/providers/monitoring-provider";
import { AppShell } from "@/components/smart-map/app-shell";
import { BRAND } from "@/lib/brand";
import "./globals.css";

const interFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.description,
  keywords: [
    "Smart Map",
    "Africa maps",
    "Ghana navigation",
    "public safety",
    "emergency SOS",
    "AI navigation",
    "trusted places",
    "community reporting",
    "PWA",
  ],
  authors: [{ name: BRAND.name }],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: BRAND.shortName,
    startupImage: [
      {
        url: "/splash.png",
        media: "(device-width: 390px) and (device-height: 844px)",
      },
    ],
  },
  openGraph: {
    title: BRAND.name,
    description: BRAND.tagline,
    type: "website",
    siteName: BRAND.name,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: BRAND.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND.name,
    description: BRAND.tagline,
    creator: BRAND.twitter,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0A1931" },
    { media: "(prefers-color-scheme: dark)", color: "#0A1931" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${interFont.variable} antialiased bg-[#0A0F1E] text-white`} style={{ fontFamily: "var(--font-body), Inter, sans-serif" }}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <OnlineStatusProvider>
            <AuthOfflineBridge />
            <MonitoringProvider />
            <AppShell>{children}</AppShell>
            {process.env.NEXT_PUBLIC_VERCEL_ENV ? <Analytics /> : null}
          </OnlineStatusProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
