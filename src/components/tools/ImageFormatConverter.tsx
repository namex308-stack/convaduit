"use client";

import { useState } from "react";
import JSZip from "jszip";
import { Download, Loader2, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileUploader, type UploadedFile } from "./FileUploader";
import { downloadBlob, formatBytes, shortId } from "@/lib/download";

type Props = {
  /** Source MIME prefix filter, e.g. "image/webp" */
  accept: string;
  /** File extension to append, e.g. "png" */
  outputExtension: string;
  /** Output MIME type for the Blob */
  outputMime: string;
  /** Canvas encode quality (0-1) — used for lossy formats like image/jpeg */
  quality?: number;
  /** Background fill color for transparent areas (used when outputting JPG). */
  backgroundColor?: string;
  /** Hint shown under the dropzone. */
  hint: string;
};

type ResultItem = {
  name: string;
  blob: Blob;
  size: number;
};

/**
 * Generic image-format converter used by WebP→PNG, PNG→JPG, and JPG→WebP.
 *
 * Each source image is drawn onto a canvas and re-encoded with
 * canvas.toBlob() in the target format. Transparent areas are filled
 * with `backgroundColor` (defaults to white) when the target is JPG.
 */
export function ImageFormatConverter({
  accept,
  outputExtension,
  outputMime,
  quality = 0.92,
  backgroundColor,
  hint,
}: Props) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFilesAdded = (newFiles: File[]) => {
    // Fall back to extension matching: some browsers report an empty
    // MIME type (notably for HEIC/WebP), which previously caused valid
    // files to be silently dropped.
    const images = newFiles.filter(
      (f) =>
        f.type.startsWith("image/") ||
        /\.(jpe?g|png|webp|gif|bmp|avif|tiff?|heic|heif)$/i.test(f.name)
    );
    setFiles((prev) => [
      ...prev,
      ...images.map((f) => ({ file: f, id: shortId() })),
    ]);
    setResults([]);
    setError(null);
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
      const out: ResultItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i].file;
        const url = URL.createObjectURL(f);
        try {
          const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const im = new Image();
            im.onload = () => resolve(im);
            im.onerror = () => reject(new Error("Failed to load image"));
            im.src = url;
          });
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas not supported");
          if (backgroundColor) {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.drawImage(img, 0, 0);
          const blob = await new Promise<Blob>((resolve, reject) =>
            canvas.toBlob(
              (b) =>
                b
                  ? resolve(b)
                  : reject(new Error("Failed to encode image")),
              outputMime,
              quality
            )
          );
          const baseName = f.name.replace(/\.[^.]+$/, "");
          out.push({ name: `${baseName}.${outputExtension}`, blob, size: blob.size });
        } finally {
          URL.revokeObjectURL(url);
        }
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      setResults(out);
    } catch (err) {
      console.error(err);
      setError("Failed to convert one or more images.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      <FileUploader
        accept={accept}
        multiple
        files={files}
        onFilesAdded={handleFilesAdded}
        onFileRemove={handleRemove}
        hint={hint}
        disabled={isProcessing}
      />

      {error && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {isProcessing && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-xs text-muted-foreground">
            Converting... {progress}%
          </p>
        </div>
      )}

      <Button
        onClick={handleConvert}
        disabled={files.length === 0 || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isProcessing ? "Converting..." : `Convert ${files.length || ""} Image${files.length === 1 ? "" : "s"}`}
      </Button>

      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Results</h3>
            {results.length > 1 && (
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  const zip = new JSZip();
                  for (const r of results) zip.file(r.name, r.blob);
                  const blob = await zip.generateAsync({ type: "blob" });
                  downloadBlob(blob, `convaudit-converted-${outputExtension}.zip`);
                }}
              >
                <Archive className="mr-1 h-3.5 w-3.5" /> Download all as ZIP
              </Button>
            )}
          </div>
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
                <Button size="sm" variant="outline" onClick={() => downloadBlob(r.blob, r.name)}>
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

/** Pre-configured WebP → PNG converter. */
export function WebpToPngTool() {
  return (
    <ImageFormatConverter
      accept="image/webp,.webp"
      outputExtension="png"
      outputMime="image/png"
      hint="Upload WebP files. Transparency is preserved in the output PNG."
    />
  );
}

/** Pre-configured PNG → JPG converter (with quality slider and bg color). */
export function PngToJpgTool() {
  return (
    <ImageFormatConverter
      accept="image/png,.png"
      outputExtension="jpg"
      outputMime="image/jpeg"
      quality={0.9}
      backgroundColor="#ffffff"
      hint="Upload PNG files. Transparent areas will be filled with white in the JPG output."
    />
  );
}

/** Pre-configured JPG → WebP converter. */
export function JpgToWebpTool() {
  return (
    <ImageFormatConverter
      accept="image/jpeg,.jpg,.jpeg"
      outputExtension="webp"
      outputMime="image/webp"
      quality={0.85}
      hint="Upload JPG files. Output is WebP for smaller file sizes on the web."
    />
  );
}
