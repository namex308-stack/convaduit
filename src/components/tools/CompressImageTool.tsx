"use client";

import { useState } from "react";
import imageCompression from "browser-image-compression";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { FileUploader, type UploadedFile } from "./FileUploader";
import { downloadBlob, formatBytes, shortId } from "@/lib/download";

type ResultItem = {
  name: string;
  blob: Blob;
  originalSize: number;
  compressedSize: number;
};

/**
 * Compress Image tool.
 * Uses browser-image-compression to reduce the size of JPG / PNG / WebP images.
 */
export function CompressImageTool() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [quality, setQuality] = useState(70);
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

  const handleCompress = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResults([]);

    try {
      const out: ResultItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i].file;
        // Map quality (1-100) to a target size as a rough heuristic.
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
      setResults(out);
    } catch (err) {
      console.error(err);
      setError("Failed to compress one or more images. Please try again.");
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
          <Progress value={progress} />
          <p className="text-xs text-muted-foreground">
            Compressing... {progress}%
          </p>
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
        ) : null}
        {isProcessing ? "Compressing..." : `Compress ${files.length || ""} Image${files.length === 1 ? "" : "s"}`}
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
                    <Download className="mr-1 h-3.5 w-3.5" /> Download
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
