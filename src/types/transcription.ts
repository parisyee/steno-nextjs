export interface Cleaned {
  light: string | null;
  polished: string | null;
}

export interface Transcription {
  id: string;
  filename: string | null;
  title: string | null;
  description: string | null;
  text: string;
  cleaned: Cleaned | null;
  created_at: string;
}

export interface TranscriptionsResponse {
  transcriptions: Transcription[];
}

export interface SearchResponse {
  results: Transcription[];
}

export type TranscribeResponse = Transcription;

export function displayTitle(t: Transcription): string {
  if (t.title && t.title.length > 0) return t.title;
  if (t.filename && t.filename.length > 0) return t.filename;
  return "Untitled";
}

export function hasCleanedVariants(t: Transcription): boolean {
  const c = t.cleaned;
  if (!c) return false;
  return Boolean((c.light && c.light.length > 0) || (c.polished && c.polished.length > 0));
}
