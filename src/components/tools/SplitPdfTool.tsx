"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUploader, type UploadedFile } from "./FileUploader";
import { downloadBytes, shortId } from "@/lib/download";

type Range = { from: number; to: number };
type SplitResult = { name: string; bytes: Uint8Array };

/**
 * Split PDF tool.
 * Parses user-entered page ranges (e.g. "1-3, 5, 7-9") and produces a
 * separate PDF for each range using pdf-lib.
 */
export function SplitPdfTool() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [rangesInput, setRangesInput] = useState("1-1");
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<SplitResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);

  const handleFilesAdded = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    const f = newFiles[0];
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file.");
      return;
    }
    setError(null);
    setFile({ file: f, id: shortId() });
    setResults([]);
    try {
      const buf = await f.arrayBuffer();
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      setPageCount(doc.getPageCount());
    } catch {
      setPageCount(0);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setResults([]);
    setPageCount(0);
  };

  /**
   * Parse a string like "1-3, 5, 7-9" into an array of {from, to} ranges.
   * Whitespace is ignored. Invalid tokens are reported via thrown Error.
   */
  function parseRanges(input: string): Range[] {
    const tokens = input.split(",").map((s) => s.trim()).filter(Boolean);
    if (tokens.length === 0) throw new Error("Please enter at least one page range.");
    const ranges: Range[] = [];
    for (const token of tokens) {
      const m = /^(\d+)\s*-\s*(\d+)$|^(\d+)$/.exec(token);
      if (!m) throw new Error(`Invalid range: "${token}"`);
      if (m[1] && m[2]) {
        const from = parseInt(m[1], 10);
        const to = parseInt(m[2], 10);
        if (from > to) throw new Error(`Range start is greater than end: "${token}"`);
        ranges.push({ from, to });
      } else if (m[3]) {
        const p = parseInt(m[3], 10);
        ranges.push({ from: p, to: p });
      }
    }
    return ranges;
  }

  const handleSplit = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setResults([]);
    try {
      const ranges = parseRanges(rangesInput);
      const buf = await file.file.arrayBuffer();
      const src = await PDFDocument.load(buf, { ignoreEncryption: true });
      const total = src.getPageCount();
      for (const r of ranges) {
        if (r.from < 1 || r.to > total) {
          throw new Error(
            `Range ${r.from}-${r.to} is out of bounds (PDF has ${total} pages).`
          );
        }
      }
      const out: SplitResult[] = [];
      const baseName = file.file.name.replace(/\.pdf$/i, "");
      for (const r of ranges) {
        const newDoc = await PDFDocument.create();
        const pageIndices: number[] = [];
        for (let p = r.from; p <= r.to; p++) pageIndices.push(p - 1);
        const pages = await newDoc.copyPages(src, pageIndices);
        pages.forEach((p) => newDoc.addPage(p));
        const bytes = await newDoc.save();
        const label =
          r.from === r.to ? `page-${r.from}` : `pages-${r.from}-${r.to}`;
        out.push({ name: `${baseName}-${label}.pdf`, bytes });
      }
      setResults(out);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to split PDF.");
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
        hint="Upload a single PDF file to split."
        disabled={isProcessing}
      />

      {pageCount > 0 && (
        <p className="text-xs text-muted-foreground">
          This PDF has <span className="font-medium">{pageCount}</span> pages.
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="ranges">Page ranges</Label>
        <Input
          id="ranges"
          value={rangesInput}
          onChange={(e) => setRangesInput(e.target.value)}
          placeholder="e.g. 1-3, 5, 7-9"
          disabled={isProcessing}
        />
        <p className="text-xs text-muted-foreground">
          Each range produces a separate PDF. Use commas to separate multiple ranges.
        </p>
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button
        onClick={handleSplit}
        disabled={!file || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isProcessing ? "Splitting..." : "Split PDF"}
      </Button>

      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">
            Results ({results.length} file{results.length === 1 ? "" : "s"})
          </h3>
          <ul className="space-y-2">
            {results.map((r, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-lg border bg-card p-3 text-sm"
              >
                <p className="truncate font-medium">{r.name}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    downloadBytes(r.bytes, r.name, "application/pdf")
                  }
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
