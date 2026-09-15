import Link from "next/link";
import { BRAND } from "@/lib/brand";

const FOOTER_LINKS = {
  Platform: [
    { href: "/breaking", label: "Breaking News" },
    { href: "/live-tv", label: "Live TV" },
    { href: "/live-radio", label: "Live Radio" },
    { href: "/videos", label: "Videos" },
    { href: "/trending", label: "Trending" },
  ],
  Coverage: [
    { href: "/africa", label: "Africa" },
    { href: "/world", label: "World" },
    { href: "/politics", label: "Politics" },
    { href: "/sports", label: "Sports" },
    { href: "/health", label: "Health" },
    { href: "/science", label: "Science" },
    { href: "/business", label: "Business" },
    { href: "/technology", label: "Technology" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/advertise", label: "Advertise" },
    { href: "/careers", label: "Careers" },
    { href: "/contact", label: "Contact" },
    { href: "/developers", label: "Developers" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/api-docs", label: "API" },
    { href: "/help", label: "Help" },
    { href: "/settings", label: "Settings" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-giga-border bg-gtv-deep text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gtv-purple to-gtv-cyan text-sm font-bold">
                GT
              </span>
              <span className="font-display text-xl font-bold">{BRAND.name}</span>
            </div>
            <p className="text-sm text-white/70">{BRAND.tagline}</p>
            <p className="mt-3 text-xs text-white/60">
              Part of the Giga ecosystem. News, sports, and live media across Africa and the world.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <p className="font-bold mb-3 text-gtv-gold">{title}</p>
              <ul className="space-y-2 text-sm text-white/70">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="hover:text-gtv-cyan transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/60">
          <p suppressHydrationWarning>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <p className="text-xs text-white/60">Monetization placeholders: AdSense · Premium · Sponsored · API Access</p>
        </div>
      </div>
    </footer>
  );
}
