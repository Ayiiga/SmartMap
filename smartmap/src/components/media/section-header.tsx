import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function SectionHeader({
  title,
  subtitle,
  href,
  className,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 sm:mb-8 flex items-end justify-between gap-4", className)}>
      <div>
        <h2 className="font-display text-[1.65rem] font-extrabold leading-tight sm:text-3xl lg:text-4xl">{title}</h2>
        {subtitle && <p className="mt-2 text-base text-giga-muted sm:text-lg">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1.5 text-base font-bold text-gtv-purple hover:underline shrink-0 min-h-[44px]"
        >
          View all <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
        </Link>
      )}
    </div>
  );
}

export function MediaPageShell({
  title,
  subtitle,
  children,
  hero,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  hero?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      {hero ?? (
        <header className="mb-8">
          <h1 className="font-display text-[1.85rem] font-extrabold sm:text-4xl bg-gradient-to-r from-gtv-deep via-gtv-purple to-gtv-cyan bg-clip-text text-transparent">
            {title}
          </h1>
          {subtitle && <p className="mt-3 text-base text-giga-muted max-w-2xl sm:text-lg">{subtitle}</p>}
        </header>
      )}
      {children}
    </div>
  );
}
