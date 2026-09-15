import { cn } from "@/lib/utils";

type AdSlot = "banner" | "sidebar" | "in-feed" | "sponsored";

const SLOT_LABELS: Record<AdSlot, string> = {
  banner: "Display Ad",
  sidebar: "Sidebar Ad",
  "in-feed": "In-Feed Sponsored",
  sponsored: "Sponsored Content",
};

interface AdPlaceholderProps {
  slot?: AdSlot;
  className?: string;
}

/** Non-disruptive monetization placeholder — ready for AdSense / direct sponsorship */
export function AdPlaceholder({ slot = "banner", className }: AdPlaceholderProps) {
  return (
    <aside
      role="complementary"
      aria-label={`${SLOT_LABELS[slot]} placeholder`}
      className={cn(
        "flex items-center justify-center rounded-2xl border border-dashed border-giga-border bg-giga-surface/50 text-center dark:border-giga-border-dark",
        slot === "banner" && "min-h-[90px] px-4 py-6",
        slot === "sidebar" && "min-h-[250px] px-4 py-8",
        slot === "in-feed" && "min-h-[120px] px-4 py-6",
        slot === "sponsored" && "min-h-[100px] px-4 py-5",
        className,
      )}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-giga-muted">{SLOT_LABELS[slot]}</p>
        <p className="mt-1 text-[11px] text-giga-muted/80">AdSense · Premium · Sponsored</p>
      </div>
    </aside>
  );
}
