export type SmartMapErrorCode =
  | "LOCATION_PERMISSION_DENIED"
  | "LOCATION_TIMEOUT"
  | "LOCATION_UNAVAILABLE"
  | "REVERSE_GEOCODE_FAILED"
  | "MAP_PROVIDER_FAILED"
  | "PLACES_API_FAILED"
  | "WEATHER_API_FAILED"
  | "SAFETY_FEED_FAILED"
  | "NETWORK_OFFLINE"
  | "AUTH_REQUIRED";

export class SmartMapError extends Error {
  readonly code: SmartMapErrorCode;
  readonly userMessage: string;
  readonly cause?: unknown;

  constructor(code: SmartMapErrorCode, userMessage: string, cause?: unknown) {
    super(userMessage);
    this.name = "SmartMapError";
    this.code = code;
    this.userMessage = userMessage;
    this.cause = cause;
  }
}

const USER_MESSAGES: Record<SmartMapErrorCode, string> = {
  LOCATION_PERMISSION_DENIED: "Location permission denied. Enable location in your browser settings.",
  LOCATION_TIMEOUT: "Location request timed out. Try moving outdoors or tap Refresh.",
  LOCATION_UNAVAILABLE: "Location services are turned off or unavailable on this device.",
  REVERSE_GEOCODE_FAILED: "Address unavailable — tap to retry",
  MAP_PROVIDER_FAILED: "Map is temporarily unavailable. Showing your last saved view.",
  PLACES_API_FAILED: "Nearby services are temporarily unavailable.",
  WEATHER_API_FAILED: "Weather data is temporarily unavailable.",
  SAFETY_FEED_FAILED: "Safety information is temporarily unavailable.",
  NETWORK_OFFLINE: "You're offline. Showing your last available map and location data.",
  AUTH_REQUIRED: "Sign in required for this feature.",
};

export function userMessageFor(code: SmartMapErrorCode): string {
  return USER_MESSAGES[code];
}

export function classifyFetchError(error: unknown, offline = false): SmartMapError {
  if (offline) {
    return new SmartMapError("NETWORK_OFFLINE", USER_MESSAGES.NETWORK_OFFLINE, error);
  }
  const message = error instanceof Error ? error.message : String(error);
  if (message === "Failed to fetch" || message.includes("NetworkError") || message.includes("aborted")) {
    return new SmartMapError("NETWORK_OFFLINE", USER_MESSAGES.NETWORK_OFFLINE, error);
  }
  return new SmartMapError("PLACES_API_FAILED", USER_MESSAGES.PLACES_API_FAILED, error);
}

export function classifyGeolocationError(error: GeolocationPositionError | Error): SmartMapError {
  if ("code" in error) {
    switch (error.code) {
      case 1:
        return new SmartMapError("LOCATION_PERMISSION_DENIED", USER_MESSAGES.LOCATION_PERMISSION_DENIED, error);
      case 2:
        return new SmartMapError("LOCATION_UNAVAILABLE", USER_MESSAGES.LOCATION_UNAVAILABLE, error);
      case 3:
        return new SmartMapError("LOCATION_TIMEOUT", USER_MESSAGES.LOCATION_TIMEOUT, error);
      default:
        break;
    }
  }
  const msg = error.message?.toLowerCase() ?? "";
  if (msg.includes("denied") || msg.includes("permission")) {
    return new SmartMapError("LOCATION_PERMISSION_DENIED", USER_MESSAGES.LOCATION_PERMISSION_DENIED, error);
  }
  if (msg.includes("timeout")) {
    return new SmartMapError("LOCATION_TIMEOUT", USER_MESSAGES.LOCATION_TIMEOUT, error);
  }
  return new SmartMapError("LOCATION_UNAVAILABLE", USER_MESSAGES.LOCATION_UNAVAILABLE, error);
}

export function logSmartMapError(code: SmartMapErrorCode, detail?: unknown): void {
  if (process.env.NODE_ENV === "production") return;
  console.warn(`[SmartMap:${code}]`, detail);
}
