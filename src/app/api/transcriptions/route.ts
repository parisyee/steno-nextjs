import { stenoFetch } from "@/lib/server";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.toString();
  const path = search ? `/transcriptions?${search}` : "/transcriptions";

  const upstream = await stenoFetch(path);
  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
  });
}
