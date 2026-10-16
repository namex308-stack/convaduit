"use client";

import { useState } from "react";
import { Sparkles, Copy, Check, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { copyText } from "@/lib/download";

const MAX_CHARS = 100;
const IDEAL_CHARS = 70;
const CURRENT_YEAR = new Date().getFullYear();

/**
 * Generate title variations from a topic using proven CTR templates.
 * Returns objects with the title text and character count.
 */
function generateTitles(topic: string): { title: string; chars: number }[] {
  const t = topic.trim();
  if (!t) return [];

  // Capitalize first letter of topic for cleaner output
  const topicCap = t.charAt(0).toUpperCase() + t.slice(1);

  const templates: string[] = [
    `How to ${t} (Complete Guide)`,
    `The Ultimate Guide to ${t} in ${CURRENT_YEAR}`,
    `${topicCap}: 7 Things Nobody Tells You`,
    `I Tried ${t} for 30 Days — Here's What Happened`,
    `The Truth About ${t} (No One Talks About This)`,
    `${topicCap} Explained in 10 Minutes`,
    `5 ${t} Mistakes That Are Costing You`,
    `Why ${t} Is Changing Everything`,
    `Stop Doing ${t} Wrong — Do This Instead`,
    `${topicCap} for Beginners: Step-by-Step`,
    `The Best ${t} Tips I've Learned`,
    `${topicCap}: What They Don't Tell You`,
    `How ${t} Actually Works`,
    `${topicCap} — A No-Nonsense Guide`,
    `10 ${t} Hacks You Wish You Knew Sooner`,
    `Is ${t} Worth It? An Honest Review`,
    `The Fastest Way to ${t}`,
    `${topicCap} Mistakes to Avoid at All Costs`,
    `Everything You Need to Know About ${t}`,
    `${topicCap} in ${CURRENT_YEAR}: What's Changed?`,
  ];

  return templates
    .map((title) => ({ title, chars: title.length }))
    .sort((a, b) => a.chars - b.chars);
}

/**
 * YouTube Title Generator.
 *
 * Template-based generator using proven CTR patterns. Includes a live
 * character counter that turns amber past 70 chars (mobile cutoff) and
 * red past 100 (hard limit).
 */
export function YouTubeTitleGenerator() {
  const [topic, setTopic] = useState("");
  const [results, setResults] = useState<{ title: string; chars: number }[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleGenerate = () => {
    const titles = generateTitles(topic);
    setResults(titles);
  };

  const copyTitle = async (title: string, idx: number) => {
    const ok = await copyText(title);
    if (ok) {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    }
  };

  const getCharColor = (chars: number) => {
    if (chars > MAX_CHARS) return "text-red-500";
    if (chars > IDEAL_CHARS) return "text-amber-500";
    return "text-emerald-500";
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="topic">Your video topic or keyword</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. learning guitar, meal prep, personal finance..."
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />
          <Button onClick={handleGenerate} disabled={!topic.trim()} className="sm:w-auto">
            <Sparkles className="mr-1.5 h-4 w-4" />
            Generate Titles
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          We'll generate 20 title variations using proven CTR templates.
        </p>
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Type className="h-3.5 w-3.5" />
            <span>
              <span className="text-emerald-500">●</span> Under 70 chars (ideal) ·
              <span className="text-amber-500"> ●</span> 70-100 chars (mobile truncates) ·
              <span className="text-red-500"> ●</span> Over 100 (too long)
            </span>
          </div>

          <ul className="space-y-2">
            {results.map((result, idx) => (
              <li
                key={idx}
                className="group flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:border-border"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-relaxed">{result.title}</p>
                  <p className={cn("mt-1 text-xs font-medium tabular-nums", getCharColor(result.chars))}>
                    {result.chars} characters
                    {result.chars > MAX_CHARS && " — too long"}
                    {result.chars > IDEAL_CHARS && result.chars <= MAX_CHARS && " — may truncate on mobile"}
                    {result.chars <= IDEAL_CHARS && " — ideal length"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-none opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => copyTitle(result.title, idx)}
                >
                  {copiedIdx === idx ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
