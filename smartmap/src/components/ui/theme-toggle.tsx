"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="touch-target flex items-center justify-center rounded-xl p-2.5 text-giga-muted hover:bg-gtv-purple/10"
      aria-label="Toggle dark mode"
      type="button"
    >
      {mounted && theme === "dark" ? (
        <Sun className="h-6 w-6" strokeWidth={2.25} />
      ) : (
        <Moon className="h-6 w-6" strokeWidth={2.25} />
      )}
    </button>
  );
}
