import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Developers" };

export default function DevelopersPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-6 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold text-sm-primary dark:text-white">Developers</h1>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
        Build on Smart Map with place search, safety alerts, and partner API access for governments, NGOs, and businesses.
      </p>
      <Link href="/api-docs" className="mt-5 inline-block font-bold text-sm-primary">
        View API docs →
      </Link>
    </div>
  );
}
