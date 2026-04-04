const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/achieve";

type RequestOptions = RequestInit & {
  token?: string | null;
};

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  if (response.headers.get("content-type")?.includes("application/json")) {
    return response.json();
  }

  return response as unknown as T;
}
