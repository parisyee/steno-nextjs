export interface Transcription {
  id: string;
  filename: string | null;
  title: string | null;
  description: string | null;
  text: string;
  cleaned_polished: string | null;
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

export function hasPolishedVariant(t: Transcription): boolean {
  return Boolean(t.cleaned_polished && t.cleaned_polished.length > 0);
}
