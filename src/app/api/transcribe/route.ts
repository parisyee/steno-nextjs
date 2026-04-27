import { stenoFetch } from "@/lib/server";
import type { NextRequest } from "next/server";

export const maxDuration = 600;
export const runtime = "nodejs";

// Cloud Run's managed ingress caps request bodies at 32 MB; 25 MB leaves
// headroom for multipart overhead. Larger files need the signed-URL/GCS
// upload path (not yet implemented).
const MAX_BYTES = 25 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BYTES) {
    return new Response(
      JSON.stringify({ detail: "File too large. Maximum size is 25 MB." }),
      { status: 413, headers: { "Content-Type": "application/json" } },
    );
  }

  const formData = await request.formData();

  const search = request.nextUrl.searchParams.toString();
  const path = search ? `/transcribe?${search}` : "/transcribe";

  const upstream = await stenoFetch(path, {
    method: "POST",
    body: formData,
  });

  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
  });
}
