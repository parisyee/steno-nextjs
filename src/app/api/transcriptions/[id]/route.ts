import { stenoFetch } from "@/lib/server";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: RouteContext<"/api/transcriptions/[id]">,
) {
  const { id } = await params;
  const upstream = await stenoFetch(`/transcriptions/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (upstream.status === 204) {
    return new Response(null, { status: 204 });
  }

  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
  });
}
