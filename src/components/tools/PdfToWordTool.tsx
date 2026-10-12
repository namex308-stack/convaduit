"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileUploader, type UploadedFile } from "./FileUploader";
import { downloadBlob, shortId } from "@/lib/download";

/**
 * PDF to Word tool.
 *
 * Uses pdfjs-dist to extract text content from each page of the PDF, then
 * wraps that text in a minimal Word-compatible .doc file (HTML-based Word
 * 97-2003 format that opens in Word, Google Docs, and LibreOffice).
 *
 * Note: This focuses on accurate text extraction. Complex layouts, tables,
 * and images are NOT preserved.
 */
export function PdfToWordTool() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState<string>("");
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
    setExtractedText("");
  };

  const handleRemove = () => {
    setFile(null);
    setExtractedText("");
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setExtractedText("");

    try {
      // Lazy-load pdfjs-dist so the heavy WASM only loads when needed.
      const pdfjs = await import("pdfjs-dist/build/pdf.mjs");
      // Use a worker URL via webpack's new URL() support (Next.js compatible).
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.mjs",
        import.meta.url
      ).toString();

      const buf = await file.file.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: buf }).promise;
      const lines: string[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const text = content.items
          .map((item) => ("str" in item ? (item as { str: string }).str : ""))
          .join(" ");
        lines.push(text);
        setProgress(Math.round((i / doc.numPages) * 100));
      }
      const fullText = lines.join("\n\n");
      setExtractedText(fullText);
    } catch (err) {
      console.error(err);
      setError(
        "Failed to extract text. The PDF may be scanned (images only) or corrupted."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!extractedText || !file) return;
    const baseName = file.file.name.replace(/\.pdf$/i, "");
    // Build a minimal Word-compatible .doc file (HTML format that Word reads).
    const escaped = extractedText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const paragraphs = escaped
      .split(/\n\n+/)
      .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
      .join("");
    const html = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${baseName}</title></head><body>${paragraphs}</body></html>`;
    const blob = new Blob([html], { type: "application/msword" });
    downloadBlob(blob, `${baseName}.doc`);
  };

  return (
    <div className="space-y-5">
      <FileUploader
        accept="application/pdf,.pdf"
        files={file ? [file] : []}
        onFilesAdded={handleFilesAdded}
        onFileRemove={handleRemove}
        hint="Upload a PDF with embedded text. Scanned PDFs (images only) are not supported."
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
            Extracting text... {progress}%
          </p>
        </div>
      )}

      <Button
        onClick={handleConvert}
        disabled={!file || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isProcessing ? "Converting..." : "Convert to Word"}
      </Button>

      {extractedText && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Extracted text preview</h3>
            <Button size="sm" onClick={handleDownload}>
              <Download className="mr-1 h-3.5 w-3.5" /> Download .doc
            </Button>
          </div>
          <pre className="max-h-80 overflow-y-auto rounded-lg border bg-muted/30 p-3 text-xs whitespace-pre-wrap">
            {extractedText.slice(0, 4000)}
            {extractedText.length > 4000 ? "\n..." : ""}
          </pre>
        </div>
      )}
    </div>
  );
}
