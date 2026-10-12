"use client";

import { CompressImageTool } from "./CompressImageTool";
import { HeicToJpgTool } from "./HeicToJpgTool";
import { MergePdfTool } from "./MergePdfTool";
import { SplitPdfTool } from "./SplitPdfTool";
import { PdfToWordTool } from "./PdfToWordTool";
import { ImageToPdfTool } from "./ImageToPdfTool";
import { CompressPdfTool } from "./CompressPdfTool";
import { WebpToPngTool, PngToJpgTool, JpgToWebpTool } from "./ImageFormatConverter";
import { YouTubeThumbnailDownloader } from "./youtube/YouTubeThumbnailDownloader";
import { YouTubeThumbnailResizer } from "./youtube/YouTubeThumbnailResizer";
import { YouTubeTagsExtractor } from "./youtube/YouTubeTagsExtractor";
import { YouTubeTitleGenerator } from "./youtube/YouTubeTitleGenerator";
import { YouTubeDescriptionGenerator } from "./youtube/YouTubeDescriptionGenerator";
import { YouTubeHashtagGenerator } from "./youtube/YouTubeHashtagGenerator";
import { YouTubeMoneyCalculator } from "./youtube/YouTubeMoneyCalculator";
import { YouTubeThumbnailTester } from "./youtube/YouTubeThumbnailTester";
import { YouTubeChannelIdFinder } from "./youtube/YouTubeChannelIdFinder";
import { YouTubeTimestampLinkGenerator } from "./youtube/YouTubeTimestampLinkGenerator";

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
    // YouTube Creator Tools
    case "youtube-thumbnail-downloader":
      return <YouTubeThumbnailDownloader />;
    case "youtube-thumbnail-resizer":
      return <YouTubeThumbnailResizer />;
    case "youtube-tags-extractor":
      return <YouTubeTagsExtractor />;
    case "youtube-title-generator":
      return <YouTubeTitleGenerator />;
    case "youtube-description-generator":
      return <YouTubeDescriptionGenerator />;
    case "youtube-hashtag-generator":
      return <YouTubeHashtagGenerator />;
    case "youtube-money-calculator":
      return <YouTubeMoneyCalculator />;
    case "youtube-thumbnail-tester":
      return <YouTubeThumbnailTester />;
    case "youtube-channel-id-finder":
      return <YouTubeChannelIdFinder />;
    case "youtube-timestamp-link-generator":
      return <YouTubeTimestampLinkGenerator />;
    default:
      return null;
  }
}
