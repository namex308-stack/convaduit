"use client";

import { useState } from "react";
import { Hash, Copy, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { copyText } from "@/lib/download";

/**
 * Generate hashtags from a topic by combining it with proven patterns.
 * Returns a deduplicated list.
 */
function generateHashtags(topic: string): string[] {
  const t = topic.trim().toLowerCase().replace(/\s+/g, "");
  if (!t) return [];
  const year = new Date().getFullYear();

  const topicWords = topic.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const topicPhrase = topicWords.join("");

  const tags = new Set<string>();

  // Core topic tags
  tags.add(`#${topicPhrase}`);
  topicWords.forEach((w) => tags.add(`#${w}`));

  // Pattern-based variations
  const patterns = [
    `#${topicPhrase}tips`,
    `#${topicPhrase}tutorial`,
    `#${topicPhrase}guide`,
    `#${topicPhrase}${year}`,
    `#${topicPhrase}hacks`,
    `#${topicPhrase}forbeginners`,
    `#${topicPhrase}masterclass`,
    `#${topicPhrase}explained`,
    `#howto${topicPhrase}`,
    `#learn${topicPhrase}`,
    `#${topicPhrase}community`,
    `#${topicPhrase}love`,
    `#${topicPhrase}daily`,
    `#${topicPhrase}tipsandtricks`,
  ];
  patterns.forEach((p) => tags.add(p));

  // General content tags
  const general = [
    "#youtube",
    "#tutorial",
    "#howto",
    "#viral",
    "#trending",
    `#${year}`,
    "#shorts",
    "#educational",
    "#learning",
    "#tips",
  ];
  general.forEach((g) => tags.add(g));

  return Array.from(tags);
}

/**
 * YouTube Hashtag Generator.
 *
 * Generates topic-specific + general hashtags. Click to copy individual
 * tags, or copy all. Reminds users to use 5-10 tags max.
 */
export function YouTubeHashtagGenerator() {
  const [topic, setTopic] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  const handleGenerate = () => {
    setResults(generateHashtags(topic));
  };

  const copyAll = async () => {
    const ok = await copyText(results.slice(0, 10).join(" "));
    setCopiedAll(ok);
    if (ok) setTimeout(() => setCopiedAll(false), 2000);
  };

  const copyTag = async (tag: string) => {
    const ok = await copyText(tag);
    if (ok) {
      setCopiedTag(tag);
      setTimeout(() => setCopiedTag(null), 2000);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="topic">Your video topic or niche</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. personal finance, vegan cooking, guitar..."
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />
          <Button onClick={handleGenerate} disabled={!topic.trim()} className="sm:w-auto">
            <Sparkles className="mr-1.5 h-4 w-4" />
            Generate Hashtags
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          We recommend using 5-10 hashtags in your description. The first 3 appear above your title on mobile.
        </p>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {results.length} hashtags generated
              </span>
            </div>
            <Button size="sm" variant="outline" onClick={copyAll}>
              {copiedAll ? <Check className="mr-1 h-3.5 w-3.5 text-emerald-600" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
              {copiedAll ? "Copied!" : "Copy top 10"}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {results.map((tag, idx) => (
              <button
                key={tag}
                onClick={() => copyTag(tag)}
                title="Click to copy"
                className="group"
              >
                <Badge
                  variant={idx < 3 ? "default" : "secondary"}
                  className={cn(
                    "cursor-pointer text-xs transition-all hover:scale-105",
                    idx < 3 && "font-medium"
                  )}
                >
                  {copiedTag === tag && <Check className="mr-1 h-3 w-3" />}
                  {tag}
                </Badge>
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
            <strong className="text-foreground">Tip:</strong> The first 3 hashtags (highlighted) will appear above your title on mobile. Choose the most relevant ones for those slots.
          </div>
        </div>
      )}
    </div>
  );
}

// Inline import to avoid an extra file
import { cn } from "@/lib/utils";
