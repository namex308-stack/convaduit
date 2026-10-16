import Link from "next/link";
import { Search, Image, FileText, Download, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TOOLS, type Tool } from "@/lib/tools";

/**
 * Get unique categories from tools, ordered by appearance.
 */
export function getCategories(): Array<{ id: Tool["category"]; label: string; icon: React.ReactNode }> {
  const seen = new Set<Tool["category"]>();
  const ordered: Tool["category"][] = [];

  for (const tool of TOOLS) {
    if (!seen.has(tool.category)) {
      seen.add(tool.category);
      ordered.push(tool.category);
    }
  }

  const icons: Record<Tool["category"], React.ReactNode> = {
    Image: <Image className="h-4 w-4" aria-label="Image category" role="img" />,
    PDF: <FileText className="h-4 w-4" aria-label="PDF category" role="img" />,
    Conversion: <Download className="h-4 w-4" aria-label="Conversion category" role="img" />,
    YouTube: <Youtube className="h-4 w-4" aria-label="YouTube category" role="img" />,
  };

  return ordered.map((id) => ({ id, label: id, icon: icons[id] }));
}

/**
 * Get tools filtered by category.
 */
export function getToolsByCategory(category: Tool["category"] | "all"): Tool[] {
  if (category === "all") return TOOLS;
  return TOOLS.filter((t) => t.category === category);
}

/**
 * Props for ToolCategorySection
 */
export interface ToolCategorySectionProps {
  category: string;
  title: string;
  icon: React.ReactNode;
  badge?: string;
}

/**
 * Single tool card with category badge and icon.
 */
export function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  const categoryIcon =
    tool.category === "Image" ? <Image className="h-4 w-4" aria-label="Image tool" role="img" /> :
    tool.category === "PDF" ? <FileText className="h-4 w-4" aria-label="PDF tool" role="img" /> :
    tool.category === "Conversion" ? <Download className="h-4 w-4" aria-label="Conversion tool" role="img" /> :
    <Youtube className="h-4 w-4" aria-label="YouTube tool" role="img" />;

  return (
    <Card
      className="group hover:border-primary/40 transition-all duration-200 hover:shadow-md"
      style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
    >
      <CardHeader className="flex flex-row items-center gap-3 p-4 pb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-label={`${tool.name} icon`}>
        {tool.keywords[0] ? (
          <span className="block text-center text-xs font-medium text-primary">{tool.keywords[0].charAt(0)}</span>
        ) : (
          categoryIcon
        )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold">{tool.name}</h3>
          <p className="truncate text-xs text-muted-foreground">{tool.description}</p>
        </div>
        {tool.category && (
          <Badge variant="secondary" className="text-xs">
            {tool.category}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <Button asChild variant="ghost" size="sm" className="w-full justify-start py-2 text-sm">
          <Link href={`/tools/${tool.slug}`}>
            Open Tool
            <svg
              className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Section showing tools in a specific category.
 */
export function ToolCategorySection({ category, title, icon, badge }: ToolCategorySectionProps) {
  const tools = getToolsByCategory(category as Tool["category"] | "all");

  return (
    <section id={category} className="scroll-mt-24">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary" aria-hidden="true">{icon}</div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {tools.length} tool{tools.length === 1 ? "" : "s"} available
            </p>
          </div>
        </div>
        {badge ? (
          <Badge variant="secondary" className="text-xs">
            {badge}
          </Badge>
        ) : null}
      </div>

      {tools.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, index) => (
            <ToolCard key={tool.slug} tool={tool} index={index} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border/50 p-12 text-center">
          <p className="text-sm text-muted-foreground">No tools in this category yet.</p>
        </div>
      )}
    </section>
  );
}
