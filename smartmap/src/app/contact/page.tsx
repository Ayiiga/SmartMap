import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-6 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-sm-emerald">Contact</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold text-sm-primary dark:text-white">
        Talk to the Smart Map team
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{BRAND.mission}</p>
      <ul className="mt-6 space-y-3 text-sm">
        <li className="rounded-2xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep">
          <p className="font-bold">Partnerships</p>
          <a className="text-sm-primary" href="mailto:partners@smartmap.africa">
            partners@smartmap.africa
          </a>
        </li>
        <li className="rounded-2xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep">
          <p className="font-bold">Support</p>
          <a className="text-sm-primary" href="mailto:support@smartmap.africa">
            support@smartmap.africa
          </a>
        </li>
        <li className="rounded-2xl border border-sm-border bg-white p-4 dark:border-white/10 dark:bg-sm-primary-deep">
          <p className="font-bold">Safety & government</p>
          <a className="text-sm-primary" href="mailto:safety@smartmap.africa">
            safety@smartmap.africa
          </a>
        </li>
      </ul>
    </div>
  );
}
