export interface FetchRetryOptions extends RequestInit {
  retries?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "NetworkError";
  }
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  input: RequestInfo | URL,
  options: FetchRetryOptions = {},
): Promise<Response> {
  const { retries = 3, retryDelayMs = 800, timeoutMs = 15000, ...init } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });

      if (!response.ok && response.status >= 500 && attempt < retries) {
        await sleep(retryDelayMs * (attempt + 1));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await sleep(retryDelayMs * (attempt + 1));
        continue;
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new NetworkError("Network request failed after retries", undefined, lastError);
}

export async function fetchJsonWithRetry<T>(
  input: RequestInfo | URL,
  options?: FetchRetryOptions,
): Promise<T> {
  const response = await fetchWithRetry(input, options);
  if (!response.ok) {
    throw new NetworkError(`Request failed with status ${response.status}`, response.status);
  }
  return response.json() as Promise<T>;
}
