"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "success";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
}

const variants = {
  primary: "bg-gradient-to-r from-giga-purple to-giga-blue text-white shadow-lg shadow-giga-purple/25 hover:shadow-xl hover:shadow-giga-purple/30",
  secondary: "bg-gradient-to-r from-giga-orange to-giga-yellow text-white shadow-lg shadow-giga-orange/25",
  outline: "border-2 border-giga-purple text-giga-purple dark:text-giga-purple-light hover:bg-giga-purple/10",
  ghost: "text-giga-purple hover:bg-giga-purple/10",
  success: "bg-gradient-to-r from-giga-green to-giga-teal text-white shadow-lg",
};

const sizes = {
  sm: "px-4 py-2 text-sm min-h-[44px]",
  md: "px-6 py-3 text-base min-h-[48px]",
  lg: "px-8 py-4 text-lg min-h-[56px]",
  xl: "px-10 py-5 text-xl min-h-[64px] rounded-2xl",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className="inline-flex"
    >
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-giga-purple/40 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation",
          variants[variant],
          sizes[size],
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        )}
        {children}
      </button>
    </motion.div>
  );
}
