"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { ArrowDown, ArrowUp, Download, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FileUploader, type UploadedFile } from "./FileUploader";
import { downloadBytes, shortId } from "@/lib/download";

type ImageEntry = UploadedFile & { objectUrl: string };

type PageSize = "A4" | "Letter" | "Fit";

/**
 * Image to PDF tool.
 *
 * Loads each image into an HTMLImageElement, encodes it as PNG bytes,
 * and embeds it into a new PDF page using pdf-lib. Users can reorder
 * images before generating the PDF.
 */
export function ImageToPdfTool() {
  const [files, setFiles] = useState<ImageEntry[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("A4");
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesAdded = (newFiles: File[]) => {
    const images = newFiles.filter((f) => f.type.startsWith("image/"));
    if (images.length < newFiles.length) {
      setError("Some files were skipped — only image files are supported.");
    } else {
      setError(null);
    }
    setFiles((prev) => [
      ...prev,
      ...images.map((f) => ({
        file: f,
        id: shortId(),
        objectUrl: URL.createObjectURL(f),
      })),
    ]);
    setOutputUrl(null);
  };

  const handleRemove = (id: string) => {
    setFiles((prev) => {
      const entry = prev.find((f) => f.id === id);
      if (entry) URL.revokeObjectURL(entry.objectUrl);
      return prev.filter((f) => f.id !== id);
    });
  };

  const move = (index: number, direction: "up" | "down") => {
    setFiles((prev) => {
      const next = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  /**
   * Load a File into an HTMLImageElement and return its decoded PNG bytes.
   * We use canvas to re-encode as PNG so pdf-lib can embed it (it supports
   * JPG and PNG natively).
   */
  async function fileToPngBytes(file: File): Promise<{ bytes: Uint8Array; width: number; height: number }> {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = () => reject(new Error("Failed to load image"));
        i.src = url;
      });
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.drawImage(img, 0, 0);
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Failed to encode image"))),
          "image/png"
        )
      );
      const ab = await blob.arrayBuffer();
      return { bytes: new Uint8Array(ab), width: img.naturalWidth, height: img.naturalHeight };
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  const handleCreate = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setError(null);
    setOutputUrl(null);
    try {
      const doc = await PDFDocument.create();
      for (const entry of files) {
        const { bytes, width, height } = await fileToPngBytes(entry.file);
        const png = await doc.embedPng(bytes);
        let pageW: number;
        let pageH: number;
        if (pageSize === "Fit") {
          pageW = width;
          pageH = height;
        } else if (pageSize === "A4") {
          pageW = 595.28;
          pageH = 841.89;
        } else {
          // Letter
          pageW = 612;
          pageH = 792;
        }
        const page = doc.addPage([pageW, pageH]);
        // Scale image to fit within page while preserving aspect ratio
        const margin = pageSize === "Fit" ? 0 : 24;
        const maxW = pageW - margin * 2;
        const maxH = pageH - margin * 2;
        const scale = Math.min(maxW / width, maxH / height);
        const drawW = width * scale;
        const drawH = height * scale;
        page.drawImage(png, {
          x: (pageW - drawW) / 2,
          y: (pageH - drawH) / 2,
          width: drawW,
          height: drawH,
        });
      }
      const out = await doc.save();
      const blob = new Blob([out as BlobPart], { type: "application/pdf" });
      setOutputUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      setError("Failed to create PDF. One or more images may be invalid.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      <FileUploader
        accept="image/*"
        multiple
        files={files}
        onFilesAdded={handleFilesAdded}
        onFileRemove={handleRemove}
        hint="Add JPG, PNG, or WebP images. Each image becomes one page in the PDF."
        disabled={isProcessing}
      />

      {files.length > 0 && (
        <ol className="space-y-2">
          {files.map((f, i) => (
            <li
              key={f.id}
              className="flex items-center gap-3 rounded-lg border bg-card p-3 text-sm"
            >
              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {i + 1}
              </span>
              {/* Image preview — using <img> instead of next/image because the
                  source is a local object URL, not a remote optimized image. */}
              <img
                src={f.objectUrl}
                alt=""
                className="h-10 w-10 flex-none rounded object-cover"
              />
              <p className="min-w-0 flex-1 truncate font-medium">{f.file.name}</p>
              <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={i === 0 || isProcessing} onClick={() => move(i, "up")}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={i === files.length - 1 || isProcessing} onClick={() => move(i, "down")}>
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={isProcessing} onClick={() => handleRemove(f.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="space-y-2">
        <Label htmlFor="page-size">Page size</Label>
        <Select value={pageSize} onValueChange={(v) => setPageSize(v as PageSize)} disabled={isProcessing}>
          <SelectTrigger id="page-size">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A4">A4 (210 × 297 mm)</SelectItem>
            <SelectItem value="Letter">US Letter (8.5 × 11 in)</SelectItem>
            <SelectItem value="Fit">Fit to image size</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button
        onClick={handleCreate}
        disabled={files.length === 0 || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isProcessing ? "Creating PDF..." : `Create PDF from ${files.length} Image${files.length === 1 ? "" : "s"}`}
      </Button>

      {outputUrl && (
        <div className="rounded-lg border bg-card p-4 text-sm">
          <p className="font-medium">PDF created!</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Click below to download your document.
          </p>
          <Button asChild className="mt-3" size="sm">
            <a href={outputUrl} download="images.pdf">
              <Download className="mr-1 h-3.5 w-3.5" /> Download images.pdf
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}

export { downloadBytes };
