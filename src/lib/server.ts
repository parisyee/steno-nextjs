import "server-only";

export async function stenoFetch(path: string, init?: RequestInit) {
  const apiUrl = process.env.STENO_API_URL;
  const apiKey = process.env.STENO_API_KEY;

  if (!apiUrl) {
    throw new Error("STENO_API_URL is not set");
  }

  const headers = new Headers(init?.headers);
  if (apiKey) headers.set("Authorization", `Bearer ${apiKey}`);

  return fetch(`${apiUrl}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}
