import type { Metadata } from "next";

export const metadata: Metadata = { title: "Careers" };

export default function CareersPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-6 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold text-sm-primary dark:text-white">Careers</h1>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
        Join Smart Map to build navigation, public safety, and AI tools for Africa. Roles span maps engineering,
        community trust & safety, partnerships, and design.
      </p>
      <a href="mailto:careers@smartmap.africa" className="mt-5 inline-block font-bold text-sm-primary">
        careers@smartmap.africa
      </a>
    </div>
  );
}
