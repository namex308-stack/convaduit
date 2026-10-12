"use client";

import { useState } from "react";
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
  size: number;
};

/**
 * HEIC to JPG tool.
 * Uses heic2any (which internally uses libheif.js WebAssembly) to decode
 * HEIC/HEIF images and re-encode them as JPEG blobs in the browser.
 */
export function HeicToJpgTool() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [quality, setQuality] = useState(85);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFilesAdded = (newFiles: File[]) => {
    const accepted = newFiles.filter(
      (f) =>
        f.type === "image/heic" ||
        f.type === "image/heif" ||
        /\.heic$|\.heif$/i.test(f.name)
    );
    if (accepted.length < newFiles.length) {
      setError("Some files were skipped — only HEIC/HEIF files are supported.");
    } else {
      setError(null);
    }
    setFiles((prev) => [
      ...prev,
      ...accepted.map((f) => ({ file: f, id: shortId() })),
    ]);
    setResults([]);
  };

  const handleRemove = (id: string) =>
    setFiles((prev) => prev.filter((f) => f.id !== id));

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResults([]);

    try {
      // Lazy-load heic2any — it touches `window` at import time, so we
      // can only import it from inside an event handler in the browser.
      const { default: heic2any } = await import("heic2any");
      const out: ResultItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i].file;
        const converted = (await heic2any({
          blob: f,
          toType: "image/jpeg",
          quality: quality / 100,
        })) as Blob | Blob[];
        const blob = Array.isArray(converted) ? converted[0] : converted;
        const baseName = f.name.replace(/\.[^.]+$/, "");
        out.push({
          name: `${baseName}.jpg`,
          blob,
          size: blob.size,
        });
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      setResults(out);
    } catch (err) {
      console.error(err);
      setError("Failed to convert one or more HEIC files. They may be corrupted.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      <FileUploader
        accept=".heic,.heif,image/heic,image/heif"
        multiple
        files={files}
        onFilesAdded={handleFilesAdded}
        onFileRemove={handleRemove}
        hint="Supports HEIC and HEIF files from iPhone. Batch processing is supported."
        disabled={isProcessing}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="quality">JPG Quality</Label>
          <span className="text-sm font-medium tabular-nums">{quality}</span>
        </div>
        <Slider
          id="quality"
          min={30}
          max={100}
          step={5}
          value={[quality]}
          onValueChange={(v) => setQuality(v[0])}
          disabled={isProcessing}
        />
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
            Converting... {progress}% (HEIC decoding can take a few seconds per image)
          </p>
        </div>
      )}

      <Button
        onClick={handleConvert}
        disabled={files.length === 0 || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {isProcessing ? "Converting..." : `Convert ${files.length || ""} HEIC File${files.length === 1 ? "" : "s"}`}
      </Button>

      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Results</h3>
          <ul className="space-y-2">
            {results.map((r, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-lg border bg-card p-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(r.size)}
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
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
