const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

export class ApiRequestError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs = 15_000
): Promise<T> {
  if (!API_URL) {
    throw new ApiRequestError("EXPO_PUBLIC_API_URL is not configured.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!res.ok) {
      throw new ApiRequestError(`API error (${res.status})`, res.status);
    }

    return res.json() as Promise<T>;
  } catch (err) {
    if (err instanceof ApiRequestError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiRequestError("Request timed out");
    }
    throw new ApiRequestError(
      err instanceof Error ? err.message : "Unknown network error"
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export const isApiConfigured = Boolean(API_URL);
