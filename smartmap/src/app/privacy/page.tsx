import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-6 sm:px-6 prose-sm">
      <h1 className="font-display text-3xl font-extrabold text-sm-primary dark:text-white">Privacy</h1>
      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
        {BRAND.name} protects location data, emergency contacts, and account information with secure APIs,
        encryption in transit, and African data-privacy aligned practices. Location sharing for SOS and family
        safety is explicit and user-controlled. You can use Guest Mode with reduced personal data.
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
        <li>OAuth sign-in via email, Google, Apple, or phone</li>
        <li>Optional MFA for account protection</li>
        <li>Rate-limited APIs and fraud detection on reports</li>
        <li>Cloud backups for saved places and safety profiles</li>
      </ul>
    </div>
  );
}
