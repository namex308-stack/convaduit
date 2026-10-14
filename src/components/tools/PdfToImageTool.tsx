"use client";

import { useState } from "react";
import JSZip from "jszip";
import {
  Download,
  Loader2,
  Trash2,
  FileImage,
  Sparkles,
  Archive,
  Layers,
  Settings2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileUploader, type UploadedFile } from "./FileUploader";
import { downloadBlob, formatBytes, shortId } from "@/lib/download";

type ImageFormat = "png" | "jpeg" | "webp";
type DpiPreset = "72" | "150" | "200" | "300" | "400" | "custom";

interface RenderedPage {
  pageNum: number;
  blob: Blob;
  previewUrl: string;
  width: number;
  height: number;
  size: number;
}

export function PdfToImageTool() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [dpiPreset, setDpiPreset] = useState<DpiPreset>("300");
  const [customScale, setCustomScale] = useState<number>(3.0);
  const [format, setFormat] = useState<ImageFormat>("png");
  const [jpegQuality, setJpegQuality] = useState<number>(95);
  const [pageRange, setPageRange] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [renderedPages, setRenderedPages] = useState<RenderedPage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const getEffectiveScale = (): number => {
    switch (dpiPreset) {
      case "72":
        return 1.0;
      case "150":
        return 150 / 72; // ~2.08x
      case "200":
        return 200 / 72; // ~2.78x
      case "300":
        return 300 / 72; // ~4.17x (Crisp 300 DPI print quality)
      case "400":
        return 400 / 72; // ~5.55x (Ultra 400 DPI)
      case "custom":
        return customScale;
      default:
        return 300 / 72;
    }
  };

  const parseTargetPages = (total: number, rangeStr: string): number[] => {
    const trimmed = rangeStr.trim();
    if (!trimmed) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages = new Set<number>();
    const tokens = trimmed.split(",");

    for (const token of tokens) {
      const part = token.trim();
      if (!part) continue;

      if (part.includes("-")) {
        const [startStr, endStr] = part.split("-");
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          const min = Math.max(1, Math.min(start, end));
          const max = Math.min(total, Math.max(start, end));
          for (let p = min; p <= max; p++) {
            pages.add(p);
          }
        }
      } else {
        const p = parseInt(part, 10);
        if (!isNaN(p) && p >= 1 && p <= total) {
          pages.add(p);
        }
      }
    }

    const sorted = Array.from(pages).sort((a, b) => a - b);
    return sorted.length > 0 ? sorted : Array.from({ length: total }, (_, i) => i + 1);
  };

  const handleFilesAdded = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    const f = newFiles[0];
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF document.");
      return;
    }

    setError(null);
    setFile({ file: f, id: shortId() });
    setRenderedPages([]);
    setProgress(0);

    try {
      const pdfjs = await import("pdfjs-dist/build/pdf.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.mjs",
        import.meta.url
      ).toString();

      const buf = await f.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: buf }).promise;
      setPageCount(doc.numPages);
    } catch (err) {
      console.error(err);
      setError("Could not read PDF. The document might be password-protected or corrupted.");
    }
  };

  const handleRemove = () => {
    renderedPages.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setFile(null);
    setPageCount(null);
    setRenderedPages([]);
    setError(null);
    setProgress(0);
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setCurrentPage(0);

    renderedPages.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setRenderedPages([]);

    try {
      const pdfjs = await import("pdfjs-dist/build/pdf.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.mjs",
        import.meta.url
      ).toString();

      const buf = await file.file.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: buf }).promise;
      const totalPages = doc.numPages;
      const targetPages = parseTargetPages(totalPages, pageRange);

      const scale = getEffectiveScale();
      const mime = format === "png" ? "image/png" : format === "webp" ? "image/webp" : "image/jpeg";
      const quality = format === "png" ? undefined : jpegQuality / 100;

      const results: RenderedPage[] = [];

      for (let idx = 0; idx < targetPages.length; idx++) {
        const pageNum = targetPages[idx];
        setCurrentPage(pageNum);

        const page = await doc.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        const ctx = canvas.getContext("2d", { alpha: format === "png" });
        if (!ctx) throw new Error("Canvas context initialization failed");

        // Fill white background for vector PDF rendering
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: ctx,
          viewport,
          canvas,
        }).promise;

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error(`Failed to encode page ${pageNum}`))),
            mime,
            quality
          );
        });

        const previewUrl = URL.createObjectURL(blob);
        results.push({
          pageNum,
          blob,
          previewUrl,
          width: canvas.width,
          height: canvas.height,
          size: blob.size,
        });

        setProgress(Math.round(((idx + 1) / targetPages.length) * 100));
      }

      setRenderedPages(results);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to convert PDF pages to images.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSingle = (page: RenderedPage) => {
    if (!file) return;
    const base = file.file.name.replace(/\.pdf$/i, "");
    downloadBlob(page.blob, `${base}-page-${page.pageNum}.${format}`);
  };

  const handleDownloadAllZip = async () => {
    if (!file || renderedPages.length === 0) return;
    const zip = new JSZip();
    const base = file.file.name.replace(/\.pdf$/i, "");

    renderedPages.forEach((page) => {
      zip.file(`${base}-page-${page.pageNum}.${format}`, page.blob);
    });

    const zipBlob = await zip.generateAsync({ type: "blob" });
    downloadBlob(zipBlob, `${base}-images.zip`);
  };

  return (
    <div className="space-y-6">
      {/* Uploader */}
      <FileUploader
        accept=".pdf,application/pdf"
        multiple={false}
        files={file ? [file] : []}
        onFilesAdded={handleFilesAdded}
        onFileRemove={handleRemove}
        hint="Upload any PDF to convert its pages into high-resolution JPG, PNG, or WebP images."
        disabled={isProcessing}
      />

      {/* Settings Panel */}
      {file && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
            <div className="space-y-0.5">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                High-Quality Render Settings
              </h3>
              <p className="text-xs text-muted-foreground">
                Document contains {pageCount ?? "..."} {pageCount === 1 ? "page" : "pages"}.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleConvert}
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Rendering Page {currentPage}...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Convert PDF to Images
                  </>
                )}
              </Button>

              {renderedPages.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleDownloadAllZip}
                  className="gap-2"
                >
                  <Archive className="h-4 w-4" />
                  Download ZIP ({renderedPages.length})
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Resolution / DPI */}
            <div className="space-y-1.5">
              <Label htmlFor="dpi-preset" className="text-xs font-medium text-muted-foreground">
                Quality / Resolution (DPI)
              </Label>
              <Select
                value={dpiPreset}
                onValueChange={(v: DpiPreset) => setDpiPreset(v)}
              >
                <SelectTrigger id="dpi-preset" className="h-9">
                  <SelectValue placeholder="Preset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="300">Ultra Print (300 DPI — Razor Sharp)</SelectItem>
                  <SelectItem value="200">Super HD (200 DPI — High Retina)</SelectItem>
                  <SelectItem value="150">High Quality (150 DPI — Balanced)</SelectItem>
                  <SelectItem value="72">Screen Quality (72 DPI — Standard)</SelectItem>
                  <SelectItem value="400">Maximum Quality (400 DPI — 4K+)</SelectItem>
                  <SelectItem value="custom">Custom Scale</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Output Format */}
            <div className="space-y-1.5">
              <Label htmlFor="img-format" className="text-xs font-medium text-muted-foreground">
                Output Format
              </Label>
              <Select
                value={format}
                onValueChange={(v: ImageFormat) => setFormat(v)}
              >
                <SelectTrigger id="img-format" className="h-9">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG (Lossless &amp; Vector-Crisp)</SelectItem>
                  <SelectItem value="jpeg">JPG (Compressed Photo)</SelectItem>
                  <SelectItem value="webp">WebP (Modern Web Format)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Page Range */}
            <div className="space-y-1.5">
              <Label htmlFor="page-range" className="text-xs font-medium text-muted-foreground">
                Page Range (Optional)
              </Label>
              <Input
                id="page-range"
                placeholder="e.g. 1-3, 5 (blank for all)"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* Quality Slider (JPG/WebP) or Custom Scale */}
            {dpiPreset === "custom" ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <Label className="text-muted-foreground">Scale Multiplier</Label>
                  <span className="font-medium text-foreground">{customScale}x</span>
                </div>
                <Slider
                  value={[customScale]}
                  min={1.0}
                  max={5.0}
                  step={0.5}
                  onValueChange={(val) => setCustomScale(val[0])}
                  className="py-1"
                />
              </div>
            ) : format !== "png" ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <Label className="text-muted-foreground">Image Quality</Label>
                  <span className="font-medium text-foreground">{jpegQuality}%</span>
                </div>
                <Slider
                  value={[jpegQuality]}
                  min={70}
                  max={100}
                  step={1}
                  onValueChange={(val) => setJpegQuality(val[0])}
                  className="py-1"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Mode</Label>
                <div className="flex items-center gap-1.5 h-9 px-3 rounded-md bg-muted/40 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Lossless PNG (Zero compression artifacts)
                </div>
              </div>
            )}
          </div>

          {isProcessing && (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Rendering high-resolution images...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {error && (
            <p className="text-xs font-medium text-destructive">{error}</p>
          )}
        </div>
      )}

      {/* Results Gallery */}
      {renderedPages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Converted Images ({renderedPages.length} {renderedPages.length === 1 ? "page" : "pages"})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadAllZip}
              className="gap-1.5 text-xs"
            >
              <Archive className="h-3.5 w-3.5" />
              Download All as ZIP
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderedPages.map((page) => (
              <div
                key={page.pageNum}
                className="group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-xs hover:border-border/80 transition-all"
              >
                {/* Preview Image */}
                <div className="relative aspect-[3/4] w-full bg-muted/30 p-2 flex items-center justify-center overflow-hidden border-b">
                  <img
                    src={page.previewUrl}
                    alt={`Page ${page.pageNum}`}
                    className="max-h-full max-w-full rounded object-contain shadow-xs"
                  />
                  <Badge className="absolute top-3 left-3 bg-background/90 text-foreground backdrop-blur-sm border shadow-xs text-xs">
                    Page {page.pageNum}
                  </Badge>
                </div>

                {/* Info & Download Bar */}
                <div className="p-3.5 flex items-center justify-between gap-2">
                  <div className="space-y-0.5 text-xs">
                    <p className="font-semibold text-foreground">
                      {page.width} × {page.height} px
                    </p>
                    <p className="text-muted-foreground">
                      {formatBytes(page.size)} • {format.toUpperCase()}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleDownloadSingle(page)}
                    className="h-8 gap-1.5 text-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
