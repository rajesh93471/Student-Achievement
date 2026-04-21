const API_URL = process.env.NEXT_PUBLIC_API_URL || "/achieve/api";
const REQUEST_TIMEOUT_MS = 15_000;

type RequestOptions = RequestInit & {
  token?: string | null;
};

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  // Safe URL joining to prevent double-slash issues
  const baseUrl = API_URL.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const fullUrl = `${baseUrl}${cleanPath}`;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;

  try {
    response = await fetch(fullUrl, {
      ...options,
      headers,
      cache: "no-store",
      signal: options.signal || controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request timed out. Please check that the backend is running and responding.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }

  if (!response.ok) {
    let errorMessage = "Request failed";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
      
      // Handle validation errors which might be arrays
      if (Array.isArray(errorMessage)) {
        errorMessage = errorMessage.join(", ");
      }
    } catch (e) {
      errorMessage = `Error ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  if (response.headers.get("content-type")?.includes("application/json")) {
    return response.json();
  }

  return response as unknown as T;
}
