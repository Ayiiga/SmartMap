import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-6 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold text-sm-primary dark:text-white">Terms</h1>
      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
        By using {BRAND.name}, you agree to use community reporting responsibly, respect verified place data,
        and understand that navigation and safety tools are decision-support aids — not a substitute for official
        emergency services. Always call local emergency numbers in life-threatening situations.
      </p>
    </div>
  );
}
