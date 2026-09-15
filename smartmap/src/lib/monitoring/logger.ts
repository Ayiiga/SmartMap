type LogLevel = "info" | "warn" | "error";

interface LogPayload {
  level?: LogLevel;
  event: string;
  message?: string;
  context?: Record<string, unknown>;
}

const SENSITIVE_KEYS = /password|token|secret|apikey|authorization|cookie|session/i;

function sanitizeContext(context?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!context) return undefined;
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    if (SENSITIVE_KEYS.test(key)) {
      safe[key] = "[redacted]";
    } else if (typeof value === "string" && value.length > 200) {
      safe[key] = `${value.slice(0, 200)}…`;
    } else {
      safe[key] = value;
    }
  }
  return safe;
}

export function logClientError(event: string, context?: Record<string, unknown>) {
  void logEvent({ level: "error", event, context });
}

export function logClientInfo(event: string, context?: Record<string, unknown>) {
  void logEvent({ level: "info", event, context });
}

export async function logEvent({ level = "info", event, message, context }: LogPayload) {
  const entry = {
    level,
    event,
    message,
    context: sanitizeContext(context),
    timestamp: new Date().toISOString(),
    path: typeof window !== "undefined" ? window.location.pathname : undefined,
    online: typeof navigator !== "undefined" ? navigator.onLine : undefined,
  };

  if (process.env.NODE_ENV === "development") {
    const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.info;
    fn("[SmartMap]", entry);
  }

  if (typeof window === "undefined") return;

  try {
    await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
      keepalive: true,
    });
  } catch {
    // Never block UX on logging failures
  }
}

export function registerGlobalErrorHandlers() {
  if (typeof window === "undefined") return;

  window.addEventListener("unhandledrejection", (event) => {
    logClientError("unhandled_promise_rejection", {
      reason: event.reason instanceof Error ? event.reason.message : String(event.reason),
    });
  });

  window.addEventListener("error", (event) => {
    logClientError("client_exception", {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
    });
  });
}
