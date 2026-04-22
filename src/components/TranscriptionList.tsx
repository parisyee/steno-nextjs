"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { TranscriptionItem } from "@/components/TranscriptionItem";
import type { Transcription } from "@/types/transcription";

interface TranscriptionListProps {
  items: Transcription[];
  loading: boolean;
  emptyMessage: string;
  onDeleted: (id: string) => void;
}

export function TranscriptionList({
  items,
  loading,
  emptyMessage,
  onDeleted,
}: TranscriptionListProps) {
  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((t) => (
        <TranscriptionItem key={t.id} transcription={t} onDeleted={onDeleted} />
      ))}
    </div>
  );
}
