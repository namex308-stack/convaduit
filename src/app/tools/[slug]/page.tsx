import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TOOLS, SITE_CONFIG, getToolBySlug } from "@/lib/tools";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { ToolRenderer } from "@/components/tools/ToolRenderer";

/**
 * Pre-render every tool page at build time (SSG).
 * This makes each tool page fast and SEO-friendly.
 */
export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

/**
 * Generate unique SEO metadata for each tool page.
 * Includes title, description, keywords, canonical URL, and OpenGraph tags.
 */
export function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return (async () => {
    const { slug } = await params;
    const tool = getToolBySlug(slug);
    if (!tool) {
      return { title: "Tool not found" };
    }
    const canonical = `${SITE_CONFIG.url}/tools/${tool.slug}`;
    return {
      title: `${tool.name} — Free Online Tool`,
      description: tool.description,
      keywords: tool.keywords,
      alternates: { canonical },
      openGraph: {
        title: `${tool.name} — Free Online Tool`,
        description: tool.description,
        url: canonical,
        type: "website",
        siteName: SITE_CONFIG.name,
      },
      twitter: {
        card: "summary_large_image",
        title: `${tool.name} — Free Online Tool`,
        description: tool.description,
      },
    };
  })();
}

/**
 * Tool page — renders the ToolLayout with the matching tool component.
 */
export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <ToolRenderer slug={slug} />
    </ToolLayout>
  );
}
