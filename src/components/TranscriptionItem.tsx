"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronRight, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Transcription } from "@/types/transcription";

interface TranscriptionItemProps {
  transcription: Transcription;
}

export function TranscriptionItem({ transcription }: TranscriptionItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(transcription.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const created = new Date(transcription.created_at);
  const title = transcription.filename ?? "Untitled";

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 py-4">
        <div className="flex items-center gap-2">
          <button
            className="flex flex-1 items-center gap-2 text-left"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? (
              <ChevronDown className="size-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="size-4 text-muted-foreground" />
            )}
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium">{title}</p>
              <p className="text-xs text-muted-foreground">
                {created.toLocaleString()}
              </p>
            </div>
          </button>
          <Button size="sm" variant="ghost" onClick={copy}>
            {copied ? (
              <Check className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <p
          className={cn(
            "whitespace-pre-wrap text-sm text-foreground/90",
            !expanded && "line-clamp-3",
          )}
        >
          {transcription.text}
        </p>
      </CardContent>
    </Card>
  );
}
