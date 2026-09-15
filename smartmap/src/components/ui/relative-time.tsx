"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow, format } from "date-fns";

/** Avoids SSR/client hydration mismatch for relative timestamps. */
export function RelativeTime({
  date,
  className,
}: {
  date: string | Date;
  className?: string;
}) {
  const iso = typeof date === "string" ? date : date.toISOString();
  const [label, setLabel] = useState(() => format(new Date(iso), "MMM d, yyyy"));

  useEffect(() => {
    setLabel(formatDistanceToNow(new Date(iso), { addSuffix: true }));
  }, [iso]);

  return (
    <span className={className} suppressHydrationWarning>
      {label}
    </span>
  );
}

/** Fixed UTC formatting — consistent between server and client. */
export function FixedDateTime({
  date,
  pattern = "EEE, MMM d · HH:mm",
  className,
}: {
  date: string | Date;
  pattern?: string;
  className?: string;
}) {
  const iso = typeof date === "string" ? date : date.toISOString();
  return (
    <span className={className} suppressHydrationWarning>
      {format(new Date(iso), pattern)}
    </span>
  );
}
