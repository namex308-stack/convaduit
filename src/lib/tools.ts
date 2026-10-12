/**
 * Tool definitions for the Online Tools website.
 * Each tool has SEO metadata, FAQs, and step-by-step instructions.
 */

export type FAQ = { q: string; a: string };

export type Tool = {
  /** URL slug, e.g. "compress-image" */
  slug: string;
  /** Display name, e.g. "Compress Image" */
  name: string;
  /** SEO-friendly short description (under 160 chars recommended) */
  description: string;
  /** Category for grouping on the homepage */
  category: "Image" | "PDF" | "Conversion";
  /** Search keywords for filtering / SEO meta */
  keywords: string[];
  /** Long-form description used inside the tool page body */
  longDescription: string;
  /** Frequently asked questions for the FAQ section + JSON-LD */
  faqs: FAQ[];
  /** Step-by-step instructions displayed under the tool */
  howToSteps: string[];
  /** Accent color used for the tool card icon badge */
  accent: string;
};

export const TOOLS: Tool[] = [
  {
    slug: "compress-image",
    name: "Compress Image",
    description:
      "Reduce the file size of JPG, PNG, and WebP images instantly in your browser. No upload, no quality loss you can't control.",
    category: "Image",
    keywords: [
      "compress image",
      "image compressor",
      "reduce image size",
      "optimize jpg",
      "compress png",
      "shrink photo",
      "web image optimizer",
    ],
    longDescription:
      "Our Compress Image tool lets you shrink JPG, PNG, and WebP photos right inside your browser. Files never leave your device, so it's perfect for sensitive documents or personal pictures. Pick a target quality, drag in a batch of files, and download a smaller archive in seconds.",
    faqs: [
      {
        q: "Are my images uploaded to a server?",
        a: "No. All compression happens locally in your browser using the Canvas API and browser-image-compression. Your files never leave your device.",
      },
      {
        q: "What is the maximum file size I can compress?",
        a: "There is no hard limit imposed by the tool, but very large files (over 100 MB) may take longer or be limited by your device's available memory.",
      },
      {
        q: "Which formats are supported?",
        a: "You can compress JPG, PNG, WebP, and most common image formats. Output is generated based on the source type.",
      },
      {
        q: "Will compression reduce quality?",
        a: "Some quality loss is expected with lossy compression. You control the quality level with the slider, so you can balance size and clarity.",
      },
    ],
    howToSteps: [
      "Drag and drop one or more images into the upload area, or click to browse.",
      "Adjust the quality slider to your preferred compression level (1-100).",
      "Click the Compress button and wait for the progress bar to finish.",
      "Download each compressed image individually, or grab them all as a ZIP.",
    ],
    accent: "#10b981",
  },
  {
    slug: "heic-to-jpg",
    name: "HEIC to JPG",
    description:
      "Convert Apple HEIC and HEIF photos from your iPhone into universally compatible JPG files directly in your browser.",
    category: "Conversion",
    keywords: [
      "heic to jpg",
      "heic converter",
      "heic to jpeg",
      "iphone photo converter",
      "convert heic",
      "heif to jpg",
    ],
    longDescription:
      "HEIC is the default photo format on modern iPhones, but many apps and websites still expect JPG. Our HEIC to JPG converter runs entirely in your browser using the heic2any library, so your photos stay private. Convert a single photo or a batch at once.",
    faqs: [
      {
        q: "Is this HEIC converter free?",
        a: "Yes, completely free with no watermarks, no sign-up, and no limits on the number of files you can convert.",
      },
      {
        q: "Does it work on Android or Windows?",
        a: "Yes. Because conversion runs in your browser using WebAssembly, it works on any modern browser regardless of operating system.",
      },
      {
        q: "Are my photos uploaded anywhere?",
        a: "No. HEIC decoding happens locally with the heic2any library. Nothing is sent to a server.",
      },
      {
        q: "Why does conversion take a few seconds per image?",
        a: "HEIC decoding is a CPU-intensive process. We use WebAssembly to decode locally, which is fast but still needs a moment per photo.",
      },
    ],
    howToSteps: [
      "Drag your HEIC files into the upload box, or click to select them.",
      "Optionally choose an output quality for the resulting JPG.",
      "Click Convert and watch the progress indicator.",
      "Download each JPG individually or all together as a ZIP archive.",
    ],
    accent: "#f59e0b",
  },
  {
    slug: "merge-pdf",
    name: "Merge PDF",
    description:
      "Combine multiple PDF files into a single document in seconds. Drag to reorder, all in your browser, no upload required.",
    category: "PDF",
    keywords: [
      "merge pdf",
      "combine pdf",
      "pdf merger",
      "join pdf files",
      "combine pdfs online",
    ],
    longDescription:
      "Our Merge PDF tool lets you combine two or more PDF files into one document in seconds. Reorder pages by dragging, remove files you don't need, then export a single merged PDF. Everything happens locally with the pdf-lib library, so your documents never leave your device.",
    faqs: [
      {
        q: "Is there a limit on the number of PDFs I can merge?",
        a: "There is no fixed limit, but very large numbers of files or very large PDFs may be constrained by your device's memory.",
      },
      {
        q: "Can I reorder pages before merging?",
        a: "Yes, you can drag files to reorder them in the list before clicking Merge.",
      },
      {
        q: "Are my PDFs uploaded to a server?",
        a: "No. Merging uses the pdf-lib library entirely in your browser. Your documents stay private.",
      },
      {
        q: "Does merging reduce quality?",
        a: "No. pdf-lib copies pages without re-encoding, so the merged PDF keeps the same quality as the originals.",
      },
    ],
    howToSteps: [
      "Add two or more PDF files using drag-and-drop or the file picker.",
      "Reorder files by dragging them in the list.",
      "Click Merge PDFs to combine them.",
      "Download the resulting single PDF file.",
    ],
    accent: "#ef4444",
  },
  {
    slug: "split-pdf",
    name: "Split PDF",
    description:
      "Extract pages or split a PDF into multiple files by page ranges. 100% client-side, your PDF never leaves your browser.",
    category: "PDF",
    keywords: [
      "split pdf",
      "pdf splitter",
      "extract pdf pages",
      "divide pdf",
      "separate pdf pages",
    ],
    longDescription:
      "The Split PDF tool lets you carve a PDF into smaller pieces. Provide page ranges like 1-3, 5, 7-9, and each range becomes a separate PDF. Powered by pdf-lib in the browser, so your sensitive documents stay on your computer.",
    faqs: [
      {
        q: "How do I specify which pages to extract?",
        a: "Use comma-separated ranges such as 1-3, 5, 7-9. Each range will produce a separate output PDF.",
      },
      {
        q: "Are my PDFs uploaded anywhere?",
        a: "No. Splitting is performed entirely in your browser with pdf-lib. No file is sent over the network.",
      },
      {
        q: "What's the largest PDF I can split?",
        a: "There's no hard limit, but extremely large PDFs may be limited by browser memory. Files under 100 MB work comfortably.",
      },
      {
        q: "Can I split a password-protected PDF?",
        a: "No, this tool does not handle encrypted PDFs. Please remove the password first using your PDF reader.",
      },
    ],
    howToSteps: [
      "Upload a PDF file using drag-and-drop or the file picker.",
      "Enter page ranges in the format 1-3, 5, 7-9.",
      "Click Split PDF and wait for processing.",
      "Download each resulting PDF, or grab them all as a ZIP.",
    ],
    accent: "#8b5cf6",
  },
  {
    slug: "pdf-to-word",
    name: "PDF to Word",
    description:
      "Extract text from a PDF and download it as an editable Word-compatible .doc file. Runs locally in your browser.",
    category: "Conversion",
    keywords: [
      "pdf to word",
      "pdf to doc",
      "extract text from pdf",
      "convert pdf to editable",
      "pdf text extractor",
    ],
    longDescription:
      "PDF to Word uses the pdfjs-dist library to extract text content from your PDF and packages it as a .doc file you can open in Microsoft Word, Google Docs, or LibreOffice. Note: complex layouts may not be preserved perfectly — this tool focuses on accurate text extraction rather than visual fidelity.",
    faqs: [
      {
        q: "Will the layout be preserved?",
        a: "Text is extracted line by line. Tables, images, and complex layouts may not match the original perfectly. The tool prioritizes text accuracy over visual fidelity.",
      },
      {
        q: "Is this PDF to Word converter free?",
        a: "Yes, completely free with no sign-up, no watermark, and no upload — it runs in your browser.",
      },
      {
        q: "Can I convert scanned PDFs?",
        a: "No. Scanned PDFs contain images of text, not actual text. You would need an OCR tool to extract text from scans.",
      },
      {
        q: "What output format is used?",
        a: "We generate a .doc file (Word 97-2003) which opens in Microsoft Word, Google Docs, and LibreOffice. The format is HTML-based so it's lightweight and universally compatible.",
      },
    ],
    howToSteps: [
      "Drop a PDF file into the upload area or click to browse.",
      "Click Convert to Word and wait for text extraction to complete.",
      "Preview the extracted text in the panel.",
      "Download the resulting .doc file to edit in Word or Google Docs.",
    ],
    accent: "#3b82f6",
  },
  {
    slug: "image-to-pdf",
    name: "Image to PDF",
    description:
      "Convert JPG, PNG, and WebP images into a single PDF document. Reorder, set page size, and download instantly.",
    category: "PDF",
    keywords: [
      "image to pdf",
      "jpg to pdf",
      "png to pdf",
      "convert images to pdf",
      "picture to pdf",
    ],
    longDescription:
      "Turn one or more images into a single PDF with our Image to PDF tool. Choose page size (A4, Letter, or fit-to-image), reorder pages by dragging, and download the result. Everything runs locally with pdf-lib, so your images stay private.",
    faqs: [
      {
        q: "Which image formats are supported?",
        a: "JPG, PNG, and WebP are supported. Each image becomes one page in the output PDF.",
      },
      {
        q: "Can I choose the page size?",
        a: "Yes. Choose A4, US Letter, or fit-to-image. The image is centered on the chosen page size.",
      },
      {
        q: "Are my images uploaded to a server?",
        a: "No. All processing happens in your browser using pdf-lib. Your images never leave your device.",
      },
      {
        q: "Is there a file size limit?",
        a: "There's no fixed limit, but very large images or many images may be limited by browser memory.",
      },
    ],
    howToSteps: [
      "Drag and drop images into the upload area, or click to browse.",
      "Reorder images by dragging them in the list.",
      "Choose a page size (A4, Letter, or fit-to-image).",
      "Click Create PDF and download the result.",
    ],
    accent: "#06b6d4",
  },
  {
    slug: "compress-pdf",
    name: "Compress PDF",
    description:
      "Shrink the size of a PDF by rasterizing its pages to a lower resolution. Reduce PDF file size in your browser.",
    category: "PDF",
    keywords: [
      "compress pdf",
      "reduce pdf size",
      "pdf compressor",
      "shrink pdf",
      "optimize pdf",
    ],
    longDescription:
      "Compress PDF reduces the file size of a PDF by rasterizing each page to a JPEG image at a resolution you choose. This is most effective on PDFs that contain large embedded images. Text-heavy PDFs may not compress as dramatically. All processing happens locally with pdf-lib and pdfjs-dist.",
    faqs: [
      {
        q: "How does PDF compression work?",
        a: "Each page is rendered to a JPEG image at the chosen quality, then reassembled into a new PDF. This dramatically reduces size for image-heavy PDFs.",
      },
      {
        q: "Will text still be searchable?",
        a: "No. After compression, the text in the PDF is part of an image and is no longer selectable or searchable. Use this for archival copies only.",
      },
      {
        q: "Are my PDFs uploaded anywhere?",
        a: "No. Compression runs entirely in your browser using pdfjs-dist and pdf-lib. Nothing leaves your device.",
      },
      {
        q: "What quality should I choose?",
        a: "Medium (72 DPI) is good for screen viewing. High (150 DPI) balances quality and size. Use High if you need to print the result.",
      },
    ],
    howToSteps: [
      "Upload a PDF file using drag-and-drop or the file picker.",
      "Choose a quality level (Low, Medium, or High).",
      "Click Compress PDF and wait for processing.",
      "Compare the original and compressed sizes, then download.",
    ],
    accent: "#ec4899",
  },
  {
    slug: "webp-to-png",
    name: "WebP to PNG",
    description:
      "Convert WebP images to PNG format with full transparency support. Fast, free, and 100% browser-based.",
    category: "Conversion",
    keywords: [
      "webp to png",
      "convert webp",
      "webp converter",
      "webp to png online",
    ],
    longDescription:
      "WebP is great for the web, but some applications still need PNG. Our WebP to PNG converter preserves transparency and runs entirely in your browser using the Canvas API. Convert a single image or a batch at once.",
    faqs: [
      {
        q: "Is transparency preserved?",
        a: "Yes. The PNG output preserves the alpha channel of the original WebP image.",
      },
      {
        q: "Are my images uploaded to a server?",
        a: "No. Conversion happens locally using the HTML Canvas API. Your images stay on your device.",
      },
      {
        q: "Can I convert multiple files at once?",
        a: "Yes. Drag in a batch of WebP files and download them all as PNGs, either individually or as a ZIP.",
      },
      {
        q: "Is there a file size limit?",
        a: "There's no hard limit, but extremely large images may be constrained by browser memory.",
      },
    ],
    howToSteps: [
      "Drag and drop WebP files into the upload area, or click to browse.",
      "Click Convert to PNG.",
      "Wait for the progress bar to complete.",
      "Download each PNG individually or all together as a ZIP.",
    ],
    accent: "#14b8a6",
  },
  {
    slug: "png-to-jpg",
    name: "PNG to JPG",
    description:
      "Convert PNG images to JPG format to reduce file size. Choose a background color for transparent areas.",
    category: "Conversion",
    keywords: [
      "png to jpg",
      "convert png",
      "png converter",
      "png to jpeg",
    ],
    longDescription:
      "PNG to JPG converts your PNG images into smaller JPG files. Because JPG doesn't support transparency, you can choose a background color to fill transparent areas. Runs entirely in your browser using the Canvas API.",
    faqs: [
      {
        q: "What happens to transparent areas?",
        a: "You can choose a background color (white by default) that fills transparent areas before saving as JPG.",
      },
      {
        q: "Are my images uploaded anywhere?",
        a: "No. Conversion uses the Canvas API locally in your browser. Your images never leave your device.",
      },
      {
        q: "Can I convert multiple PNGs at once?",
        a: "Yes. Batch conversion is supported — drop in multiple files and download them all as a ZIP.",
      },
      {
        q: "Will the output quality match the original?",
        a: "JPG is a lossy format, so there may be slight quality loss. You can adjust the quality slider to balance size and clarity.",
      },
    ],
    howToSteps: [
      "Drag and drop PNG files into the upload area, or click to browse.",
      "Choose a background color for transparent areas.",
      "Optionally adjust the JPG quality slider.",
      "Click Convert and download each JPG or all as a ZIP.",
    ],
    accent: "#f97316",
  },
  {
    slug: "jpg-to-webp",
    name: "JPG to WebP",
    description:
      "Convert JPG images to modern WebP format for smaller file sizes and better web performance.",
    category: "Conversion",
    keywords: [
      "jpg to webp",
      "convert to webp",
      "jpeg to webp",
      "webp converter",
    ],
    longDescription:
      "WebP files are typically 25-35% smaller than JPGs at equivalent quality, making them ideal for the web. Our JPG to WebP converter uses the Canvas API to encode WebP locally in your browser, so your images stay private.",
    faqs: [
      {
        q: "How much smaller will WebP be than JPG?",
        a: "WebP is typically 25-35% smaller than JPG at equivalent visual quality, depending on the image content.",
      },
      {
        q: "Are my images uploaded to a server?",
        a: "No. Conversion happens locally with the Canvas API. Your files never leave your device.",
      },
      {
        q: "Can I batch convert multiple JPGs?",
        a: "Yes. Drop in multiple JPG files and download them all as WebP, either individually or as a ZIP.",
      },
      {
        q: "Does every browser support WebP?",
        a: "All modern browsers (Chrome, Edge, Firefox, Safari 14+) support WebP. If you're targeting very old browsers, consider keeping a JPG fallback.",
      },
    ],
    howToSteps: [
      "Drag and drop JPG files into the upload area, or click to browse.",
      "Adjust the quality slider (1-100) if needed.",
      "Click Convert to WebP.",
      "Download each WebP file individually or all as a ZIP.",
    ],
    accent: "#22c55e",
  },
];

/** Site-wide config used for metadata, sitemap, and JSON-LD */
export const SITE_CONFIG = {
  name: "ToolKit",
  title: "ToolKit — Free Online Image & PDF Tools",
  description:
    "Free, private, browser-based tools to compress images, convert HEIC to JPG, merge and split PDFs, and more. No uploads, no sign-up.",
  url: "https://your-toolkit.example.com",
  // Placeholder AdSense publisher ID — replace with your own.
  adsenseClient: "ca-pub-XXXXXXXXXXXXXXXX",
};

export function getToolBySlug(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
