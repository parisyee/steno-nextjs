import { stenoFetch } from "@/lib/server";
import type { NextRequest } from "next/server";

export const maxDuration = 3600;
export const runtime = "nodejs";

// Server caps uploads at 2 GB (Gemini File API limit). With Cloud Run's
// HTTP/2 ingress the old 32 MB HTTP/1.1 cap no longer applies.
const MAX_BYTES = 2 * 1024 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BYTES) {
    return new Response(
      JSON.stringify({ detail: "File too large. Maximum size is 2 GB." }),
      { status: 413, headers: { "Content-Type": "application/json" } },
    );
  }

  const search = request.nextUrl.searchParams.toString();
  const path = search ? `/transcribe?${search}` : "/transcribe";

  // Stream the request body straight through to the upstream — no
  // formData() buffering. duplex: "half" is required by Node fetch
  // whenever the body is a stream.
  const upstream = await stenoFetch(path, {
    method: "POST",
    body: request.body,
    headers: {
      "content-type": request.headers.get("content-type") ?? "application/octet-stream",
      "content-length": String(contentLength),
    },
    duplex: "half",
  } as RequestInit & { duplex: "half" });

  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
  });
}
