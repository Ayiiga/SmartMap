"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LevelCardProps {
  number: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  description: string;
  href: string;
  locked?: boolean;
  progress?: number;
}

export function LevelCard({
  number,
  title,
  subtitle,
  icon,
  color,
  description,
  href,
  locked,
  progress = 0,
}: LevelCardProps) {
  return (
    <motion.div
      whileHover={locked ? {} : { scale: 1.02, y: -4 }}
      whileTap={locked ? {} : { scale: 0.98 }}
    >
      <Link
        href={locked ? "#" : href}
        className={cn(
          "block rounded-2xl border border-giga-border bg-white p-6 shadow-sm transition-all dark:bg-giga-surface dark:border-giga-border-dark",
          locked ? "opacity-60 cursor-not-allowed" : "hover:shadow-lg",
        )}
        aria-disabled={locked}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl shadow-md",
              color,
            )}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-giga-purple/10 px-2 py-0.5 text-xs font-bold text-giga-purple">
                Level {number}
              </span>
              {locked && <span className="text-xs">🔒</span>}
            </div>
            <h3 className="font-display mt-1 text-lg font-bold">{title}</h3>
            <p className="text-sm text-giga-purple font-medium">{subtitle}</p>
            <p className="mt-2 text-sm text-giga-muted line-clamp-2">{description}</p>
            {!locked && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-giga-muted mb-1">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-giga-border overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full bg-gradient-to-r", color)}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
