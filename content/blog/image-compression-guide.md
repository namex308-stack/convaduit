---
title: "The Complete Guide to Image Compression for the Web"
description: "Everything you need to know about compressing images for the web — formats, quality settings, responsive images, and the tools that actually work."
date: "2025-10-10"
author: "Convaduit Team"
tags: ["image", "compression", "performance", "web"]
coverImage: ""
---

Images are the largest payload on most web pages. According to the HTTP Archive, the median web page ships 900 KB of images — more than HTML, CSS, JavaScript, and fonts combined. If you're optimizing for performance, image compression is where you'll see the biggest wins.

This guide covers everything you need to know: the formats, the quality settings, the responsive image patterns, and the tools that will actually shrink your images without visible quality loss.

## Why image compression matters

A 3 MB hero image on a mobile page isn't just slow — it's expensive. On a typical 4G connection, that image adds 5-8 seconds to your load time. For users on metered data plans, it costs real money. And Google's Core Web Vitals explicitly measure Largest Contentful Paint, which is often dominated by hero images.

The good news: most images can be reduced to 20-30% of their original size with no perceptible quality loss. The trick is matching the format and quality setting to the content.

## Understanding lossy vs lossless

Image compression comes in two flavors:

### Lossless compression

Lossless compression reduces file size without discarding any data. The decompressed image is pixel-identical to the original. Formats:

- **PNG**: The most common lossless format, widely supported
- **WebP (lossless mode)**: 60-80% smaller than PNG
- **AVIF (lossless mode)**: Even smaller than WebP lossless

Use lossless when you need pixel-perfect reproduction: screenshots with text, diagrams, pixel art, or images you'll edit further.

### Lossy compression

Lossy compression discards information the eye is least likely to notice. The decompressed image is not identical to the original, but can look very similar at much smaller sizes. Formats:

- **JPG**: The classic lossy format, universal support
- **WebP (lossy mode)**: 25-35% smaller than JPG at equivalent quality
- **AVIF**: 20-30% smaller than WebP

Use lossy for photographs and complex images where minor artifacts are acceptable.

## Choosing the right format

Here's a decision tree:

1. **Is it a photograph or complex illustration with many colors?**
   - Yes → Use WebP (lossy) at quality 75-85
   - No → Continue

2. **Does it need transparency?**
   - Yes → Use WebP (lossy with alpha) or PNG (lossless)
   - No → Continue

3. **Is it a screenshot, diagram, or image with sharp edges and limited colors?**
   - Yes → Use WebP (lossless) or PNG
   - No → Continue

4. **Do you need animation?**
   - Yes → Use WebP (animated) instead of GIF
   - No → Default to WebP

WebP wins in almost every case for modern browsers. Use the `<picture>` element to serve JPG or PNG as a fallback.

## Quality settings that work

The "right" quality setting depends on the image content, but here are starting points that work for most cases:

| Content type | Recommended quality | Typical size reduction |
|--------------|--------------------|-----------------------|
| Hero photos | 80-85 | 70-80% smaller than original |
| Product photos | 75-80 | 75-85% smaller |
| Thumbnails | 65-75 | 85-95% smaller |
| Screenshots with text | Use lossless | 50-70% smaller (PNG → WebP lossless) |
| Background textures | 70-75 | 80-90% smaller |

The key insight: most images look identical to the human eye at quality 75 vs quality 100, but the file is 50% smaller. Always test on real images from your site rather than blindly trusting a number.

## Responsive images

Serving a 4000×3000 pixel image to a 400×300 pixel thumbnail is wasteful. The `srcset` attribute lets the browser pick the right size:

```html
<img
  src="photo-800.jpg"
  srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1200.jpg 1200w, photo-1600.jpg 1600w"
  sizes="(max-width: 600px) 400px, (max-width: 900px) 800px, 1200px"
  alt="Description"
>
```

Generate multiple sizes at build time using sharp (Node.js), libvips, or an image CDN. Most modern frameworks (Next.js, Astro, Eleventy) have this built in.

## Tools for compressing images

### Command-line tools

- **cwebp / dwebp**: Google's reference WebP encoder
- **pngquant**: Lossy PNG compression that preserves alpha
- **jpegoptim**: JPG optimizer with metadata stripping
- **squoosh-cli**: Google's all-in-one compressor

### Image CDNs

- **Cloudflare Images**: Auto-formats and resizes based on the requesting browser
- **Cloudinary**: Powerful transformation API
- **Vercel Image Optimization**: Built into Next.js deployments
- **Imgix**: URL-based image transformation

### Browser-based tools

- **Squoosh.app**: Google's open-source web app
- **TinyPNG**: Popular hosted tool (uploads files)
- **Convaduit's Compress Image**: Runs entirely in your browser, no uploads

For sensitive images — passport scans, medical photos, internal documents — the browser-based tools are the only safe option.

## Common mistakes to avoid

### 1. Compressing images multiple times

Each lossy re-save degrades quality. If you need to edit an image, keep the original and re-export to the final format. Don't compress, then compress again, then compress a third time.

### 2. Ignoring metadata

EXIF data (camera model, GPS coordinates, timestamps) can add 50-200 KB per image. Most compression tools strip this by default, but verify with `exiftool` if you're unsure.

### 3. Using PNG for photos

PNG's lossless compression is terrible for photographs. A 5 MB JPG photo saved as PNG becomes 25 MB. Use PNG only for images with sharp edges and limited colors.

### 4. Not lazy-loading below-the-fold images

Images below the fold shouldn't load until the user scrolls near them. Add `loading="lazy"` to defer loading:

```html
<img src="photo.jpg" loading="lazy" alt="Description">
```

This can cut initial page weight by 30-50% on long pages.

### 5. Forgetting width and height attributes

Without `width` and `height`, the browser doesn't know how much space to reserve for the image. This causes layout shifts (bad for Core Web Vitals). Always include them:

```html
<img src="photo.jpg" width="800" height="600" alt="Description">
```

## A practical workflow

Here's the workflow I use for optimizing images on a typical site:

1. **Export the original** at full resolution from your image editor (PNG or TIFF)
2. **Generate multiple sizes** (400w, 800w, 1200w, 1600w) using sharp or your framework's image tool
3. **Convert to WebP** at quality 80 for photos, lossless for graphics
4. **Keep JPG fallbacks** for older browsers
5. **Strip metadata** unless you need it (e.g., photo galleries showing EXIF)
6. **Use `<picture>`** to serve WebP with JPG fallback
7. **Add `loading="lazy"`** to below-the-fold images
8. **Always include `width` and `height`** to prevent layout shift

For one-off images where you don't want to set up a build pipeline, a browser-based compressor like our [Compress Image tool](/tools/compress-image) is a 30-second solution.

## Measuring the results

After compression, verify your results with:

- **PageSpeed Insights**: Shows image optimization opportunities
- **WebPageTest.org**: Detailed waterfall of every request
- **Chrome DevTools → Lighthouse**: Audit your page for image issues
- **Browser Network tab**: Sort by size to find the largest images

Aim for:

- **Largest Contentful Paint under 2.5 seconds** on mobile
- **No image over 200 KB** unless it's a hero photo
- **Total page weight under 1.5 MB** for content pages

## The bottom line

Image compression is the highest-leverage performance optimization on most websites. Switching from JPG to WebP alone will cut image weight by 25-35%, and combining that with proper resizing, lazy loading, and quality tuning can cut total page weight by 50-70%.

The techniques are well-established, the tools are free, and the impact on your users is real. There's no excuse not to do it.
