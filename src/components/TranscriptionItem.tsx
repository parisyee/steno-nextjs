"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteTranscription } from "@/lib/api";
import { cn, formatRelative } from "@/lib/utils";
import {
  type Transcription,
  displayTitle,
  hasPolishedVariant,
} from "@/types/transcription";

type Variant = "raw" | "polished";

const VARIANT_LABEL: Record<Variant, string> = {
  raw: "Raw",
  polished: "Polished",
};

interface TranscriptionItemProps {
  transcription: Transcription;
  onDeleted: (id: string) => void;
}

export function TranscriptionItem({ transcription, onDeleted }: TranscriptionItemProps) {
  const [open, setOpen] = useState(false);

  const title = displayTitle(transcription);
  const created = useMemo(() => new Date(transcription.created_at), [transcription.created_at]);

  return (
    <>
      <Card
        className="cursor-pointer transition-colors hover:bg-accent/40"
        onClick={() => setOpen(true)}
      >
        <CardContent className="flex flex-col gap-1 py-4">
          <p className="truncate font-medium">{title}</p>
          {transcription.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {transcription.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground/80">
            {formatRelative(created)}
          </p>
        </CardContent>
      </Card>

      <TranscriptionDetailDialog
        open={open}
        onOpenChange={setOpen}
        transcription={transcription}
        onDeleted={(id) => {
          setOpen(false);
          onDeleted(id);
        }}
      />
    </>
  );
}

interface TranscriptionDetailDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  transcription: Transcription;
  onDeleted: (id: string) => void;
}

function TranscriptionDetailDialog({
  open,
  onOpenChange,
  transcription,
  onDeleted,
}: TranscriptionDetailDialogProps) {
  const [variant, setVariant] = useState<Variant>("raw");
  const [copied, setCopied] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const title = displayTitle(transcription);
  const created = new Date(transcription.created_at);

  const availableVariants: Variant[] = useMemo(() => {
    const v: Variant[] = ["raw"];
    if (transcription.cleaned_polished) v.push("polished");
    return v;
  }, [transcription.cleaned_polished]);

  const showVariantPicker = hasPolishedVariant(transcription) && availableVariants.length > 1;

  const currentText =
    variant === "raw"
      ? transcription.text
      : (transcription.cleaned_polished ?? transcription.text);

  async function copy() {
    await navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await deleteTranscription(transcription.id);
      toast.success("Deleted");
      onDeleted(transcription.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          setVariant("raw");
          setConfirmingDelete(false);
        }
      }}
    >
      <DialogContent className="flex max-h-[85vh] w-full max-w-2xl flex-col gap-4 sm:max-w-2xl">
        <DialogHeader className="pr-8">
          <DialogTitle className="text-lg">{title}</DialogTitle>
          <DialogDescription>
            {created.toLocaleString()}
          </DialogDescription>
          {transcription.description && (
            <p className="pt-2 text-sm text-muted-foreground">
              {transcription.description}
            </p>
          )}
        </DialogHeader>

        {showVariantPicker && (
          <div
            role="tablist"
            className="inline-flex w-fit gap-1 rounded-lg border bg-muted/40 p-0.5"
          >
            {availableVariants.map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={variant === v}
                onClick={() => setVariant(v)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                  variant === v
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {VARIANT_LABEL[v]}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto rounded-md border bg-muted/20 p-4">
          <p className="whitespace-pre-wrap text-sm text-foreground/90">
            {currentText}
          </p>
        </div>

        <DialogFooter className="-mx-4 -mb-4 flex flex-row items-center justify-between gap-2 rounded-b-xl border-t bg-muted/50 p-4">
          {confirmingDelete ? (
            <>
              <span className="text-sm text-muted-foreground">Delete this transcription?</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={confirmDelete}
                  disabled={deleting}
                >
                  {deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                  {deleting ? "Deleting…" : "Delete"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setConfirmingDelete(true)}
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button>
              <Button variant="outline" size="sm" onClick={copy}>
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
