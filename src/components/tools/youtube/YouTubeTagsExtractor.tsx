"use client";

import { useState } from "react";
import { Loader2, Youtube, AlertCircle, Copy, Check, Tag, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  extractVideoId,
  fetchOEmbed,
  fetchVideoTags,
  type YouTubeOEmbed,
} from "@/lib/youtube";
import { copyText } from "@/lib/download";

/**
 * YouTube Tags Extractor.
 *
 * Uses oEmbed to get the video title/author, then fetches the watch page
 * via a CORS proxy to parse the <meta name="keywords"> tag for the
 * creator's hidden tags.
 */
export function YouTubeTagsExtractor() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<YouTubeOEmbed | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleExtract = async () => {
    setError(null);
    setMeta(null);
    setTags([]);

    const id = extractVideoId(url);
    if (!id) {
      setError("Please enter a valid YouTube video URL.");
      return;
    }

    setLoading(true);
    try {
      const videoUrl = `https://www.youtube.com/watch?v=${id}`;
      // Fetch oEmbed metadata and tags in parallel
      const [oembed, extractedTags] = await Promise.all([
        fetchOEmbed(videoUrl),
        fetchVideoTags(videoUrl),
      ]);
      setMeta(oembed);
      setTags(extractedTags);

      if (extractedTags.length === 0) {
        setError("No tags found. This video may not have any tags, or the page couldn't be fetched.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to extract tags. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyAllTags = async () => {
    const ok = await copyText(tags.join(", "));
    setCopied(ok);
    if (ok) setTimeout(() => setCopied(false), 2000);
  };

  const copyTag = (tag: string) => {
    copyText(tag);
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
            onKeyDown={(e) => e.key === "Enter" && handleExtract()}
            disabled={loading}
          />
          <Button onClick={handleExtract} disabled={loading || !url.trim()} className="sm:w-auto">
            {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Search className="mr-1.5 h-4 w-4" />}
            Extract Tags
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          We fetch the video page and parse hidden keyword tags. This may take a few seconds.
        </p>
      </div>

      {error && !tags.length && (
        <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
          <span>{error}</span>
        </div>
      )}

      {meta && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
          <Youtube className="h-5 w-5 flex-none text-red-600" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{meta.title}</p>
            <p className="truncate text-xs text-muted-foreground">{meta.author_name}</p>
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {tags.length} tag{tags.length === 1 ? "" : "s"} found
              </span>
            </div>
            <Button size="sm" variant="outline" onClick={copyAllTags}>
              {copied ? <Check className="mr-1 h-3.5 w-3.5 text-emerald-600" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy all"}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <button
                key={i}
                onClick={() => copyTag(tag)}
                className="group"
                title="Click to copy"
              >
                <Badge
                  variant="secondary"
                  className="cursor-pointer text-xs transition-colors hover:bg-accent"
                >
                  {tag}
                </Badge>
              </button>
            ))}
          </div>
          {error && (
            <p className="text-xs text-muted-foreground">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
