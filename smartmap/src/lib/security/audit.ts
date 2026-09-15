/**
 * Local audit log helpers for sensitive actions.
 * Production should ship these to a secure server sink.
 */

export interface AuditEvent {
  id: string;
  action: string;
  actor: string;
  at: string;
  meta?: Record<string, string>;
}

const KEY = "smart-map-audit-log";

export function appendAuditEvent(event: Omit<AuditEvent, "id" | "at">): void {
  if (typeof window === "undefined") return;
  try {
    const prev = listAuditEvents();
    const next: AuditEvent[] = [
      {
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
        ...event,
      },
      ...prev,
    ].slice(0, 100);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore quota / private mode
  }
}

export function listAuditEvents(): AuditEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuditEvent[]) : [];
  } catch {
    return [];
  }
}
