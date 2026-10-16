"use client";

import { useState } from "react";
import { Loader2, Search, AlertCircle, Copy, Check, User, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  extractVideoId,
  fetchOEmbed,
  extractChannelId,
  type YouTubeOEmbed,
} from "@/lib/youtube";
import { copyText } from "@/lib/download";

type Result = {
  channelId: string;
  channelName: string;
  channelUrl: string;
};

/**
 * YouTube Channel ID Finder.
 *
 * Strategy:
 * 1. If the input is a video URL, use oEmbed to get author_url (which
 *    contains the channel ID). This is the most reliable method.
 * 2. If the input is a channel URL (/channel/UC...), extract directly.
 * 3. If the input is a handle URL (/@name), use a CORS proxy to fetch
 *    the channel page and extract the ID from meta tags.
 */
export function YouTubeChannelIdFinder() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [meta, setMeta] = useState<YouTubeOEmbed | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFind = async () => {
    setError(null);
    setResult(null);
    setMeta(null);
    setCopied(false);

    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a YouTube URL.");
      return;
    }

    setLoading(true);
    try {
      // Strategy 1: Video URL → oEmbed → author_url
      const videoId = extractVideoId(trimmed);
      if (videoId) {
        const oembed = await fetchOEmbed(`https://www.youtube.com/watch?v=${videoId}`);
        const channelId = extractChannelId(oembed.author_url);
        if (channelId) {
          setMeta(oembed);
          setResult({
            channelId,
            channelName: oembed.author_name,
            channelUrl: oembed.author_url,
          });
          return;
        }
      }

      // Strategy 2: Direct channel URL (/channel/UC...)
      const directId = extractChannelId(trimmed);
      if (directId) {
        setResult({
          channelId: directId,
          channelName: "Channel",
          channelUrl: trimmed,
        });
        return;
      }

      // Strategy 3: Handle URL (/@name) → fetch page via CORS proxy
      if (trimmed.includes("/@") || trimmed.includes("/user/") || trimmed.includes("/c/")) {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(trimmed)}`;
        const res = await fetch(proxyUrl);
        if (res.ok) {
          const html = await res.text();
          // Look for <meta itemprop="channelId" content="UC...">
          const idMatch = html.match(/"channelId":"(UC[a-zA-Z0-9_-]{22})"/);
          if (idMatch) {
            // Also try to extract channel name
            const nameMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/);
            setResult({
              channelId: idMatch[1],
              channelName: nameMatch ? nameMatch[1] : "Channel",
              channelUrl: trimmed,
            });
            return;
          }
        }
        setError("Could not resolve channel ID from this URL. Try a video URL from the channel instead.");
        return;
      }

      setError("Please enter a valid YouTube URL — a video URL, channel URL, or @handle URL.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to find channel ID. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyId = async () => {
    if (result) {
      const ok = await copyText(result.channelId);
      setCopied(ok);
      if (ok) setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="yt-url">YouTube URL (video, channel, or @handle)</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="yt-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/@MrBeast or /watch?v=..."
            onKeyDown={(e) => e.key === "Enter" && handleFind()}
            disabled={loading}
          />
          <Button onClick={handleFind} disabled={loading || !url.trim()} className="sm:w-auto">
            {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Search className="mr-1.5 h-4 w-4" />}
            Find Channel ID
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Video URLs are the most reliable. Handle URLs (@name) use a CORS proxy and may occasionally fail.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {meta && (
            <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
              <Youtube className="h-5 w-5 flex-none text-red-600" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{meta.title}</p>
                <p className="truncate text-xs text-muted-foreground">Video used for lookup</p>
              </div>
            </div>
          )}

          <div className="rounded-xl border bg-card p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              Channel ID
            </div>
            <div className="flex items-center justify-between gap-3">
              <code className="break-all rounded bg-muted px-3 py-2 font-mono text-sm font-medium">
                {result.channelId}
              </code>
              <Button size="sm" variant="outline" className="flex-none" onClick={copyId}>
                {copied ? <Check className="mr-1 h-3.5 w-3.5 text-emerald-600" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              <p><strong className="text-foreground">Channel name:</strong> {result.channelName}</p>
              <p><strong className="text-foreground">Channel URL:</strong>{" "}
                <a href={result.channelUrl} target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-2 hover:text-muted-foreground">
                  {result.channelUrl}
                </a>
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
            Use this ID for the YouTube Data API, RSS feeds ({`https://www.youtube.com/feeds/videos.xml?channel_id=${result.channelId}`}), or third-party analytics tools.
          </div>
        </div>
      )}
    </div>
  );
}
