"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { type Transcription, displayTitle } from "@/types/transcription";

type FileType = "pdf" | "txt";

interface DownloadDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  transcription: Transcription;
}

export function DownloadDialog({
  open,
  onOpenChange,
  transcription,
}: DownloadDialogProps) {
  const hasDescription = Boolean(
    transcription.description && transcription.description.length > 0,
  );
  const hasPolished = Boolean(
    transcription.cleaned_polished && transcription.cleaned_polished.length > 0,
  );

  const [filename, setFilename] = useState(() => displayTitle(transcription));
  const [fileType, setFileType] = useState<FileType>("pdf");
  const [includeDescription, setIncludeDescription] = useState(hasDescription);
  const [includeRaw, setIncludeRaw] = useState(true);
  const [includePolished, setIncludePolished] = useState(hasPolished);
  const [downloading, setDownloading] = useState(false);

  const trimmedName = filename.trim();
  const nothingSelected =
    !(hasDescription && includeDescription) &&
    !includeRaw &&
    !(hasPolished && includePolished);
  const canDownload = trimmedName.length > 0 && !nothingSelected && !downloading;

  function buildSections(): { heading: string; body: string }[] {
    const sections: { heading: string; body: string }[] = [];
    if (hasDescription && includeDescription) {
      sections.push({
        heading: "Description",
        body: transcription.description ?? "",
      });
    }
    if (includeRaw) {
      sections.push({ heading: "Transcript", body: transcription.text });
    }
    if (hasPolished && includePolished) {
      sections.push({
        heading: "Polished",
        body: transcription.cleaned_polished ?? "",
      });
    }
    return sections;
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      const sections = buildSections();
      const safeName = sanitizeFilename(trimmedName);
      if (fileType === "txt") {
        downloadTxt(safeName, displayTitle(transcription), sections);
      } else {
        await downloadPdf(safeName, displayTitle(transcription), sections);
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md sm:max-w-md">
        <DialogHeader className="pr-8">
          <DialogTitle>Download transcript</DialogTitle>
          <DialogDescription>
            Choose a format and which sections to include.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Field label="File name">
            <Input
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="File name"
            />
          </Field>

          <Field label="Format">
            <div
              role="radiogroup"
              className="inline-flex w-fit gap-1 rounded-lg border bg-muted/40 p-0.5"
            >
              {(["pdf", "txt"] as FileType[]).map((ft) => (
                <button
                  key={ft}
                  role="radio"
                  aria-checked={fileType === ft}
                  onClick={() => setFileType(ft)}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-medium uppercase transition-colors",
                    fileType === ft
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {ft}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Include">
            <div className="flex flex-col gap-2">
              {hasDescription && (
                <CheckboxRow
                  checked={includeDescription}
                  onChange={setIncludeDescription}
                  label="Description"
                />
              )}
              <CheckboxRow
                checked={includeRaw}
                onChange={setIncludeRaw}
                label="Raw transcript"
              />
              {hasPolished && (
                <CheckboxRow
                  checked={includePolished}
                  onChange={setIncludePolished}
                  label="Polished transcript"
                />
              )}
            </div>
          </Field>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={downloading}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleDownload} disabled={!canDownload}>
            {downloading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
            {downloading ? "Preparing…" : "Download"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function CheckboxRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded border-input"
      />
      {label}
    </label>
  );
}

function sanitizeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]+/g, "_").replace(/\s+/g, " ").trim();
}

function downloadTxt(
  filename: string,
  title: string,
  sections: { heading: string; body: string }[],
) {
  const parts = [title, ""];
  sections.forEach((s, i) => {
    if (i > 0) parts.push("", "---", "");
    parts.push(s.heading, "", s.body);
  });
  const blob = new Blob([parts.join("\n")], { type: "text/plain" });
  triggerDownload(blob, `${filename}.txt`);
}

async function downloadPdf(
  filename: string,
  title: string,
  sections: { heading: string; body: string }[],
) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" });

  const marginX = 54;
  const marginTop = 54;
  const marginBottom = 54;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - marginX * 2;
  let cursorY = marginTop;

  function ensureSpace(height: number) {
    if (cursorY + height > pageHeight - marginBottom) {
      doc.addPage();
      cursorY = marginTop;
    }
  }

  function writeBlock(text: string, size: number, bold: boolean, gap: number) {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, contentWidth) as string[];
    const lineHeight = size * 1.3;
    for (const line of lines) {
      ensureSpace(lineHeight);
      doc.text(line, marginX, cursorY);
      cursorY += lineHeight;
    }
    cursorY += gap;
  }

  writeBlock(title, 18, true, 12);

  sections.forEach((section, i) => {
    if (i > 0) cursorY += 6;
    writeBlock(section.heading, 13, true, 6);
    writeBlock(section.body || "", 11, false, 8);
  });

  doc.save(`${filename}.pdf`);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
