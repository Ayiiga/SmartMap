import { MediaPageShell } from "@/components/media/section-header";
import { GlassCard } from "@/components/ui/glass-card";
import { BRAND } from "@/lib/brand";
import type { ReactNode } from "react";

export function StaticPage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <MediaPageShell title={title} subtitle={subtitle}>
      <GlassCard className="prose prose-sm dark:prose-invert max-w-none">
        {children}
      </GlassCard>
      <p className="mt-6 text-center text-xs text-giga-muted">© {new Date().getFullYear()} {BRAND.name}</p>
    </MediaPageShell>
  );
}
