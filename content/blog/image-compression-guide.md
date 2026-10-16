---
title: "Compress Images for Web Pages: A Practical Guide"
description: "Optimize web images with a practical guide to dimensions, formats, responsive delivery, compression settings, and visual quality checks."
date: "2025-10-10"
modifiedDate: "2026-10-16"
author: "Convaudit Team"
tags: ["image compression", "web performance", "responsive images"]
toolSlug: "compress-image"
coverImage: ""
---

To make an image lighter for a website, first resize it to the largest dimensions it will actually be displayed at, then choose a format and compression level that still looks good at that size. Compare the exported file with the original: file-size savings vary with the image, dimensions, format, and settings.

## A practical image-optimization workflow

1. **Choose the display size.** A small card does not need the same pixel dimensions as a full-width banner. Keep a larger source copy in case the image is reused.
2. **Pick a suitable format.** JPEG works well for photographs; PNG is useful for graphics that need lossless encoding or transparency; WebP supports lossy and lossless encoding, transparency, and animation. Not every publishing system accepts every format.
3. **Adjust compression gradually.** Start with a moderate setting, inspect the image at its actual display size, and lower quality only while visible artifacts remain acceptable.
4. **Create responsive variants when needed.** Use `srcset` and `sizes` so browsers can select an image size suited to the layout. Google’s [image SEO guidance](https://developers.google.com/search/docs/appearance/google-images) and web.dev’s [responsive image guide](https://web.dev/articles/responsive-images) explain these patterns.
5. **Check the page, not just the file.** Confirm that the image loads at the intended dimensions, has useful alternative text, and does not cause a layout shift. Set `width` and `height` attributes when using HTML images.

```html
<img
  src="photo-800.jpg"
  srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1200.jpg 1200w"
  sizes="(max-width: 600px) 100vw, 800px"
  width="800"
  height="600"
  alt="A useful description of the image"
>
```

Use `loading="lazy"` for images that are below the initial viewport and not otherwise needed immediately. Do not lazy-load the page’s main hero image by default; delaying a prominent image can make it appear later.

## Choose a format based on the image

- **Photographs:** Compare JPEG and WebP at the same display dimensions. Keep the version with acceptable detail and the right compatibility for your site.
- **Screenshots and diagrams:** Try PNG or lossless WebP when sharp text or edges matter.
- **Transparency:** Check that the chosen output format and publishing system both preserve alpha transparency.
- **Animation:** Confirm support in the destination and whether a static fallback is needed.

Format names alone do not guarantee a smaller file. An image that has already been compressed or contains simple graphics may not shrink when converted.

## Compress images with Convaudit

The [Compress Image tool](/tools/compress-image) offers two modes. **Browser** mode is selected by default and processes images locally. **Python** mode sends the images to the configured backend for server-side processing; use Browser mode if you do not want the image uploaded to that backend.

The quality slider is a starting control, not a promised output size or visual-quality score. Compare the downloaded result at its intended display size, and keep the original so you can try another setting if needed.

For an explanation of format trade-offs, see [when WebP is a good choice](/blog/why-webp).
