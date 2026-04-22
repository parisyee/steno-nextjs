import type {
  SearchResponse,
  TranscribeResponse,
  TranscriptionsResponse,
} from "@/types/transcription";

async function asJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function uploadTranscription(file: File): Promise<TranscribeResponse> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/transcribe", { method: "POST", body });
  return asJson<TranscribeResponse>(res);
}

export async function listTranscriptions(params: {
  limit?: number;
  offset?: number;
} = {}): Promise<TranscriptionsResponse> {
  const qs = new URLSearchParams();
  if (params.limit != null) qs.set("limit", String(params.limit));
  if (params.offset != null) qs.set("offset", String(params.offset));
  const res = await fetch(`/api/transcriptions?${qs.toString()}`);
  return asJson<TranscriptionsResponse>(res);
}

export async function searchTranscriptions(
  q: string,
  limit = 20,
): Promise<SearchResponse> {
  const qs = new URLSearchParams({ q, limit: String(limit) });
  const res = await fetch(`/api/search?${qs.toString()}`);
  return asJson<SearchResponse>(res);
}

export async function deleteTranscription(id: string): Promise<void> {
  const res = await fetch(`/api/transcriptions/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Delete failed: ${res.status}`);
  }
}
