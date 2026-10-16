"use client";

import { useState } from "react";
import { Plus, Trash2, Copy, Check, Link2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  extractVideoId,
  parseTimestampToSeconds,
  formatSecondsToTimestamp,
  buildTimestampLink,
} from "@/lib/youtube";
import { copyText } from "@/lib/download";

type TimestampEntry = {
  id: string;
  time: string;
  label: string;
};

/**
 * YouTube Timestamp Link Generator.
 *
 * Takes a YouTube URL and one or more timestamps, generates shareable
 * deep links (youtu.be/VIDEO_ID?t=SECONDS) for each. Perfect for sharing
 * specific moments from long videos.
 */
export function YouTubeTimestampLinkGenerator() {
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [entries, setEntries] = useState<TimestampEntry[]>([
    { id: "ts-1", time: "1:30", label: "Main topic" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    const id = extractVideoId(value);
    setVideoId(id);
    setError(id ? null : value.trim() ? "Could not detect a valid YouTube video ID." : null);
  };

  const addEntry = () => {
    setEntries((prev) => [
      ...prev,
      { id: `ts-${Date.now()}`, time: "", label: "" },
    ]);
  };

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const updateEntry = (id: string, field: "time" | "label", value: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const copyLink = async (link: string, id: string) => {
    const ok = await copyText(link);
    if (ok) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const validEntries = entries.filter((e) => e.time.trim() && parseTimestampToSeconds(e.time) >= 0);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="yt-url">YouTube video URL</Label>
        <Input
          id="yt-url"
          type="url"
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
        {videoId && (
          <p className="text-xs text-emerald-600">
            ✓ Video ID detected: <code className="rounded bg-muted px-1 py-0.5">{videoId}</code>
          </p>
        )}
      </div>

      {/* Timestamps */}
      <div className="space-y-2">
        <Label>Timestamps</Label>
        <p className="text-xs text-muted-foreground">
          Enter times as <code className="rounded bg-muted px-1">1:30</code>,{" "}
          <code className="rounded bg-muted px-1">90</code>, or{" "}
          <code className="rounded bg-muted px-1">1:02:03</code>.
        </p>
        <div className="space-y-2">
          {entries.map((entry) => {
            const seconds = parseTimestampToSeconds(entry.time);
            const valid = entry.time.trim() !== "" && seconds >= 0;
            const link = videoId && valid
              ? buildTimestampLink(videoId, seconds)
              : "";
            return (
              <div key={entry.id} className="space-y-2 rounded-lg border bg-card p-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 flex-none text-muted-foreground" />
                  <Input
                    value={entry.time}
                    onChange={(e) => updateEntry(entry.id, "time", e.target.value)}
                    placeholder="1:30"
                    className="w-24 flex-none"
                  />
                  <Input
                    value={entry.label}
                    onChange={(e) => updateEntry(entry.id, "label", e.target.value)}
                    placeholder="Label (optional, e.g. 'Best tip')"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-none"
                    onClick={() => removeEntry(entry.id)}
                    disabled={entries.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {link ? (
                  <div className="flex items-center gap-2 rounded-md bg-muted/40 p-2">
                    <Link2 className="h-3.5 w-3.5 flex-none text-muted-foreground" />
                    <code className="min-w-0 flex-1 truncate text-xs">
                      {link}
                    </code>
                    <span className="flex-none text-xs text-muted-foreground">
                      ({formatSecondsToTimestamp(seconds)})
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-none h-7"
                      onClick={() => copyLink(link, entry.id)}
                    >
                      {copiedId === entry.id ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                ) : entry.time.trim() !== "" && !valid ? (
                  <p className="text-xs text-destructive">
                    Invalid timestamp — use seconds (90), M:SS (1:30), or H:MM:SS (1:02:03).
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
        <Button variant="outline" size="sm" onClick={addEntry}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Add timestamp
        </Button>
      </div>

      {/* Summary: all links as a list */}
      {videoId && validEntries.length > 0 && (
        <div className="space-y-2">
          <Label>All links (copy-friendly)</Label>
          <div className="rounded-lg border bg-muted/30 p-3">
            <pre className="whitespace-pre-wrap break-all text-xs">
{validEntries.map((e) => {
  const seconds = parseTimestampToSeconds(e.time);
  const link = buildTimestampLink(videoId, seconds);
  return `${formatSecondsToTimestamp(seconds)}${e.label.trim() ? ` — ${e.label.trim()}` : ""}\n${link}`;
}).join("\n\n")}
            </pre>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const text = validEntries.map((e) => {
                const seconds = parseTimestampToSeconds(e.time);
                const link = buildTimestampLink(videoId, seconds);
                return `${formatSecondsToTimestamp(seconds)}${e.label.trim() ? ` — ${e.label.trim()}` : ""}\n${link}`;
              }).join("\n\n");
              copyText(text);
            }}
          >
            <Copy className="mr-1 h-3.5 w-3.5" /> Copy all links
          </Button>
        </div>
      )}
    </div>
  );
}
