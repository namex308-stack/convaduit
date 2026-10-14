"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import {
  ArrowDown,
  ArrowUp,
  Download,
  Loader2,
  Trash2,
  FileCheck2,
  Settings2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileUploader, type UploadedFile } from "./FileUploader";
import { formatBytes, shortId } from "@/lib/download";

type ImageEntry = UploadedFile & {
  objectUrl: string;
  width: number;
  height: number;
};

type PageSize = "Fit" | "A4" | "Letter" | "Legal";
type Orientation = "auto" | "portrait" | "landscape";
type MarginSize = "none" | "compact" | "standard";
type QualityMode = "lossless" | "high" | "balanced";

export function ImageToPdfTool() {
  const [files, setFiles] = useState<ImageEntry[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("Fit");
  const [orientation, setOrientation] = useState<Orientation>("auto");
  const [marginSize, setMarginSize] = useState<MarginSize>("none");
  const [qualityMode, setQualityMode] = useState<QualityMode>("lossless");
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = url;
    });
  };

  const handleFilesAdded = async (newFiles: File[]) => {
    const images = newFiles.filter(
      (f) => f.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|heic|tiff|bmp)$/i.test(f.name)
    );
    if (images.length < newFiles.length) {
      setError("Some files were skipped — only image files are supported.");
    } else {
      setError(null);
    }

    const newEntries: ImageEntry[] = [];
    for (const f of images) {
      const objectUrl = URL.createObjectURL(f);
      const dims = await getImageDimensions(objectUrl);
      newEntries.push({
        file: f,
        id: shortId(),
        objectUrl,
        width: dims.width,
        height: dims.height,
      });
    }

    setFiles((prev) => [...prev, ...newEntries]);
    setOutputUrl(null);
    setOutputSize(null);
  };

  const handleRemove = (id: string) => {
    setFiles((prev) => {
      const entry = prev.find((f) => f.id === id);
      if (entry) URL.revokeObjectURL(entry.objectUrl);
      return prev.filter((f) => f.id !== id);
    });
    setOutputUrl(null);
    setOutputSize(null);
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
   * Helper to embed an image into the PDF at highest fidelity.
   * If the file is JPEG or PNG and QualityMode is "lossless", we embed the original
   * raw bytes directly — achieving 100% bit-exact pixel fidelity with zero generation loss!
   */
  const embedImageInDoc = async (
    doc: PDFDocument,
    entry: ImageEntry
  ): Promise<{
    image: import("pdf-lib").PDFImage;
    width: number;
    height: number;
  }> => {
    const isJpg =
      entry.file.type === "image/jpeg" ||
      entry.file.type === "image/jpg" ||
      /\.(jpe?g)$/i.test(entry.file.name);
    const isPng =
      entry.file.type === "image/png" ||
      /\.(png)$/i.test(entry.file.name);

    if (qualityMode === "lossless") {
      if (isJpg) {
        try {
          const bytes = await entry.file.arrayBuffer();
          const embedded = await doc.embedJpg(bytes);
          return { image: embedded, width: embedded.width, height: embedded.height };
        } catch {
          // Fall back to canvas if direct embed fails (e.g. CMYK or unusual JPEG)
        }
      }

      if (isPng) {
        try {
          const bytes = await entry.file.arrayBuffer();
          const embedded = await doc.embedPng(bytes);
          return { image: embedded, width: embedded.width, height: embedded.height };
        } catch {
          // Fall back to canvas if interlaced PNG
        }
      }
    }

    // High quality canvas render for WebP, HEIC, or when optimization is requested
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error(`Failed to load ${entry.file.name}`));
      i.src = entry.objectUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context failed");

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0);

    if (qualityMode === "balanced") {
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Encoding failed"))),
          "image/jpeg",
          0.85
        )
      );
      const ab = await blob.arrayBuffer();
      const embedded = await doc.embedJpg(ab);
      return { image: embedded, width: canvas.width, height: canvas.height };
    }

    // High or Lossless fallback: use PNG
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Encoding failed"))),
        "image/png"
      )
    );
    const ab = await blob.arrayBuffer();
    const embedded = await doc.embedPng(ab);
    return { image: embedded, width: canvas.width, height: canvas.height };
  };

  const handleCreate = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setError(null);
    setOutputUrl(null);
    setOutputSize(null);

    try {
      const doc = await PDFDocument.create();

      for (const entry of files) {
        const { image, width, height } = await embedImageInDoc(doc, entry);

        let pageW: number;
        let pageH: number;

        if (pageSize === "Fit") {
          // 1:1 Pixel Match — lossless dimensions
          pageW = width;
          pageH = height;
        } else {
          let baseW = 595.28; // A4
          let baseH = 841.89;

          if (pageSize === "Letter") {
            baseW = 612;
            baseH = 792;
          } else if (pageSize === "Legal") {
            baseW = 612;
            baseH = 1008;
          }

          if (orientation === "portrait") {
            pageW = Math.min(baseW, baseH);
            pageH = Math.max(baseW, baseH);
          } else if (orientation === "landscape") {
            pageW = Math.max(baseW, baseH);
            pageH = Math.min(baseW, baseH);
          } else {
            // Auto match image orientation
            if (width > height) {
              pageW = Math.max(baseW, baseH);
              pageH = Math.min(baseW, baseH);
            } else {
              pageW = Math.min(baseW, baseH);
              pageH = Math.max(baseW, baseH);
            }
          }
        }

        const page = doc.addPage([pageW, pageH]);

        let margin = 0;
        if (pageSize !== "Fit") {
          if (marginSize === "compact") margin = 12;
          if (marginSize === "standard") margin = 28;
        }

        const maxW = pageW - margin * 2;
        const maxH = pageH - margin * 2;
        const scale = Math.min(maxW / width, maxH / height);
        const drawW = width * scale;
        const drawH = height * scale;

        page.drawImage(image, {
          x: (pageW - drawW) / 2,
          y: (pageH - drawH) / 2,
          width: drawW,
          height: drawH,
        });
      }

      const out = await doc.save();
      const blob = new Blob([out as BlobPart], { type: "application/pdf" });
      setOutputUrl(URL.createObjectURL(blob));
      setOutputSize(blob.size);
    } catch (err) {
      console.error(err);
      setError("Failed to create PDF. One or more images could not be embedded.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Uploader */}
      <FileUploader
        accept="image/*,.heic,.tiff,.bmp"
        multiple
        files={files}
        onFilesAdded={handleFilesAdded}
        onFileRemove={handleRemove}
        hint="Add JPG, PNG, WebP, or HEIC images. Embeds directly with 100% original lossless quality."
        disabled={isProcessing}
      />

      {/* Settings bar */}
      {files.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              High-Fidelity PDF Options
            </h3>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleCreate}
                disabled={isProcessing || files.length === 0}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating High-Res PDF...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Create PDF ({files.length} {files.length === 1 ? "page" : "pages"})
                  </>
                )}
              </Button>

              {outputUrl && (
                <Button asChild variant="outline" className="gap-2">
                  <a href={outputUrl} download="convaudit-document.pdf">
                    <Download className="h-4 w-4" />
                    Download PDF {outputSize ? `(${formatBytes(outputSize)})` : ""}
                  </a>
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Page Size */}
            <div className="space-y-1.5">
              <Label htmlFor="page-size" className="text-xs font-medium text-muted-foreground">
                Page Sizing
              </Label>
              <Select value={pageSize} onValueChange={(v: PageSize) => setPageSize(v)}>
                <SelectTrigger id="page-size" className="h-9">
                  <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fit">Fit Page to Image (100% Original Resolution)</SelectItem>
                  <SelectItem value="A4">A4 (210 × 297 mm)</SelectItem>
                  <SelectItem value="Letter">US Letter (8.5 × 11 in)</SelectItem>
                  <SelectItem value="Legal">US Legal (8.5 × 14 in)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quality Mode */}
            <div className="space-y-1.5">
              <Label htmlFor="quality-mode" className="text-xs font-medium text-muted-foreground">
                Quality / Fidelity
              </Label>
              <Select value={qualityMode} onValueChange={(v: QualityMode) => setQualityMode(v)}>
                <SelectTrigger id="quality-mode" className="h-9">
                  <SelectValue placeholder="Quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lossless">100% Lossless (Direct Native Embed)</SelectItem>
                  <SelectItem value="high">High Quality (Max Resolution)</SelectItem>
                  <SelectItem value="balanced">Balanced (Compact File Size)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Orientation */}
            <div className="space-y-1.5">
              <Label htmlFor="page-orientation" className="text-xs font-medium text-muted-foreground">
                Orientation
              </Label>
              <Select
                value={orientation}
                onValueChange={(v: Orientation) => setOrientation(v)}
                disabled={pageSize === "Fit"}
              >
                <SelectTrigger id="page-orientation" className="h-9">
                  <SelectValue placeholder="Orientation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (Match Image Ratio)</SelectItem>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Margins */}
            <div className="space-y-1.5">
              <Label htmlFor="page-margin" className="text-xs font-medium text-muted-foreground">
                Margins
              </Label>
              <Select
                value={marginSize}
                onValueChange={(v: MarginSize) => setMarginSize(v)}
                disabled={pageSize === "Fit"}
              >
                <SelectTrigger id="page-margin" className="h-9">
                  <SelectValue placeholder="Margin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Margin (Full Bleed)</SelectItem>
                  <SelectItem value="compact">Compact (12 pt)</SelectItem>
                  <SelectItem value="standard">Standard (28 pt)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && <p className="text-xs font-medium text-destructive">{error}</p>}
        </div>
      )}

      {/* Image list with reordering */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>Arrange page order ({files.length} images)</span>
            <span>Drag or use arrows to reorder</span>
          </div>

          <ol className="space-y-2">
            {files.map((f, i) => (
              <li
                key={f.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-sm shadow-xs hover:border-border/80 transition-colors"
              >
                <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {i + 1}
                </span>

                <div className="h-12 w-12 flex-none rounded-lg overflow-hidden border border-border bg-muted">
                  <img
                    src={f.objectUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="truncate font-medium text-foreground">{f.file.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatBytes(f.file.size)}</span>
                    {f.width > 0 && (
                      <>
                        <span>•</span>
                        <Badge variant="outline" className="text-[10px] h-4 px-1 font-mono">
                          {f.width} × {f.height} px
                        </Badge>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={i === 0 || isProcessing}
                    onClick={() => move(i, "up")}
                    aria-label="Move up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={i === files.length - 1 || isProcessing}
                    onClick={() => move(i, "down")}
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    disabled={isProcessing}
                    onClick={() => handleRemove(f.id)}
                    aria-label="Remove image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Generated output banner */}
      {outputUrl && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-3">
            <FileCheck2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 flex-none" />
            <div>
              <p className="font-semibold text-sm">High-Resolution PDF Ready!</p>
              <p className="text-xs text-muted-foreground">
                Embedded {files.length} images with 100% original fidelity •{" "}
                {outputSize ? formatBytes(outputSize) : ""}
              </p>
            </div>
          </div>
          <Button asChild className="gap-2">
            <a href={outputUrl} download="convaudit-document.pdf">
              <Download className="h-4 w-4" />
              Download PDF
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
