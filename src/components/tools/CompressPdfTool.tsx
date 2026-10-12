"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { FileUploader, type UploadedFile } from "./FileUploader";
import { downloadBytes, formatBytes, shortId } from "@/lib/download";

type Quality = "low" | "medium" | "high";

const QUALITY_MAP: Record<Quality, { scale: number; jpegQuality: number; label: string }> = {
  low: { scale: 1.0, jpegQuality: 0.45, label: "Low (smallest file)" },
  medium: { scale: 1.0, jpegQuality: 0.65, label: "Medium (recommended)" },
  high: { scale: 1.5, jpegQuality: 0.82, label: "High (best quality)" },
};

/**
 * Compress PDF tool.
 *
 * Strategy: Render each page to a JPEG image at a chosen quality using
 * pdfjs-dist, then re-assemble those images into a new PDF with pdf-lib.
 *
 * This is most effective on PDFs that contain large embedded images.
 * Text-heavy PDFs may not shrink much, and the resulting PDF is no
 * longer text-searchable.
 */
export function CompressPdfTool() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [quality, setQuality] = useState<Quality>("medium");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ bytes: Uint8Array; size: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesAdded = (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    const f = newFiles[0];
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file.");
      return;
    }
    setError(null);
    setFile({ file: f, id: shortId() });
    setResult(null);
  };

  const handleRemove = () => {
    setFile(null);
    setResult(null);
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setResult(null);
    try {
      const pdfjs = await import("pdfjs-dist/build/pdf.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.mjs",
        import.meta.url
      ).toString();

      const { PDFDocument } = await import("pdf-lib");

      const buf = await file.file.arrayBuffer();
      const src = await pdfjs.getDocument({ data: buf }).promise;
      const out = await PDFDocument.create();
      const cfg = QUALITY_MAP[quality];

      for (let i = 1; i <= src.numPages; i++) {
        const page = await src.getPage(i);
        const viewport = page.getViewport({ scale: cfg.scale * 1.5 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas not supported");
        // White background so transparent areas don't go black in JPEG
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        const blob = await new Promise<Blob>((resolve, reject) =>
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error("Failed to encode page"))),
            "image/jpeg",
            cfg.jpegQuality
          )
        );
        const ab = await blob.arrayBuffer();
        const jpg = await out.embedJpg(new Uint8Array(ab));
        // Preserve original page size in PDF points (1 px @ 72dpi = 1pt)
        const ptW = viewport.width / 1.5;
        const ptH = viewport.height / 1.5;
        const newPage = out.addPage([ptW, ptH]);
        newPage.drawImage(jpg, { x: 0, y: 0, width: ptW, height: ptH });
        setProgress(Math.round((i / src.numPages) * 100));
      }

      const bytes = await out.save();
      setResult({ bytes, size: bytes.byteLength });
    } catch (err) {
      console.error(err);
      setError("Failed to compress PDF. The file may be corrupted or encrypted.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      <FileUploader
        accept="application/pdf,.pdf"
        files={file ? [file] : []}
        onFilesAdded={handleFilesAdded}
        onFileRemove={handleRemove}
        hint="Upload a single PDF. Best results on image-heavy PDFs."
        disabled={isProcessing}
      />

      <div className="space-y-2">
        <Label htmlFor="quality-select">Compression quality</Label>
        <Select value={quality} onValueChange={(v) => setQuality(v as Quality)} disabled={isProcessing}>
          <SelectTrigger id="quality-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(QUALITY_MAP) as Quality[]).map((q) => (
              <SelectItem key={q} value={q}>
                {QUALITY_MAP[q].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Note: After compression, text in the PDF is no longer searchable.
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
            Rendering pages... {progress}%
          </p>
        </div>
      )}

      <Button
        onClick={handleCompress}
        disabled={!file || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isProcessing ? "Compressing..." : "Compress PDF"}
      </Button>

      {result && file && (
        <div className="rounded-lg border bg-card p-4 text-sm">
          <p className="font-medium">Compression complete!</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Original: {formatBytes(file.file.size)} →{" "}
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              {formatBytes(result.size)}
            </span>{" "}
            ({Math.max(0, Math.round((1 - result.size / file.file.size) * 100))}% smaller)
          </p>
          <Button
            className="mt-3"
            size="sm"
            onClick={() => {
              const baseName = file.file.name.replace(/\.pdf$/i, "");
              downloadBytes(result.bytes, `${baseName}-compressed.pdf`, "application/pdf");
            }}
          >
            <Download className="mr-1 h-3.5 w-3.5" /> Download compressed PDF
          </Button>
        </div>
      )}
    </div>
  );
}
