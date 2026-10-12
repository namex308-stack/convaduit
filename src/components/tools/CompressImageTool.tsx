"use client";

import { useState } from "react";
import { Loader2, Zap, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileUploader, type UploadedFile } from "./FileUploader";
import { downloadBlob, formatBytes, shortId } from "@/lib/download";
import { cn } from "@/lib/utils";

type ResultItem = {
  name: string;
  blob: Blob;
  originalSize: number;
  compressedSize: number;
};

type ProcessingMode = "browser" | "python";

/**
 * Compress Image tool — enhanced with a processing mode toggle.
 *
 * - "Browser (private)" mode: uses browser-image-compression entirely
 *   client-side. Files never leave the device. This is the default and
 *   preserves Convaduit's privacy promise.
 *
 * - "Python (fast)" mode: uploads files to the Python FastAPI service
 *   running on port 3030 (Pillow-based). Faster for large batches and
 *   big images. Use this when you have many files or very large source
 *   images and don't mind the upload.
 */
export function CompressImageTool() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [quality, setQuality] = useState(70);
  const [mode, setMode] = useState<ProcessingMode>("browser");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFilesAdded = (newFiles: File[]) => {
    const accepted = newFiles.filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [
      ...prev,
      ...accepted.map((f) => ({ file: f, id: shortId() })),
    ]);
    setResults([]);
    setError(null);
  };

  const handleRemove = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  /**
   * Browser-side compression using browser-image-compression (default mode).
   * Files stay on the device — privacy-preserving.
   */
  const compressInBrowser = async (): Promise<ResultItem[]> => {
    const imageCompression = (await import("browser-image-compression")).default;
    const out: ResultItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i].file;
      const targetMb = Math.max(
        0.05,
        (f.size / (1024 * 1024)) * (quality / 100)
      );
      const compressed = await imageCompression(f, {
        maxSizeMB: targetMb,
        maxWidthOrHeight: 4096,
        useWebWorker: true,
        initialQuality: quality / 100,
      });
      const baseName = f.name.replace(/\.[^.]+$/, "");
      const ext = f.name.split(".").pop()?.toLowerCase() || "jpg";
      out.push({
        name: `${baseName}-compressed.${ext}`,
        blob: compressed,
        originalSize: f.size,
        compressedSize: compressed.size,
      });
      setProgress(Math.round(((i + 1) / files.length) * 100));
    }
    return out;
  };

  /**
   * Server-side compression using the Python FastAPI service (Pillow).
   * Files are uploaded to port 3030 — faster for large batches.
   * The Caddy gateway routes via the XTransformPort query parameter.
   */
  const compressWithPython = async (): Promise<ResultItem[]> => {
    const out: ResultItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i].file;
      const formData = new FormData();
      formData.append("file", f);
      formData.append("quality", String(quality));
      // Keep source format
      const ext = f.name.split(".").pop()?.toLowerCase() || "jpg";
      if (ext === "png") formData.append("format", "PNG");
      else if (ext === "webp") formData.append("format", "WEBP");
      else formData.append("format", "JPEG");

      const res = await fetch("/api/compress-image?XTransformPort=3030", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(
          `Python service error (${res.status}): ${txt.slice(0, 200)}`
        );
      }
      const blob = await res.blob();
      const originalSize = parseInt(
        res.headers.get("X-Original-Size") || String(f.size),
        10
      );
      const compressedSize = parseInt(
        res.headers.get("X-Compressed-Size") || String(blob.size),
        10
      );
      const baseName = f.name.replace(/\.[^.]+$/, "");
      const outExt = ext === "png" ? "png" : ext === "webp" ? "webp" : "jpg";
      out.push({
        name: `${baseName}-compressed.${outExt}`,
        blob,
        originalSize,
        compressedSize,
      });
      setProgress(Math.round(((i + 1) / files.length) * 100));
    }
    return out;
  };

  const handleCompress = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResults([]);

    try {
      const out =
        mode === "browser"
          ? await compressInBrowser()
          : await compressWithPython();
      setResults(out);
    } catch (err) {
      console.error(err);
      setError(
        mode === "python"
          ? "Python service error. Make sure the backend is running on port 3030, or switch to Browser mode."
          : "Failed to compress one or more images. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Processing mode
        </Label>
        <RadioGroup
          value={mode}
          onValueChange={(v) => setMode(v as ProcessingMode)}
          className="grid grid-cols-1 gap-2 sm:grid-cols-2"
        >
          <Label
            htmlFor="mode-browser"
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
              mode === "browser" ? "border-foreground bg-background" : "border-border"
            )}
          >
            <RadioGroupItem value="browser" id="mode-browser" className="mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <Shield className="h-3.5 w-3.5 text-emerald-500" />
                Browser (private)
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Files never leave your device. Slower for large batches.
              </p>
            </div>
          </Label>
          <Label
            htmlFor="mode-python"
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
              mode === "python" ? "border-foreground bg-background" : "border-border"
            )}
          >
            <RadioGroupItem value="python" id="mode-python" className="mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                Python (fast)
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Server-side Pillow. Faster for big images. Files are uploaded.
              </p>
            </div>
          </Label>
        </RadioGroup>
      </div>

      <FileUploader
        accept="image/*"
        multiple
        files={files}
        onFilesAdded={handleFilesAdded}
        onFileRemove={handleRemove}
        hint="Supports JPG, PNG, WebP. Batch processing is supported."
        disabled={isProcessing}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="quality">Quality</Label>
          <span className="text-sm font-medium tabular-nums">{quality}</span>
        </div>
        <Slider
          id="quality"
          min={10}
          max={100}
          step={5}
          value={[quality]}
          onValueChange={(v) => setQuality(v[0])}
          disabled={isProcessing}
        />
        <p className="text-xs text-muted-foreground">
          Lower quality = smaller file size. Try 60-80 for photos, 80-95 for
          screenshots.
        </p>
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {isProcessing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              {mode === "python" ? "Python processing" : "Compressing"}... {progress}%
            </span>
            {mode === "python" && (
              <span className="flex items-center gap-1 text-amber-600">
                <Sparkles className="h-3 w-3" /> Powered by Python
              </span>
            )}
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-foreground transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <Button
        onClick={handleCompress}
        disabled={files.length === 0 || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : mode === "python" ? (
          <Zap className="mr-2 h-4 w-4" />
        ) : (
          <Shield className="mr-2 h-4 w-4" />
        )}
        {isProcessing
          ? "Compressing..."
          : `Compress ${files.length || ""} Image${files.length === 1 ? "" : "s"} (${mode === "python" ? "Python" : "Browser"})`}
      </Button>

      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Results</h3>
          <ul className="space-y-2">
            {results.map((r, i) => {
              const savedPct = Math.round(
                (1 - r.compressedSize / r.originalSize) * 100
              );
              return (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-lg border bg-card p-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(r.originalSize)} →{" "}
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {formatBytes(r.compressedSize)}
                      </span>{" "}
                      ({savedPct >= 0 ? `-${savedPct}%` : `+${Math.abs(savedPct)}%`})
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadBlob(r.blob, r.name)}
                  >
                    Download
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
