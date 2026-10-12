"use client";

import { CompressImageTool } from "./CompressImageTool";
import { HeicToJpgTool } from "./HeicToJpgTool";
import { MergePdfTool } from "./MergePdfTool";
import { SplitPdfTool } from "./SplitPdfTool";
import { PdfToWordTool } from "./PdfToWordTool";
import { ImageToPdfTool } from "./ImageToPdfTool";
import { CompressPdfTool } from "./CompressPdfTool";
import { WebpToPngTool, PngToJpgTool, JpgToWebpTool } from "./ImageFormatConverter";

/**
 * Client-side renderer that maps a tool slug to its interactive component.
 *
 * We isolate this in a client component because the parent page is a server
 * component (for metadata). The slug-to-JSX mapping uses an explicit switch
 * so React's "no components during render" rule is satisfied.
 */
export function ToolRenderer({ slug }: { slug: string }) {
  switch (slug) {
    case "compress-image":
      return <CompressImageTool />;
    case "heic-to-jpg":
      return <HeicToJpgTool />;
    case "merge-pdf":
      return <MergePdfTool />;
    case "split-pdf":
      return <SplitPdfTool />;
    case "pdf-to-word":
      return <PdfToWordTool />;
    case "image-to-pdf":
      return <ImageToPdfTool />;
    case "compress-pdf":
      return <CompressPdfTool />;
    case "webp-to-png":
      return <WebpToPngTool />;
    case "png-to-jpg":
      return <PngToJpgTool />;
    case "jpg-to-webp":
      return <JpgToWebpTool />;
    default:
      return null;
  }
}
