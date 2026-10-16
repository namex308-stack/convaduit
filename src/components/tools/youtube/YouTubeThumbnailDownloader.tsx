"use client";

import { useState } from "react";
import { Download, Loader2, Youtube, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  extractVideoId,
  getThumbnailUrls,
  fetchOEmbed,
  type YouTubeOEmbed,
  type ThumbnailSet,
} from "@/lib/youtube";
import { downloadBlob } from "@/lib/download";

type ThumbVariant = {
  key: keyof ThumbnailSet;
  label: string;
  width: number;
  height: number;
};

const VARIANTS: ThumbVariant[] = [
  { key: "maxres", label: "Max Resolution", width: 1280, height: 720 },
  { key: "sd", label: "Standard Definition", width: 640, height: 480 },
  { key: "hq", label: "High Quality", width: 480, height: 360 },
  { key: "mq", label: "Medium Quality", width: 320, height: 180 },
  { key: "default", label: "Default", width: 120, height: 90 },
];

/**
 * YouTube Thumbnail Downloader.
 *
 * Extracts the video ID from any YouTube URL, then offers download links
 * for all standard thumbnail resolutions from img.youtube.com.
 * Uses oEmbed to display video title/author for context.
 */
export function YouTubeThumbnailDownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<YouTubeOEmbed | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [brokenUrls, setBrokenUrls] = useState<Set<string>>(new Set());

  const handleFetch = async () => {
    setError(null);
    setMeta(null);
    setVideoId(null);
    setBrokenUrls(new Set());

    const id = extractVideoId(url);
    if (!id) {
      setError("Please enter a valid YouTube video URL.");
      return;
    }

    setVideoId(id);
    setLoading(true);
    try {
      const oembed = await fetchOEmbed(`https://www.youtube.com/watch?v=${id}`);
      setMeta(oembed);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch video metadata. Check the URL and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (variant: ThumbVariant) => {
    if (!videoId) return;
    const thumbs = getThumbnailUrls(videoId);
    const thumbUrl = thumbs[variant.key];

    try {
      // Fetch the image and trigger a download (avoids opening in a new tab).
      const res = await fetch(thumbUrl);
      if (!res.ok) throw new Error("Not found");
      const blob = await res.blob();
      const filename = `youtube-${videoId}-${variant.key}.jpg`;
      downloadBlob(blob, filename);
    } catch {
      // Mark this resolution as unavailable (e.g. maxres missing on old videos)
      setBrokenUrls((prev) => new Set(prev).add(thumbUrl));
    }
  };

  const markBroken = (thumbUrl: string) => {
    setBrokenUrls((prev) => new Set(prev).add(thumbUrl));
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="yt-url">YouTube video URL</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="yt-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            onKeyDown={(e) => e.key === "Enter" && handleFetch()}
            disabled={loading}
          />
          <Button onClick={handleFetch} disabled={loading || !url.trim()} className="sm:w-auto">
            {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Youtube className="mr-1.5 h-4 w-4" />}
            Fetch Thumbnails
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Paste any YouTube URL — watch, youtu.be, shorts, or embed links all work.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
          <span>{error}</span>
        </div>
      )}

      {meta && videoId && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
            <Youtube className="h-5 w-5 flex-none text-red-600" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{meta.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {meta.author_name}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {VARIANTS.map((variant) => {
              const thumbs = getThumbnailUrls(videoId);
              const thumbUrl = thumbs[variant.key];
              const isBroken = brokenUrls.has(thumbUrl);
              return (
                <div
                  key={variant.key}
                  className="overflow-hidden rounded-lg border bg-card"
                >
                  <div className="relative aspect-video bg-muted">
                    {!isBroken ? (
                      <img
                        src={thumbUrl}
                        alt={`${variant.label} thumbnail`}
                        className="h-full w-full object-cover"
                        onError={() => markBroken(thumbUrl)}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        Not available
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 p-3">
                    <div>
                      <p className="text-sm font-medium">{variant.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {variant.width}×{variant.height}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isBroken}
                      onClick={() => handleDownload(variant)}
                    >
                      <Download className="mr-1 h-3.5 w-3.5" /> Download
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
