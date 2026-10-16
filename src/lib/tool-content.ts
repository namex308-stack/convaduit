/**
 * Unique long-form SEO content for each tool page.
 *
 * Each entry is markdown that renders as a short blog post on the tool page.
 * This gives every tool page unique, keyword-rich content that search
 * engines can index — improving ranking for long-tail queries.
 *
 * Content guidelines:
 *  - 200-400 words per tool
 *  - Includes H2 headings (## ...)
 *  - Mentions the tool name and primary keywords naturally
 *  - Links to related tools using relative paths
 *  - Avoids duplicate content across tools
 */

export const TOOL_CONTENT: Record<string, string> = {
  "compress-image": `## Why compress images before uploading?

Every image you upload to a website, attach to an email, or share on social media travels across networks and sits in storage. Large images slow down page loads, eat into mobile data plans, and eat cloud storage. Compressing images before they leave your device is the single most effective way to reduce their footprint without sacrificing the visual quality your viewers expect.

Our [Compress Image tool](/tools/compress-image) runs entirely in your browser using the Canvas API and the \`browser-image-compression\` library. Your photos never leave your device — a critical privacy advantage when you're working with personal pictures, scanned documents, or client work.

## How browser-based compression works

When you drop an image into the tool, your browser decodes it into a pixel buffer, re-encodes it at the quality level you choose (1-100), and produces a smaller Blob you can download. Because no server roundtrip is involved, compression happens at the speed of your device's CPU — typically under a second for images under 10 MB.

For batch compression, the tool processes each file sequentially and updates a progress bar so you always know how far along it is.

## Best practices for image compression

- **Start at quality 75** — visually identical to most viewers, cuts file size by 60-80%
- **Use PNG for screenshots** with text — JPG artifacts make text look fuzzy
- **Use JPG or WebP for photos** — much smaller than PNG at equivalent quality
- **Avoid re-compressing** already-compressed images — quality degrades with each pass

If you need an even smaller format, convert your compressed JPG to [WebP](/tools/jpg-to-webp) for an additional 25-35% reduction.`,

  "heic-to-jpg": `## Why convert HEIC to JPG?

Apple adopted HEIC as the default photo format on iPhones starting with iOS 11 in 2017. HEIC files are roughly half the size of equivalent JPGs, which is great for storage — but they break the moment they leave the Apple ecosystem. Windows PCs, most web upload forms, email clients, and older software simply don't know what to do with a \`.heic\` file.

That's where our [HEIC to JPG converter](/tools/heic-to-jpg) comes in. It uses the \`heic2any\` library, which wraps libheif compiled to WebAssembly, to decode HEIC files directly in your browser. No upload, no server, no privacy concern.

## How the conversion works

When you drop a HEIC file into the tool, the WASM decoder reads the HEVC-encoded image data, decompresses it into raw pixels, and re-encodes those pixels as JPEG. You control the JPG quality (30-100) with a slider — lower quality means smaller files but more visible artifacts.

Conversion typically takes 1-3 seconds per image depending on resolution and your device's CPU. Batch conversion is supported: drop in 20 HEIC files and download them all as JPGs.

## When to keep HEIC vs convert

Keep HEIC when:
- Photos stay on your iPhone or Mac
- You're archiving to iCloud
- Storage space matters more than compatibility

Convert to JPG when:
- Sharing with Android or Windows users
- Uploading to websites that reject HEIC
- Sending photos via email
- Using older image editing software

For web publishing, consider converting further to [WebP](/tools/jpg-to-webp) for smaller file sizes.`,

  "merge-pdf": `## Free online PDF merger for combining files

Use the [free PDF merger](/tools/merge-pdf) to combine two or more PDF files into one document in your browser. If you want to merge PDF files online for free or combine PDF documents without installing software, add your files, choose their order, and download the merged PDF. There is no charge to use the tool.

The merge runs locally in your browser; the PDF file contents are not uploaded to our server for processing. The website itself needs an internet connection to load. Very large files or many PDFs may be limited by available browser memory.

## Put the PDFs in the right order

Add the PDFs, then use the up and down controls beside each file to set the sequence. The first file supplies the opening pages, followed by each file in the displayed order. You can remove a file before merging if you change your mind.

This tool combines whole files, not selected pages. To change the order of pages within a document or include only certain pages, first use [Split PDF](/tools/split-pdf) to extract the pages you need.

## What to check in the merged PDF

The tool copies pages into a new PDF without converting them to images. Do not assume that every document-level feature—such as forms, bookmarks, attachments, metadata, or digital signatures—will be preserved. In particular, a source digital signature does not validate the newly merged document. Open the result and check its content and features before sharing or relying on it.

Combining PDFs is useful for assembling contracts and appendices, putting a portfolio in one file, or joining document scans. For best results, make sure each source PDF opens correctly and that you have permission to combine its contents.

For a reverse workflow, see [how to split a PDF](/blog/how-to-split-pdf-pages).`,

  "split-pdf": `## Extracting pages from a PDF

PDFs often arrive as one large file when you only need a few pages. A 200-page manual where you only want chapter 3. A scanned tax return where you only need page 4. A combined contract where you only need the signature page.

Our [Split PDF tool](/tools/split-pdf) lets you extract exactly the pages you want using a simple range syntax. Type \`1-3, 5, 7-9\` and you get a new PDF containing pages 1, 2, 3, 5, 7, 8, and 9 — nothing more.

## How the page range syntax works

The parser accepts:
- **Ranges**: \`1-10\` extracts pages 1 through 10 (inclusive)
- **Single pages**: \`5\` extracts just page 5
- **Mixed**: \`1-3, 5, 7-9\` combines ranges and singles, comma-separated
- **Whitespace**: \`1 - 3 , 5\` works too — spaces are ignored

Each range produces one output PDF. So \`1-3, 5, 7-9\` produces three files: pages 1-3, page 5, and pages 7-9. Download them individually or as a batch.

## Common use cases

- **Extract a chapter** from a long manual or textbook
- **Pull signature pages** from a multi-party contract
- **Save specific slides** from a presentation deck
- **Split a scan batch** into individual documents

The tool uses \`pdf-lib\` client-side, so your PDF never leaves your device. For the reverse operation, see [Merge PDF](/tools/merge-pdf). To shrink a PDF before splitting, try [Compress PDF](/tools/compress-pdf).`,

  "pdf-to-word": `## Extracting text from PDFs for editing

PDF is a final-format document type — designed for printing and viewing, not editing. But sometimes you need to edit the text inside a PDF: update a contract clause, fix a typo in a resume, or repurpose content from a white paper.

Our [PDF to Word tool](/tools/pdf-to-word) extracts the text content from a PDF using Mozilla's PDF.js library and packages it as a \`.doc\` file you can open in Microsoft Word, Google Docs, or LibreOffice. The conversion runs entirely in your browser.

## What gets preserved (and what doesn't)

**Preserved:**
- All selectable text in the PDF
- Paragraph breaks (roughly)
- Reading order (top-to-bottom, left-to-right)

**Not preserved:**
- Embedded images (logos, photos, charts)
- Complex table layouts
- Custom fonts and styling
- Hyperlinks
- Form fields

This tool prioritizes accurate text extraction over visual fidelity. If you need a pixel-perfect conversion, you'll need a commercial OCR service.

## A note on scanned PDFs

If your PDF was created by scanning paper documents, it contains images of text — not actual text characters. The extractor can't read text from images. You'd need an OCR tool (like Tesseract) to convert the scanned images back to editable text.

For original digital PDFs (exported from Word, Google Docs, InDesign), the extractor works great. Combine the result with our [Compress Image tool](/tools/compress-image) if you need to embed extracted images later.`,

  "image-to-pdf": `## Turning images into a single PDF

There are plenty of reasons to convert images into a PDF: assembling a photo album, creating a portfolio, packaging scanned receipts for an expense report, or sending multiple images as a single attachment.

Our [Image to PDF tool](/tools/image-to-pdf) accepts JPG, PNG, and WebP images and combines them into one PDF. You can reorder images by dragging, choose the page size (A4, US Letter, or fit-to-image), and download the result. Everything happens in your browser via the \`pdf-lib\` library.

## Choosing the right page size

- **A4 (210×297mm)** — international standard, best for documents meant to be printed in Europe/Asia
- **US Letter (8.5×11in)** — North American standard, best for documents meant to be printed in the US/Canada
- **Fit to image** — each page is exactly the size of its image, no margins. Best for digital-only viewing.

Images are centered on the page and scaled to fit while preserving aspect ratio. White space fills the rest of the page.

## Tips for best results

- **Order matters**: drag images into the order you want pages to appear
- **Use consistent orientation**: mixing portrait and landscape images in the same PDF works but looks jarring
- **Compress first**: if your images are large, run them through [Compress Image](/tools/compress-image) first to keep the PDF manageable
- **Convert HEIC first**: if your images are in HEIC format, use [HEIC to JPG](/tools/heic-to-jpg) before this tool

For the reverse — extracting images from a PDF — pair this with [PDF to Word](/tools/pdf-to-word) for text or use a screenshot tool for images.`,

  "compress-pdf": `## Shrinking oversized PDF files

PDFs have a habit of growing large. Image-heavy reports, scanned documents, and embedded fonts can balloon a 200 KB file into 20 MB — too big for email attachments, too slow for website downloads, and too costly for cloud storage.

Our [Compress PDF tool](/tools/compress-pdf) reduces PDF file size by rasterizing each page to a JPEG image at a quality level you choose, then reassembling those images into a new PDF. It uses \`pdfjs-dist\` (Mozilla's PDF.js) and \`pdf-lib\` together, all in your browser.

## Three quality levels explained

- **Low (smallest file)**: renders pages at 1.5× scale with JPEG quality 0.45. Best for screen-only viewing. Text may look slightly soft.
- **Medium (recommended)**: 1.5× scale, JPEG quality 0.65. Good balance of size and readability. Most documents look fine.
- **High (best quality)**: 1.5× scale, JPEG quality 0.82. Largest output but clearest text. Use for archival copies.

Typical compression ratios: 60-85% smaller for image-heavy PDFs, 30-50% for text-heavy PDFs.

## What you trade for smaller size

After compression, **text is no longer searchable or selectable** — it's part of the rasterized image. Use this tool for archival copies or sharing, not for documents you need to search inside. Keep your original PDF for that.

## When to use other tools instead

- For [merging](/tools/merge-pdf) multiple PDFs into one (no quality loss)
- For [splitting](/tools/split-pdf) a PDF into smaller pieces (no quality loss)
- For [extracting text](/tools/pdf-to-word) from a PDF (preserves searchability)

Compress PDF is best when you need to shrink a single PDF for sharing or storage.`,

  "webp-to-png": `## Converting WebP images to PNG

WebP is Google's modern image format — it produces files 25-35% smaller than JPG and 60-80% smaller than PNG. Most modern browsers support it, but some older software doesn't. If you've downloaded a WebP image and need it as a PNG for compatibility, our [WebP to PNG converter](/tools/webp-to-png) is the fastest way.

The tool uses your browser's Canvas API to decode the WebP and re-encode it as PNG. Transparency is fully preserved — if the original WebP had an alpha channel, the PNG will too.

## When WebP → PNG makes sense

- **Editing in older software**: Photoshop CS6 and earlier don't support WebP natively
- **Email attachments**: some email clients reject WebP attachments
- **Print workflows**: many print shops expect JPG or PNG, not WebP
- **Embedded systems**: industrial displays, kiosks, and older e-readers often only support JPG/PNG
- **Documentation**: Word documents, PDFs, and presentations sometimes don't accept WebP inserts

## When to keep WebP instead

- **Web publishing** — WebP is universally supported in modern browsers and significantly smaller
- **Mobile apps** — modern iOS and Android both support WebP natively
- **Email signatures** — most modern email clients (Gmail, Outlook 2019+) handle WebP

## PNG vs JPG: which to choose?

If your image has transparency, PNG is your only option (JPG doesn't support alpha channels). If it's a photo with no transparency, [PNG to JPG](/tools/png-to-jpg) will produce a smaller file. For web use, consider [JPG to WebP](/tools/jpg-to-webp) instead — same visual quality, 25-35% smaller.`,

  "png-to-jpg": `## Converting PNG to JPG

PNG is the format of choice for screenshots, diagrams, and images with transparency — but it's a lossless format, which means file sizes balloon for photographs. A 5 MB JPG photo saved as PNG becomes 25 MB.

Our [PNG to JPG converter](/tools/png-to-jpg) re-encodes PNG images as JPG, which uses lossy compression to achieve dramatically smaller file sizes. The tool runs entirely in your browser using the Canvas API.

## Handling transparency

JPG doesn't support transparency — every pixel must be a solid color. When you convert a PNG with transparent areas, the tool fills those areas with a background color you choose (white by default). This is important for:

- **Logos with transparent backgrounds** — pick a background color that matches where you'll use them
- **Icons and UI elements** — typically white or black backgrounds
- **Stickers and clip art** — choose a color that complements the design

## Quality trade-off

JPG compression is lossy — some image data is discarded to achieve smaller files. The tool lets you choose quality (1-100):

- **90-100**: visually identical to the PNG, modest size reduction
- **75-85**: most users can't tell the difference, 60-80% smaller
- **60-75**: visible artifacts in detailed areas, 80-90% smaller

## When to keep PNG instead

- **Screenshots with text** — JPG artifacts make text look fuzzy
- **Images with transparency** — unless you can commit to a background color
- **Images you'll edit again** — every JPG re-save loses quality

For web publishing, consider [JPG to WebP](/tools/jpg-to-webp) for an additional size reduction over JPG.`,

  "jpg-to-webp": `## Converting JPG to WebP

WebP is the modern image format developed by Google. It produces files 25-35% smaller than JPG at equivalent visual quality, plus it supports transparency (which JPG doesn't) and animation (which JPG doesn't). Every major browser has supported WebP since 2020.

Our [JPG to WebP converter](/tools/jpg-to-webp) re-encodes JPG images as WebP using your browser's Canvas API. Files never leave your device, and conversion takes a fraction of a second per image.

## Why WebP wins for the web

- **25-35% smaller** than JPG at the same visual quality — directly faster page loads
- **Supports transparency** — replaces PNG for graphics with alpha channels
- **Supports animation** — replaces GIF with 60-80% smaller files
- **Universally supported** — Chrome, Firefox, Safari, Edge all support it

For a website with 50 product images, switching from JPG to WebP can cut total page weight by 1-3 MB — directly improving Core Web Vitals and SEO rankings.

## Quality settings

The tool accepts quality 1-100 (default 85). For most photographs:
- **80-85**: visually identical to the JPG, 25-30% smaller
- **70-75**: minor artifacts in detailed areas, 35-40% smaller
- **60-65**: visible artifacts, 45-50% smaller — use for thumbnails

## When not to use WebP

- **Email signatures** — Outlook desktop doesn't support WebP
- **Older embedded systems** — industrial displays, kiosks
- **Print workflows** — WebP is optimized for screen, not print

For the reverse conversion, see [WebP to PNG](/tools/webp-to-png). To compress JPGs without converting, use [Compress Image](/tools/compress-image).`,

  // YouTube tools

  "youtube-thumbnail-downloader": `## Downloading YouTube thumbnails in HD

Every YouTube video has multiple thumbnail images at different resolutions — from the tiny 120×90 default up to the full 1280×720 HD version. These thumbnails are stored on Google's CDN at predictable URLs, and our [YouTube Thumbnail Downloader](/tools/youtube-thumbnail-downloader) makes it easy to grab any of them in one click.

Just paste a YouTube URL (watch, youtu.be, shorts, or embed links all work), and the tool fetches the video metadata via YouTube's oEmbed API, then offers download links for every available resolution.

## What you can do with downloaded thumbnails

- **Study what makes top creators' thumbnails click-worthy** — analyze composition, text placement, color choices
- **Grab a still frame** from a video for use as a custom thumbnail elsewhere
- **Save a backup** of your own video's thumbnail before YouTube's algorithm tests a different one
- **Create tutorial content** showing thumbnail examples

## Which resolution to choose

- **maxresdefault (1280×720)** — the full HD thumbnail. Best for analysis and reuse. Not all videos have this — older uploads may cap out at SD.
- **sddefault (640×480)** — standard definition. Good fallback when maxres is missing.
- **hqdefault (480×360)** — always available, decent quality.
- **mqdefault (320×180)** and **default (120×90)** — small thumbnails for quick reference.

## Copyright note

Thumbnails are owned by the video creator. Downloading for personal research, inspiration, or commentary is generally fine. Don't republish someone else's thumbnail without permission — especially not commercially.

Once you've studied what works, design your own with our [YouTube Thumbnail Resizer](/tools/youtube-thumbnail-resizer) and test it with the [Thumbnail Tester](/tools/youtube-thumbnail-tester).`,

  "youtube-thumbnail-resizer": `## Sizing thumbnails for YouTube

YouTube requires custom thumbnails to be exactly 1280×720 pixels (16:9 aspect ratio), under 2 MB, in JPG, PNG, BMP, or GIF format. If your image isn't already 16:9, YouTube will crop it — and you won't get to choose what gets cut.

Our [YouTube Thumbnail Resizer](/tools/youtube-thumbnail-resizer) puts you in control. Upload any image, drag to reposition it within the 1280×720 frame, and the tool crops it precisely. The optional **safe zone overlay** shows you the central 80% where text and faces won't be clipped by YouTube's mobile UI.

## Why the safe zone matters

YouTube's player overlays elements on top of your thumbnail:
- **Timestamp** in the bottom-right corner
- **Progress bar** along the bottom
- **Duration** badge
- **Mobile UI** can crop the edges on phones

Important text, faces, and key visuals should stay inside the central 80% (the safe zone). Anything outside might be hidden.

## How to use the resizer

1. Upload an image (JPG, PNG, or WebP — any dimensions)
2. The tool auto-fits the image to cover the 1280×720 frame
3. Drag to reposition — the image always fills the frame
4. Toggle the safe-zone overlay to verify your text/faces are inside
5. Click Download to save a 1280×720 PNG, ready for YouTube upload

The cropping uses the Canvas API, so your image stays on your device. Once you've designed your thumbnail, [test it at different sizes](/tools/youtube-thumbnail-tester) to make sure it's legible on mobile.`,

  "youtube-tags-extractor": `## Finding the tags any YouTube video uses

YouTube tags are hidden from viewers — they're stored in the video's metadata and used by YouTube's algorithm to understand what the video is about. While YouTube has said tags play a minimal role in search ranking, they still help with disambiguation and related-video suggestions.

Our [YouTube Tags Extractor](/tools/youtube-tags-extractor) fetches the video page and parses the \`<meta name="keywords">\` tag, which contains the creator's tags. Everything runs in your browser — no API key required.

## How to use extracted tags

- **Competitor research**: see what tags top-ranking videos in your niche use
- **Keyword gap analysis**: compare your tags to a competitor's to find missed opportunities
- **Topic discovery**: tags reveal how creators categorize their content
- **Trend spotting**: clusters of similar tags across popular videos suggest trending topics

## Why some videos have no tags

YouTube de-emphasized tags in 2023, and many creators stopped adding them. If the extractor finds no tags, the video simply doesn't have any. This isn't an error — it's a signal that the creator relies on title, description, and engagement for discovery instead.

## Don't just copy tags

Blindly copying a competitor's tags won't help your videos rank. Tags work best when they accurately describe your specific content. Use the extracted tags as research to understand the topic landscape, then craft your own relevant tags.

For keyword research beyond tags, try our [YouTube Title Generator](/tools/youtube-title-generator) and [YouTube Hashtag Generator](/tools/youtube-hashtag-generator).`,

  "youtube-title-generator": `## Writing YouTube titles that get clicks

Your video's title is the single biggest factor in click-through rate (CTR). A great title can 5x your views; a bad one can sink an otherwise excellent video. But writing titles is hard — you need to balance SEO keywords, curiosity, clarity, and length.

Our [YouTube Title Generator](/tools/youtube-title-generator) takes your topic and produces 20 title variations using proven CTR templates: how-to, listicle, question, curiosity gap, and more. Each title includes a live character counter that turns amber past 70 characters (mobile truncation point) and red past 100 (hard limit).

## Title length best practices

- **Under 70 characters**: full title visible on mobile and in search results
- **70-100 characters**: may truncate on mobile, fully visible on desktop
- **Over 100 characters**: hard limit — YouTube cuts it off

Aim for 60-70 characters whenever possible. Front-load the most important words so even truncated titles make sense.

## Title patterns that work

- **How to X** — clear value, searches well
- **X Tips for Y** — listicle promise, easy to scan
- **The Truth About X** — curiosity gap
- **I Tried X for 30 Days** — personal experience
- **X Mistakes to Avoid** — fear of missing out
- **X Explained in Y Minutes** — time-bounded promise

## Don't clickbait

YouTube's algorithm now penalizes titles that promise something the video doesn't deliver. If viewers click but bounce in 10 seconds, your watch time tanks and YouTube stops recommending the video. Make sure your title accurately reflects the content.

Pair your title with a great thumbnail using the [Thumbnail Resizer](/tools/youtube-thumbnail-resizer), and write a structured [description](/tools/youtube-description-generator) for SEO.`,

  "youtube-description-generator": `## Writing YouTube descriptions that rank

Your video's description is the second-most-important SEO field after the title. YouTube's algorithm reads it for keywords, viewers scan it for context, and the first 125 characters appear in search results.

Our [YouTube Description Generator](/tools/youtube-description-generator) builds a structured description with: a hook (first 1-2 lines), timestamp chapters, an "about this video" section, social links, and hashtags. Fill in your details, copy the result, paste into YouTube Studio.

## The first 125 characters matter most

YouTube shows only the first 1-2 lines of your description in search results and above the "Show more" fold on mobile. Those lines need to:
- Repeat your primary keyword naturally
- Promise what the video delivers
- Compel the viewer to click

Don't waste those lines with "Hey guys, welcome back to my channel." Get straight to the value.

## Timestamps create chapters

Add lines starting with a time (e.g. \`0:00 Intro\`, \`1:23 Main Topic\`) and YouTube automatically creates chapter markers in the video player. Chapters:
- Improve viewer retention (people can jump to what they want)
- Show up in Google search results as video segments
- Make your video more accessible

## How long should a description be?

YouTube allows up to 5,000 characters. Aim for at least 250 — enough to include a summary, timestamps, links, and relevant keywords. Don't stuff keywords unnaturally; write for humans first.

For maximum SEO, pair your description with optimized [hashtags](/tools/youtube-hashtag-generator) and a compelling [title](/tools/youtube-title-generator).`,

  "youtube-hashtag-generator": `## Using hashtags on YouTube

Hashtags on YouTube help the algorithm group your video with related content and surface it in the "Hashtag" pages. When you add hashtags to your description, the first three appear above your title on mobile — making them visible at a glance.

Our [YouTube Hashtag Generator](/tools/youtube-hashtag-generator) takes your topic or niche and produces a mix of broad, niche, and long-tail hashtags. Click to copy individual tags, or copy the top 10 at once.

## How many hashtags to use

YouTube allows up to 60 hashtags per description, but more than 15 can be flagged as spam. Best practice:

- **5-10 highly relevant hashtags** — sweet spot for most videos
- **First 3 matter most** — these appear above the title on mobile
- **Mix broad and specific** — \`#personal finance\` (broad) + \`#investingforbeginners\` (specific)

## Hashtag best practices

- **Be specific**: \`#personalfinance\` is too broad to surface your video; \`#investingforbeginners\` has less competition
- **Use trending tags when relevant**: \`#2025\`, \`#shorts\` if they actually fit
- **Avoid spammy repetition**: don't repeat the same tag with slight variations
- **Match the video**: tags that don't reflect content hurt retention

## Hashtags vs tags

YouTube tags (hidden metadata) and hashtags (visible in description) are different systems with different roles. Tags help with disambiguation; hashtags help with grouping. Use both — extract competitor tags with our [Tags Extractor](/tools/youtube-tags-extractor).`,

  "youtube-money-calculator": `## How much do YouTubers actually make?

YouTube earnings vary wildly — from $0.50 to $35 per 1,000 views, depending on niche, audience geography, and ad format. Our [YouTube Money Calculator](/tools/youtube-money-calculator) estimates ad revenue based on monthly views and content category, using real-world CPM (cost per mille) ranges.

## How YouTube ad revenue works

Advertisers pay YouTube per 1,000 ad impressions (CPM). YouTube keeps 45% and pays creators 55% (RPM — revenue per mille). Actual CPMs depend on:

- **Niche**: finance and tech attract premium advertisers; entertainment and music pay less
- **Audience geography**: viewers in the US/UK/Canada generate higher CPMs than viewers in lower-GDP countries
- **Watch time**: longer videos serve more ads
- **Ad format**: skippable video ads pay more than display ads

## CPM ranges by niche

- **Finance / Investing**: $15-35 CPM (highest)
- **Tech / Software**: $8-20 CPM
- **Education / How-to**: $6-15 CPM
- **Gaming**: $3-8 CPM
- **Entertainment**: $2-6 CPM
- **Music**: $1-4 CPM (lowest)

Our calculator applies the appropriate RPM factor (50-60% of CPM) to give you the creator's actual take-home range.

## What this calculator doesn't include

- **Sponsorships**: often 2-5x ad revenue for mid-sized channels
- **Channel memberships**: recurring monthly revenue
- **Super Chat & Super Thanks**: viewer tips during streams
- **Merchandise**: physical product sales
- **Affiliate links**: commissions on recommended products

For serious income estimation, add these on top of the ad revenue estimate. Then write better [titles](/tools/youtube-title-generator) and [descriptions](/tools/youtube-description-generator) to grow your views.`,

  "youtube-thumbnail-tester": `## Why you need to test thumbnails at small sizes

Over 70% of YouTube watch time happens on mobile. On a phone, your thumbnail is rendered at roughly 210×118 pixels — smaller than a postage stamp. If your text isn't legible and your face isn't recognizable at that size, viewers will scroll past.

Our [YouTube Thumbnail Tester](/tools/youtube-thumbnail-tester) shows your thumbnail at the actual pixel sizes YouTube uses across devices: mobile feed (210×118), desktop search (246×138), sidebar suggestion (168×94), notification (120×68), and TV (1280×720).

## How to use the tester

1. **Upload your thumbnail** (any image format) OR paste a YouTube URL to load an existing video's thumbnail
2. **Scroll through the preview cards** showing each display size
3. **Verify text is legible** at the smallest sizes (120×68 notification is the toughest test)
4. **Check face visibility** — faces should be recognizable at 168×94
5. **Redesign if needed** — make text bigger, simplify the composition, increase contrast

## Design for the smallest size first

A common mistake is designing a thumbnail at full 1280×720 size and assuming it'll look good everywhere. It won't. Design for the smallest size first — if it works at 120 pixels, it'll work everywhere.

Tips for small-size legibility:
- **Limit text to 3-5 words** — long sentences become illegible
- **Use high contrast** — white text on dark background or vice versa
- **Make faces large** — at least 30% of the frame
- **Avoid thin fonts** — they disappear at small sizes

Once your thumbnail passes the test, [resize it to 1280×720](/tools/youtube-thumbnail-resizer) and upload it to YouTube.`,

  "youtube-channel-id-finder": `## Finding a YouTube channel ID

Every YouTube channel has a unique 24-character identifier starting with "UC" (e.g. \`UCxxxxxxxxxxxxxxxxxxxxxx\`). This ID is what the YouTube Data API, RSS feeds, and third-party analytics tools use to reference the channel.

Finding the channel ID used to require digging through page source. Our [YouTube Channel ID Finder](/tools/youtube-channel-id-finder) resolves it automatically from any YouTube URL — video, channel link, or @handle — using the public oEmbed API. No API key required.

## Three ways to find a channel ID

1. **From a video URL** (most reliable): paste any video URL from the channel. We use oEmbed to get the author URL, which contains the channel ID.
2. **From a /channel/ URL**: paste a URL like \`youtube.com/channel/UCxxxx\` and we extract the ID directly.
3. **From a @handle URL**: paste \`youtube.com/@name\` and we fetch the channel page via a CORS proxy to extract the ID from meta tags.

## What channel IDs are used for

- **YouTube Data API v3**: every API request requires the channel ID
- **RSS feeds**: \`https://www.youtube.com/feeds/videos.xml?channel_id=UCxxxx\` gives you the channel's latest videos as RSS
- **Analytics tools**: SocialBlade, Noxinfluencer, and similar tools use the channel ID
- **Embedding**: some embed widgets require the channel ID rather than the URL

## Why video URLs are most reliable

YouTube's @handle system is relatively new (2022), and the mapping from handle to channel ID isn't always exposed cleanly. Video URLs, on the other hand, always include the channel ID via the oEmbed API — which has been stable for over a decade.

Once you have the channel ID, estimate the channel's earnings with our [YouTube Money Calculator](/tools/youtube-money-calculator).`,

  "youtube-timestamp-link-generator": `## Sharing YouTube videos at specific timestamps

Ever wanted to share a YouTube video but skip the 3-minute intro? Or link directly to the moment in a podcast where someone says something interesting? YouTube supports timestamp links — URLs that automatically start the video at a specific time.

Our [YouTube Timestamp Link Generator](/tools/youtube-timestamp-link-generator) takes a YouTube URL and one or more timestamps, then generates shareable deep links in the format \`youtu.be/VIDEO_ID?t=SECONDS\`.

## How timestamp links work

YouTube's URL parameter \`?t=\` accepts seconds (not minutes:seconds). The link \`https://youtu.be/dQw4w9WgXcQ?t=43\` starts the video at 43 seconds. When a viewer clicks the link:
- **Desktop browser**: opens YouTube at the timestamp
- **Mobile browser**: opens YouTube at the timestamp
- **YouTube app**: opens the app and starts at the timestamp

## Accepted timestamp formats

The generator accepts:
- **Pure seconds**: \`90\` → 1:30
- **Minutes:seconds**: \`1:30\` → 90 seconds
- **Hours:minutes:seconds**: \`1:02:03\` → 3,723 seconds

It converts all formats to seconds automatically for the URL parameter, but displays the human-readable timestamp next to each link.

## Use cases

- **Share the best moment** from a long podcast without making viewers scrub
- **Create a table of contents** for a tutorial video — generate links for each chapter
- **Cite a specific quote** in a research document
- **Link to a specific play** in a sports highlight video

You can also create timestamp chapters inside your own video description with our [Description Generator](/tools/youtube-description-generator).`,
};

/**
 * Get the markdown content for a tool by slug.
 * Returns undefined if no content exists for the slug.
 */
export function getToolContent(slug: string): string | undefined {
  return TOOL_CONTENT[slug];
}
