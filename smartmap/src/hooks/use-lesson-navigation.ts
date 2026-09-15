"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { NextLessonTarget } from "@/lib/learning-path/next-lesson";

const AUTO_ADVANCE_MS = 2200;

export function useLessonNavigation() {
  const router = useRouter();
  const [nextTarget, setNextTarget] = useState<NextLessonTarget | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleAutoAdvance = useCallback(
    (target: NextLessonTarget | null, fallbackHref?: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (!target && !fallbackHref) return;

      setNextTarget(target);
      setIsAdvancing(true);

      timerRef.current = setTimeout(() => {
        router.push(target?.href ?? fallbackHref ?? "/");
      }, AUTO_ADVANCE_MS);
    },
    [router],
  );

  const cancelAutoAdvance = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsAdvancing(false);
    setNextTarget(null);
  }, []);

  return { nextTarget, isAdvancing, scheduleAutoAdvance, cancelAutoAdvance };
}
