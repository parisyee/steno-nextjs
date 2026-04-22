"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { SearchBar } from "@/components/SearchBar";
import { TranscriptionList } from "@/components/TranscriptionList";
import { UploadCard } from "@/components/UploadCard";
import { Button } from "@/components/ui/button";
import { listTranscriptions, searchTranscriptions } from "@/lib/api";
import type { Transcription } from "@/types/transcription";

const PAGE_SIZE = 20;

export default function Page() {
  const [items, setItems] = useState<Transcription[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Transcription[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { transcriptions } = await listTranscriptions({
          limit: PAGE_SIZE,
          offset: 0,
        });
        if (cancelled) return;
        setItems(transcriptions);
        setOffset(transcriptions.length);
        setHasMore(transcriptions.length === PAGE_SIZE);
      } catch (err) {
        if (cancelled) return;
        toast.error(err instanceof Error ? err.message : "Failed to load transcriptions");
      } finally {
        if (!cancelled) setListLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!query) return;
    let cancelled = false;
    (async () => {
      setSearchLoading(true);
      try {
        const { results } = await searchTranscriptions(query);
        if (!cancelled) setSearchResults(results);
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Search failed");
        }
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const { transcriptions } = await listTranscriptions({
        limit: PAGE_SIZE,
        offset,
      });
      setItems((prev) => [...prev, ...transcriptions]);
      setOffset(offset + transcriptions.length);
      setHasMore(transcriptions.length === PAGE_SIZE);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  }

  function handleUploaded(t: Transcription) {
    setItems((prev) => [t, ...prev]);
    setOffset((prev) => prev + 1);
  }

  const handleDeleted = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
    setSearchResults((prev) => prev.filter((t) => t.id !== id));
    setOffset((prev) => Math.max(0, prev - 1));
  }, []);

  const showSearch = query.length > 0;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold">Steno</h1>
        <p className="text-sm text-muted-foreground">
          Upload audio or video and get a transcript. Backed by the Steno API.
        </p>
      </header>

      <UploadCard onUploaded={handleUploaded} />

      <SearchBar onQueryChange={setQuery} />

      {showSearch ? (
        <TranscriptionList
          items={searchResults}
          loading={searchLoading}
          emptyMessage={searchLoading ? "Searching…" : `No matches for "${query}"`}
          onDeleted={handleDeleted}
        />
      ) : (
        <>
          <TranscriptionList
            items={items}
            loading={listLoading}
            emptyMessage="No transcriptions yet"
            onDeleted={handleDeleted}
          />
          {hasMore && !listLoading && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? "Loading…" : "Load more"}
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
