import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function GlassCard({
  children,
  className,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/30 bg-white/60 p-5 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-giga-surface/60",
        hover && "transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
