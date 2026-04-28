"use client";

import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { uploadTranscription } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Transcription } from "@/types/transcription";

interface UploadCardProps {
  onUploaded: (t: Transcription) => void;
}

// Server caps uploads at 2 GB (Gemini File API limit). With Cloud Run's
// HTTP/2 ingress the old 32 MB HTTP/1.1 cap no longer applies.
const MAX_FILE_BYTES = 2 * 1024 * 1024 * 1024;
const MAX_FILE_LABEL = "2 GB";

export function UploadCard({ onUploaded }: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File) {
    if (file.size > MAX_FILE_BYTES) {
      toast.error(`File too large. Maximum size is ${MAX_FILE_LABEL}.`);
      return;
    }
    setUploading(true);
    const toastId = toast.loading(`Transcribing ${file.name}…`);
    try {
      const transcription = await uploadTranscription(file);
      onUploaded(transcription);
      toast.success("Transcription complete", { id: toastId });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast.error(message, { id: toastId });
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card
      className={cn(
        "border-dashed transition-colors",
        dragging && "border-primary bg-accent/30",
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) void handleFile(file);
      }}
    >
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        {uploading ? (
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        ) : (
          <Upload className="size-8 text-muted-foreground" />
        )}
        <div>
          <p className="font-medium">
            {uploading ? "Uploading…" : "Drop an audio or video file"}
          </p>
          <p className="text-sm text-muted-foreground">
            .m4a, .mp3, .wav, .mp4, .mov, and more &mdash; up to {MAX_FILE_LABEL}
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="audio/*,video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
        <Button
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          Choose file
        </Button>
      </CardContent>
    </Card>
  );
}
