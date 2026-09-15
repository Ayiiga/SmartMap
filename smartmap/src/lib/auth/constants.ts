/** Default path after successful sign-in or sign-up. */
export const DEFAULT_POST_AUTH_PATH = "/dashboard";

/** Normalize a redirect path — only allow same-origin relative paths. */
export function normalizeRedirectPath(path: string | null | undefined): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return DEFAULT_POST_AUTH_PATH;
  }
  return path;
}
