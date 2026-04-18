import { stenoFetch } from "@/lib/server";
import type { NextRequest } from "next/server";

export const maxDuration = 600;
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
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
