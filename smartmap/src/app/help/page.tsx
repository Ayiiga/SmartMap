import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Help" };

const FAQ = [
  {
    q: "How do I use Emergency SOS?",
    a: "Open Safety Center and tap SOS. Smart Map alerts your emergency contacts and attaches GPS when available.",
  },
  {
    q: "Can I use Smart Map offline?",
    a: "Yes — the PWA caches core shells and recent map data. Offline maps expand with background sync.",
  },
  {
    q: "Which country launches first?",
    a: "Ghana first, then expansion across all 54 African countries with local emergency numbers and languages.",
  },
  {
    q: "How do businesses get verified?",
    a: "Visit the Business Platform to claim a listing and submit verification documents for a trusted badge.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-6 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-sm-emerald">Help</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold text-sm-primary dark:text-white">
        How Smart Map works
      </h1>
      <ul className="mt-6 space-y-3">
        {FAQ.map((item) => (
          <li
            key={item.q}
            className="rounded-3xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep"
          >
            <p className="font-bold">{item.q}</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.a}</p>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm">
        Need more help?{" "}
        <Link href="/contact" className="font-bold text-sm-primary">
          Contact support
        </Link>
      </p>
    </div>
  );
}
