"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { ArrowDown, ArrowUp, Download, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileUploader, type UploadedFile } from "./FileUploader";
import { downloadBytes, shortId } from "@/lib/download";

type PdfEntry = UploadedFile & { pageCount: number };

/**
 * Merge PDF tool.
 * Uses pdf-lib to copy pages from multiple PDFs into a single document.
 * Users can reorder files in the list before merging.
 */
export function MergePdfTool() {
  const [files, setFiles] = useState<PdfEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesAdded = async (newFiles: File[]) => {
    const pdfs = newFiles.filter(
      (f) => f.type === "application/pdf" || /\.pdf$/i.test(f.name)
    );
    if (pdfs.length < newFiles.length) {
      setError("Some files were skipped — only PDF files are supported.");
    } else {
      setError(null);
    }
    // Read page counts for display
    const entries: PdfEntry[] = [];
    for (const f of pdfs) {
      try {
        const buf = await f.arrayBuffer();
        const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
        entries.push({
          file: f,
          id: shortId(),
          pageCount: doc.getPageCount(),
        });
      } catch {
        entries.push({ file: f, id: shortId(), pageCount: 0 });
      }
    }
    setFiles((prev) => [...prev, ...entries]);
    setOutputUrl(null);
  };

  const handleRemove = (id: string) =>
    setFiles((prev) => prev.filter((f) => f.id !== id));

  const move = (index: number, direction: "up" | "down") => {
    setFiles((prev) => {
      const next = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError("Add at least two PDFs to merge.");
      return;
    }
    setIsProcessing(true);
    setError(null);
    setOutputUrl(null);
    try {
      const merged = await PDFDocument.create();
      for (const entry of files) {
        const buf = await entry.file.arrayBuffer();
        const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const bytes = await merged.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      setOutputUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      setError("Failed to merge PDFs. One of the files may be corrupted or encrypted.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      <FileUploader
        accept="application/pdf,.pdf"
        multiple
        files={files}
        onFilesAdded={handleFilesAdded}
        onFileRemove={handleRemove}
        hint="Add two or more PDF files. Reorder them below before merging."
        disabled={isProcessing}
      />

      {files.length > 1 && (
        <ol className="space-y-2">
          {files.map((f, i) => (
            <li
              key={f.id}
              className="flex items-center gap-3 rounded-lg border bg-card p-3 text-sm"
            >
              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{f.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {f.pageCount > 0 ? `${f.pageCount} pages` : "unreadable"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Move up"
                  disabled={i === 0 || isProcessing}
                  onClick={() => move(i, "up")}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Move down"
                  disabled={i === files.length - 1 || isProcessing}
                  onClick={() => move(i, "down")}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Remove"
                  disabled={isProcessing}
                  onClick={() => handleRemove(f.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ol>
      )}

      {error && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button
        onClick={handleMerge}
        disabled={files.length < 2 || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isProcessing ? "Merging..." : `Merge ${files.length} PDFs`}
      </Button>

      {outputUrl && (
        <div className="rounded-lg border bg-card p-4 text-sm">
          <p className="font-medium">Merged PDF ready!</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Click below to download your merged document.
          </p>
          <Button asChild className="mt-3" size="sm">
            <a href={outputUrl} download="merged.pdf">
              <Download className="mr-1 h-3.5 w-3.5" /> Download merged.pdf
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}

export { downloadBytes };
