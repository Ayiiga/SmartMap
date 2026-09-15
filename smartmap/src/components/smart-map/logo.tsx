import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
}

const sizes = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-14 w-14",
};

export function SmartMapLogo({ className, size = "md", showWordmark = false }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-sm-primary to-sm-emerald shadow-lg shadow-sm-primary/25",
          sizes[size],
        )}
        aria-hidden
      >
        <svg viewBox="0 0 48 48" className="h-[70%] w-[70%] text-white" fill="none">
          <path
            d="M24 6c-7.2 0-13 5.8-13 13 0 9.2 11 19.6 12.2 20.8a1.2 1.2 0 0 0 1.6 0C25.99 38.6 37 28.2 37 19c0-7.2-5.8-13-13-13z"
            fill="currentColor"
            opacity="0.95"
          />
          <circle cx="24" cy="19" r="7.5" fill="#0F4C81" />
          <path
            d="M23.2 14.5c2-.7 4 .2 4.7 2 1 2.3-.2 4-1 5.8-.4 1 .2 2 1.1 2.4 1.1.7 1.5 2 .9 3.1-.9 1.5-2.7 2-4.2 1.5-1.8-.4-2.4-2-2.2-3.8.2-1.3-.7-2.2-1.8-2.4-1.3-.2-2-1.5-1.3-2.7.7-1.3 2.2-2 3.8-1.9z"
            fill="#0E9F6E"
          />
          <path
            d="M24 27.5c2.8 1 4.8 2.8 4.8 5.2v1.6c-3 1.5-4.8 2.1-4.8 2.1s-1.8-.6-4.8-2.1v-1.6c0-2.4 2-4.2 4.8-5.2z"
            fill="#F59E0B"
          />
        </svg>
      </span>
      {showWordmark && (
        <span className="font-display font-extrabold tracking-tight text-sm-primary dark:text-white">
          Smart Map
        </span>
      )}
    </span>
  );
}
