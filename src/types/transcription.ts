export interface Transcription {
  id: string;
  filename: string | null;
  text: string;
  created_at: string;
}

export interface TranscriptionsResponse {
  transcriptions: Transcription[];
}

export interface SearchResponse {
  results: Transcription[];
}

export interface TranscribeResponse {
  id: string;
  text: string;
}
