"use client";

import { useState, useRef, useCallback } from "react";
import { Download, Loader2, Eye, EyeOff, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { downloadBlob, shortId } from "@/lib/download";

const TARGET_W = 1280;
const TARGET_H = 720;

/**
 * YouTube Thumbnail Resizer.
 *
 * Loads an image into a canvas viewport at 1280×720, lets the user drag
 * to reposition, optionally shows a safe-zone overlay (central 80% where
 * text/faces won't be clipped by YouTube's mobile UI), and exports the
 * cropped result as a PNG.
 */
export function YouTubeThumbnailResizer() {
  const [imageData, setImageData] = useState<{
    url: string;
    img: HTMLImageElement;
    width: number;
    height: number;
  } | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);
    // Accept by extension too: some browsers report an empty MIME for
    // valid images, which previously rejected them outright.
    const looksLikeImage =
      file.type.startsWith("image/") ||
      /\.(jpe?g|png|webp|gif|bmp|avif|tiff?|heic|heif)$/i.test(file.name);
    if (!looksLikeImage) {
      setError("Please upload an image file (JPG, PNG, WebP).");
      return;
    }
    // Revoke the previous object URL to avoid leaking memory on
    // repeated uploads.
    setImageData((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return prev;
    });
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImageData({ url, img, width: img.naturalWidth, height: img.naturalHeight });
      setOffset({ x: 0, y: 0 });
    };
    img.onerror = () => setError("Failed to load image. Try a different file.");
    img.src = url;
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  /**
   * Calculate the draw dimensions for "cover" fit: the image fills the
   * 1280×720 frame, overflowing if necessary. The user drags to choose
   * which part is visible.
   */
  const getDrawDimensions = () => {
    if (!imageData) return { drawW: TARGET_W, drawH: TARGET_H, scale: 1 };
    const scale = Math.max(TARGET_W / imageData.width, TARGET_H / imageData.height);
    return {
      drawW: imageData.width * scale,
      drawH: imageData.height * scale,
      scale,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageData) return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      baseX: offset.x,
      baseY: offset.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current || !imageData) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const { drawW, drawH } = getDrawDimensions();
    // Clamp so the image always covers the frame
    const maxX = Math.max(0, (drawW - TARGET_W) / 2);
    const maxY = Math.max(0, (drawH - TARGET_H) / 2);
    setOffset({
      x: Math.max(-maxX, Math.min(maxX, dragRef.current.baseX + dx)),
      y: Math.max(-maxY, Math.min(maxY, dragRef.current.baseY + dy)),
    });
  };

  const handleMouseUp = () => {
    dragRef.current = null;
  };

  const handleExport = async () => {
    if (!imageData) return;
    setIsExporting(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = TARGET_W;
      canvas.height = TARGET_H;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      const { drawW, drawH } = getDrawDimensions();
      // Draw the image centered + offset, covering the frame
      ctx.drawImage(
        imageData.img,
        (TARGET_W - drawW) / 2 + offset.x,
        (TARGET_H - drawH) / 2 + offset.y,
        drawW,
        drawH
      );

      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Failed to export"))),
          "image/png"
        )
      );
      downloadBlob(blob, `youtube-thumbnail-${shortId()}.png`);
    } catch {
      setError("Failed to export thumbnail. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const { drawW, drawH } = getDrawDimensions();

  return (
    <div className="space-y-5">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {!imageData ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="flex min-h-50 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/30"
        >
          <Upload className="h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">Drop an image here, or click to browse</p>
          <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WebP — any size</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">{imageData.width}×{imageData.height} source</p>
              <p className="text-xs text-muted-foreground">Drag to reposition • Output: 1280×720</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setImageData(null);
                setOffset({ x: 0, y: 0 });
              }}
            >
              Choose different image
            </Button>
          </div>

          {/* Crop preview */}
          <div className="overflow-hidden rounded-xl border bg-muted/30 p-4">
            <div
              className="relative mx-auto cursor-move overflow-hidden rounded-lg bg-black"
              style={{ width: "100%", maxWidth: `${TARGET_W / 2}px`, aspectRatio: "16 / 9" }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                src={imageData.url}
                alt="Thumbnail preview"
                className="pointer-events-none absolute select-none"
                style={{
                  width: `${drawW / 2}px`,
                  height: `${drawH / 2}px`,
                  left: `${(TARGET_W / 2 - drawW / 2) / 2 + offset.x / 2}px`,
                  top: `${(TARGET_H / 2 - drawH / 2) / 2 + offset.y / 2}px`,
                  maxWidth: "none",
                }}
                draggable={false}
              />
              {/* Safe zone overlay: central 80% (10% margin on each side) */}
              {showSafeZone && (
                <>
                  <div
                    className="pointer-events-none absolute border-2 border-yellow-400/80"
                    style={{
                      left: "10%",
                      top: "10%",
                      width: "80%",
                      height: "80%",
                    }}
                  />
                  <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">
                    Safe zone — keep text/faces inside
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="safe-zone"
                checked={showSafeZone}
                onCheckedChange={setShowSafeZone}
              />
              <Label htmlFor="safe-zone" className="flex items-center gap-1.5 text-sm">
                {showSafeZone ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                Safe zone overlay
              </Label>
            </div>
            <Button onClick={handleExport} disabled={isExporting} className="ml-auto">
              {isExporting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Download className="mr-1.5 h-4 w-4" />}
              Download 1280×720 PNG
            </Button>
          </div>
        </>
      )}

      {error && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
