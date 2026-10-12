"use client";

import { useState } from "react";
import { Copy, Check, Plus, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Timestamp = { id: string; time: string; label: string };

/**
 * YouTube Description Generator.
 *
 * Builds a structured description from user input: hook, summary,
 * timestamp chapters, social links, and hashtags. Output is editable
 * and copyable.
 */
export function YouTubeDescriptionGenerator() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [timestamps, setTimestamps] = useState<Timestamp[]>([
    { id: "ts-1", time: "0:00", label: "Intro" },
    { id: "ts-2", time: "", label: "" },
  ]);
  const [socialLinks, setSocialLinks] = useState({
    twitter: "",
    instagram: "",
    website: "",
  });
  const [hashtags, setHashtags] = useState("");
  const [copied, setCopied] = useState(false);

  const addTimestamp = () => {
    setTimestamps((prev) => [
      ...prev,
      { id: `ts-${Date.now()}`, time: "", label: "" },
    ]);
  };

  const removeTimestamp = (id: string) => {
    setTimestamps((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTimestamp = (id: string, field: "time" | "label", value: string) => {
    setTimestamps((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const generateDescription = (): string => {
    const lines: string[] = [];

    // Hook (first 1-2 lines — most visible in search)
    if (summary.trim()) {
      lines.push(summary.trim());
      lines.push("");
    }

    // Timestamps
    const validTs = timestamps.filter((t) => t.time.trim() && t.label.trim());
    if (validTs.length > 0) {
      lines.push("⏱️ Timestamps:");
      validTs.forEach((t) => {
        lines.push(`${t.time.trim()} ${t.label.trim()}`);
      });
      lines.push("");
    }

    // About section
    if (title.trim()) {
      lines.push(`About this video:`);
      lines.push(`In this video, we cover ${title.trim()}. Whether you're a beginner or looking to level up, this guide breaks down everything you need to know.`);
      lines.push("");
    }

    // Social links
    const hasSocial = Object.values(socialLinks).some((v) => v.trim());
    if (hasSocial) {
      lines.push("🔗 Connect with me:");
      if (socialLinks.twitter.trim()) lines.push(`Twitter: ${socialLinks.twitter.trim()}`);
      if (socialLinks.instagram.trim()) lines.push(`Instagram: ${socialLinks.instagram.trim()}`);
      if (socialLinks.website.trim()) lines.push(`Website: ${socialLinks.website.trim()}`);
      lines.push("");
    }

    // Hashtags
    if (hashtags.trim()) {
      lines.push(hashtags.trim());
      lines.push("");
    }

    // Disclaimer
    lines.push("---");
    lines.push("If you found this video helpful, please like and subscribe! 🔔");
    lines.push("");
    lines.push(`# ${title.trim() || "Your Video Title"}`);

    return lines.join("\n");
  };

  const handleCopy = () => {
    const desc = generateDescription();
    navigator.clipboard.writeText(desc);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const description = generateDescription();

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Video title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. How to Learn Guitar Fast"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="summary">Hook / opening line</Label>
          <Input
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="One sentence that makes viewers want to watch"
          />
        </div>
      </div>

      {/* Timestamps */}
      <div className="space-y-2">
        <Label>Timestamps (for video chapters)</Label>
        <div className="space-y-2">
          {timestamps.map((ts) => (
            <div key={ts.id} className="flex items-center gap-2">
              <Input
                value={ts.time}
                onChange={(e) => updateTimestamp(ts.id, "time", e.target.value)}
                placeholder="0:00"
                className="w-24 flex-none"
              />
              <Input
                value={ts.label}
                onChange={(e) => updateTimestamp(ts.id, "label", e.target.value)}
                placeholder="Section title (e.g. Intro, Tips, Demo)"
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                className="flex-none"
                onClick={() => removeTimestamp(ts.id)}
                disabled={timestamps.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={addTimestamp}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Add timestamp
        </Button>
      </div>

      {/* Social links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="twitter">Twitter / X</Label>
          <Input
            id="twitter"
            value={socialLinks.twitter}
            onChange={(e) => setSocialLinks((s) => ({ ...s, twitter: e.target.value }))}
            placeholder="https://twitter.com/..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            id="instagram"
            value={socialLinks.instagram}
            onChange={(e) => setSocialLinks((s) => ({ ...s, instagram: e.target.value }))}
            placeholder="https://instagram.com/..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={socialLinks.website}
            onChange={(e) => setSocialLinks((s) => ({ ...s, website: e.target.value }))}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="hashtags">Hashtags (space-separated)</Label>
        <Input
          id="hashtags"
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
          placeholder="#howto #tutorial #2025"
        />
      </div>

      {/* Output */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Generated description
          </Label>
          <Button size="sm" variant="outline" onClick={handleCopy}>
            {copied ? <Check className="mr-1 h-3.5 w-3.5 text-emerald-600" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
        <Textarea
          value={description}
          readOnly
          className="min-h-[300px] resize-y font-mono text-xs"
          placeholder="Fill in the fields above to generate your description..."
        />
        <p className="text-xs text-muted-foreground">
          {description.length} / 5000 characters
        </p>
      </div>
    </div>
  );
}
