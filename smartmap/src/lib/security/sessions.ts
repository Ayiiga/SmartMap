/**
 * MFA and device session helpers (client-safe stubs).
 * Secrets never leave the auth provider; this only tracks local UI state shape.
 */

export interface DeviceSession {
  id: string;
  label: string;
  lastActiveAt: string;
  current: boolean;
}

export interface MfaStatus {
  enabled: boolean;
  methods: Array<"totp" | "sms" | "email">;
}

export function defaultMfaStatus(): MfaStatus {
  return { enabled: false, methods: [] };
}

export function listDeviceSessions(): DeviceSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("smart-map-device-sessions");
    if (!raw) {
      const seed: DeviceSession[] = [
        {
          id: "current",
          label: "This device",
          lastActiveAt: new Date().toISOString(),
          current: true,
        },
      ];
      localStorage.setItem("smart-map-device-sessions", JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as DeviceSession[];
  } catch {
    return [];
  }
}
