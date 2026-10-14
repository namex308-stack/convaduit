"use client";

import { useState } from "react";
import exifr from "exifr";
import JSZip from "jszip";
import {
  Download,
  Loader2,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Camera,
  MapPin,
  Calendar,
  Sparkles,
  Archive,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { FileUploader, type UploadedFile } from "./FileUploader";
import { downloadBlob, formatBytes, shortId } from "@/lib/download";

interface ExifDetails {
  make?: string;
  model?: string;
  software?: string;
  lensModel?: string;
  dateTime?: string;
  iso?: number;
  fNumber?: number;
  exposureTime?: string | number;
  focalLength?: number;
  hasGps: boolean;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  artist?: string;
  copyright?: string;
  tagCount: number;
  rawTags: Record<string, unknown>;
}

interface ImageItem extends UploadedFile {
  objectUrl: string;
  exif: ExifDetails | null;
  cleanedBlob: Blob | null;
  cleanedSize?: number;
  tagsRemoved?: number;
  status: "idle" | "parsing" | "ready" | "cleaning" | "done" | "error";
  errorMsg?: string;
}

export function RemoveExifTool() {
  const [files, setFiles] = useState<ImageItem[]>([]);
  const [outputFormat, setOutputFormat] = useState<"original" | "image/jpeg" | "image/png" | "image/webp">("original");
  const [jpegQuality, setJpegQuality] = useState<number>(95);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeExifModal, setActiveExifModal] = useState<ImageItem | null>(null);

  const parseExifData = async (file: File): Promise<ExifDetails> => {
    try {
      const data = await exifr.parse(file, {
        tiff: true,
        xmp: true,
        icc: true,
        iptc: true,
        jfif: true,
        gps: true,
      });

      if (!data || Object.keys(data).length === 0) {
        return {
          hasGps: false,
          tagCount: 0,
          rawTags: {},
        };
      }

      let lat: number | undefined;
      let lon: number | undefined;

      try {
        const gps = await exifr.gps(file);
        if (gps && typeof gps.latitude === "number" && typeof gps.longitude === "number") {
          lat = gps.latitude;
          lon = gps.longitude;
        }
      } catch {
        // GPS parse optional
      }

      return {
        make: data.Make ? String(data.Make).trim() : undefined,
        model: data.Model ? String(data.Model).trim() : undefined,
        software: data.Software ? String(data.Software).trim() : undefined,
        lensModel: (data.LensModel || data.LensInfo) ? String(data.LensModel || data.LensInfo).trim() : undefined,
        dateTime: data.DateTimeOriginal
          ? new Date(data.DateTimeOriginal).toLocaleString()
          : data.CreateDate
          ? new Date(data.CreateDate).toLocaleString()
          : undefined,
        iso: typeof data.ISO === "number" ? data.ISO : undefined,
        fNumber: typeof data.FNumber === "number" ? data.FNumber : undefined,
        exposureTime: data.ExposureTime
          ? typeof data.ExposureTime === "number" && data.ExposureTime < 1
            ? `1/${Math.round(1 / data.ExposureTime)}s`
            : `${data.ExposureTime}s`
          : undefined,
        focalLength: typeof data.FocalLength === "number" ? data.FocalLength : undefined,
        hasGps: Boolean(lat !== undefined && lon !== undefined),
        latitude: lat,
        longitude: lon,
        altitude: typeof data.GPSAltitude === "number" ? data.GPSAltitude : undefined,
        artist: data.Artist ? String(data.Artist) : undefined,
        copyright: data.Copyright ? String(data.Copyright) : undefined,
        tagCount: Object.keys(data).length,
        rawTags: data,
      };
    } catch {
      return {
        hasGps: false,
        tagCount: 0,
        rawTags: {},
      };
    }
  };

  const handleFilesAdded = async (newFiles: File[]) => {
    const imageFiles = newFiles.filter((f) => f.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|heic|tiff|tif)$/i.test(f.name));
    if (imageFiles.length === 0) return;

    const newItems: ImageItem[] = imageFiles.map((file) => ({
      file,
      id: shortId(),
      objectUrl: URL.createObjectURL(file),
      exif: null,
      cleanedBlob: null,
      status: "parsing",
    }));

    setFiles((prev) => [...prev, ...newItems]);

    // Parse EXIF for each newly added file
    for (const item of newItems) {
      const parsed = await parseExifData(item.file);
      setFiles((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? { ...it, exif: parsed, status: "ready" }
            : it
        )
      );
    }
  };

  const handleRemove = (id: string) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item) URL.revokeObjectURL(item.objectUrl);
      return prev.filter((f) => f.id !== id);
    });
  };

  const cleanSingleImage = async (item: ImageItem): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context creation failed"));
            return;
          }

          // Draw directly onto blank canvas to strip all EXIF / metadata blocks
          ctx.drawImage(img, 0, 0);

          let mimeType = item.file.type;
          if (outputFormat !== "original") {
            mimeType = outputFormat;
          } else if (!mimeType || mimeType === "image/heic" || mimeType === "image/tiff") {
            mimeType = "image/jpeg";
          }

          const quality = mimeType === "image/png" ? undefined : jpegQuality / 100;

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Failed to export cleaned image"));
              }
            },
            mimeType,
            quality
          );
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error("Failed to load image into memory"));
      img.src = item.objectUrl;
    });
  };

  const handleCleanOne = async (id: string) => {
    const item = files.find((f) => f.id === id);
    if (!item) return;

    setFiles((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status: "cleaning" } : it))
    );

    try {
      const cleaned = await cleanSingleImage(item);
      const tagsCount = item.exif?.tagCount || 0;

      setFiles((prev) =>
        prev.map((it) =>
          it.id === id
            ? {
                ...it,
                cleanedBlob: cleaned,
                cleanedSize: cleaned.size,
                tagsRemoved: tagsCount,
                status: "done",
              }
            : it
        )
      );
    } catch (err) {
      setFiles((prev) =>
        prev.map((it) =>
          it.id === id
            ? {
                ...it,
                status: "error",
                errorMsg: err instanceof Error ? err.message : "Cleaning failed",
              }
            : it
        )
      );
    }
  };

  const handleCleanAll = async () => {
    if (files.length === 0) return;
    setIsProcessingAll(true);
    setProgress(0);

    for (let i = 0; i < files.length; i++) {
      const item = files[i];
      try {
        setFiles((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: "cleaning" } : it))
        );
        const cleaned = await cleanSingleImage(item);
        const tagsCount = item.exif?.tagCount || 0;

        setFiles((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? {
                  ...it,
                  cleanedBlob: cleaned,
                  cleanedSize: cleaned.size,
                  tagsRemoved: tagsCount,
                  status: "done",
                }
              : it
          )
        );
      } catch (err) {
        setFiles((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? {
                  ...it,
                  status: "error",
                  errorMsg: err instanceof Error ? err.message : "Cleaning failed",
                }
              : it
          )
        );
      }
      setProgress(Math.round(((i + 1) / files.length) * 100));
    }

    setIsProcessingAll(false);
  };

  const getCleanedExtension = (item: ImageItem): string => {
    if (outputFormat === "image/png") return "png";
    if (outputFormat === "image/webp") return "webp";
    if (outputFormat === "image/jpeg") return "jpg";
    const ext = item.file.name.split(".").pop()?.toLowerCase();
    return ext && ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
  };

  const handleDownloadOne = (item: ImageItem) => {
    if (!item.cleanedBlob) return;
    const ext = getCleanedExtension(item);
    const baseName = item.file.name.replace(/\.[^.]+$/, "");
    downloadBlob(item.cleanedBlob, `${baseName}-no-exif.${ext}`);
  };

  const handleDownloadAllZip = async () => {
    const readyItems = files.filter((f) => f.cleanedBlob !== null);
    if (readyItems.length === 0) return;

    const zip = new JSZip();
    readyItems.forEach((item) => {
      const ext = getCleanedExtension(item);
      const baseName = item.file.name.replace(/\.[^.]+$/, "");
      zip.file(`${baseName}-no-exif.${ext}`, item.cleanedBlob!);
    });

    const zipBlob = await zip.generateAsync({ type: "blob" });
    downloadBlob(zipBlob, "convaudit-cleaned-images.zip");
  };

  const anyCleaned = files.some((f) => f.cleanedBlob !== null);
  const totalGpsFound = files.filter((f) => f.exif?.hasGps).length;

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <FileUploader
        accept="image/*,.heic,.tiff,.tif"
        multiple
        files={files}
        onFilesAdded={handleFilesAdded}
        onFileRemove={handleRemove}
        hint="Upload JPG, PNG, WebP, or HEIC images to view and remove all EXIF, GPS location, and device metadata."
        disabled={isProcessingAll}
      />

      {/* Global Alert if GPS Detected */}
      {totalGpsFound > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive dark:bg-destructive/20">
          <ShieldAlert className="h-5 w-5 flex-none text-destructive mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">
              Privacy Alert: GPS Location Detected in {totalGpsFound} {totalGpsFound === 1 ? "image" : "images"}!
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              These photos contain exact coordinates where they were taken. Cleaning will permanently wipe all location coordinates, camera serial numbers, and personal info.
            </p>
          </div>
        </div>
      )}

      {/* Output Configuration Bar */}
      {files.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="output-format" className="text-xs font-medium text-muted-foreground">
                  Output Format
                </Label>
                <Select
                  value={outputFormat}
                  onValueChange={(v: "original" | "image/jpeg" | "image/png" | "image/webp") => setOutputFormat(v)}
                >
                  <SelectTrigger id="output-format" className="w-[180px] h-9">
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="original">Keep Original Format</SelectItem>
                    <SelectItem value="image/jpeg">JPG (Cleaned)</SelectItem>
                    <SelectItem value="image/png">PNG (Lossless)</SelectItem>
                    <SelectItem value="image/webp">WebP (Modern)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {outputFormat !== "image/png" && (
                <div className="space-y-1.5 w-48">
                  <div className="flex justify-between text-xs">
                    <Label className="text-muted-foreground">Quality</Label>
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
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleCleanAll}
                disabled={isProcessingAll || files.length === 0}
                className="gap-2"
              >
                {isProcessingAll ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cleaning...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Remove EXIF from All ({files.length})
                  </>
                )}
              </Button>

              {anyCleaned && (
                <Button
                  variant="outline"
                  onClick={handleDownloadAllZip}
                  className="gap-2"
                >
                  <Archive className="h-4 w-4" />
                  Download ZIP
                </Button>
              )}
            </div>
          </div>

          {isProcessingAll && (
            <div className="space-y-1 pt-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">{progress}% completed</p>
            </div>
          )}
        </div>
      )}

      {/* Images List */}
      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((item) => {
            const hasExif = item.exif && item.exif.tagCount > 0;
            const isDone = item.status === "done";

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-border/80 shadow-xs"
              >
                {/* Left: Image thumbnail + File Info */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className="relative h-14 w-14 flex-none rounded-lg overflow-hidden border border-border bg-muted">
                    <img
                      src={item.objectUrl}
                      alt={item.file.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate font-medium text-sm text-foreground">
                      {item.file.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatBytes(item.file.size)}</span>
                      <span>•</span>
                      {item.status === "parsing" ? (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Reading metadata...
                        </span>
                      ) : hasExif ? (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          {item.exif?.tagCount} metadata tags found
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          No EXIF tags detected
                        </span>
                      )}

                      {item.exif?.hasGps && (
                        <Badge variant="destructive" className="h-5 px-1.5 text-[10px] gap-1">
                          <MapPin className="h-2.5 w-2.5" />
                          GPS coordinates
                        </Badge>
                      )}

                      {item.exif?.model && (
                        <span className="hidden md:inline-flex items-center gap-1 text-muted-foreground">
                          <Camera className="h-3 w-3" />
                          {item.exif.model}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions & Status */}
                <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                  {hasExif && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveExifModal(item)}
                      className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Metadata
                    </Button>
                  )}

                  {isDone ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Cleaned ({formatBytes(item.cleanedSize || 0)})</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleDownloadOne(item)}
                        className="h-8 gap-1.5 text-xs"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </Button>
                    </div>
                  ) : item.status === "cleaning" ? (
                    <Button size="sm" disabled className="h-8 gap-1.5 text-xs">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Stripping...
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCleanOne(item.id)}
                      className="h-8 gap-1.5 text-xs"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Remove EXIF
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(item.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EXIF Details Modal */}
      {activeExifModal && activeExifModal.exif && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={() => setActiveExifModal(null)}
        >
          <div
            className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-4">
              <div className="space-y-0.5">
                <h3 className="text-lg font-semibold text-foreground">
                  Embedded EXIF &amp; Metadata
                </h3>
                <p className="text-xs text-muted-foreground truncate max-w-md">
                  {activeExifModal.file.name}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveExifModal(null)}
                className="h-8 w-8 p-0"
              >
                ✕
              </Button>
            </div>

            {/* Quick summary cards */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50 space-y-1">
                <span className="text-muted-foreground flex items-center gap-1 font-medium">
                  <Camera className="h-3.5 w-3.5" /> Camera
                </span>
                <p className="font-semibold text-foreground">
                  {activeExifModal.exif.make || activeExifModal.exif.model
                    ? `${activeExifModal.exif.make || ""} ${activeExifModal.exif.model || ""}`.trim()
                    : "Not specified"}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 border border-border/50 space-y-1">
                <span className="text-muted-foreground flex items-center gap-1 font-medium">
                  <Calendar className="h-3.5 w-3.5" /> Date &amp; Time
                </span>
                <p className="font-semibold text-foreground">
                  {activeExifModal.exif.dateTime || "Not specified"}
                </p>
              </div>

              {activeExifModal.exif.hasGps ? (
                <div className="col-span-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 space-y-1 text-destructive">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="h-3.5 w-3.5" /> GPS Coordinates (Location Data)
                  </span>
                  <p className="font-mono text-xs">
                    Lat: {activeExifModal.exif.latitude?.toFixed(6)}, Lon:{" "}
                    {activeExifModal.exif.longitude?.toFixed(6)}
                    {activeExifModal.exif.altitude ? ` (Alt: ${activeExifModal.exif.altitude.toFixed(1)}m)` : ""}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    This reveals where the photo was captured. It will be removed when cleaned.
                  </p>
                </div>
              ) : (
                <div className="col-span-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs">
                  <span className="flex items-center gap-1 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5" /> No GPS Coordinates Embedded
                  </span>
                </div>
              )}
            </div>

            {/* All raw tags table */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                All Extracted Tags ({activeExifModal.exif.tagCount})
              </h4>
              <div className="max-h-60 overflow-y-auto rounded-lg border border-border/60 bg-muted/20 text-xs font-mono p-2 divide-y divide-border/40">
                {Object.entries(activeExifModal.exif.rawTags).map(([k, v]) => (
                  <div key={k} className="py-1.5 flex justify-between gap-4">
                    <span className="text-muted-foreground truncate">{k}</span>
                    <span className="text-foreground text-right truncate max-w-[240px]">
                      {typeof v === "object" ? JSON.stringify(v) : String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveExifModal(null)}
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  handleCleanOne(activeExifModal.id);
                  setActiveExifModal(null);
                }}
                className="gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Remove All Metadata
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
