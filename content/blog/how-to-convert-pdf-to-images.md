---
title: "How to Convert PDF Pages to JPG, PNG, or WebP"
description: "Convert PDF pages into images by choosing a resolution and format that fit your screen, print, or sharing needs."
date: "2026-03-08"
modifiedDate: "2026-10-16"
author: "Convaudit Team"
tags: ["convert PDF to image", "PDF to JPG", "PDF to PNG"]
toolSlug: "pdf-to-image"
coverImage: ""
---

To convert a PDF page into an image, a PDF viewer renders the page at a chosen scale and saves the rendered pixels as JPG, PNG, or WebP. The right resolution depends on the page size and how the image will be used. Larger output dimensions can preserve small text when zoomed or printed, but they also create larger images.

## Choose an image format

| Format | Good fit | Trade-off |
| --- | --- | --- |
| **PNG** | Text, charts, diagrams, and sharp edges | Lossless encoding can produce larger files, especially for pages with photographs |
| **JPG** | Photos and pages intended for easy sharing | Lossy compression can add artifacts around fine text and lines |
| **WebP** | Web use when the destination supports it | Some apps and upload forms may not accept it |

There is no format that is best for every page. If text clarity is important, start with PNG; if file size matters and the page is mostly photographic, compare a JPG export at different quality settings.

## Pick a resolution for the page

PDF pages are described in physical units and vector elements, so text and line art can be rendered at different pixel sizes. At a given DPI, output width and height depend on the PDF page’s dimensions. As an example, a US Letter page rendered at 150 DPI is about 1,275 × 1,650 pixels; at 300 DPI it is about 2,550 × 3,300 pixels.

- **On-screen previews:** Start around 72–150 DPI, then increase it if small text is hard to read.
- **Slides or close-up viewing:** Try 150–200 DPI and check the pixel dimensions and file size.
- **Printing:** 300 DPI is a common starting point, but the print service’s requirements and the source PDF’s content should guide the final setting.

These are starting points, not guarantees of print quality. A raster export cannot add detail that is missing from the source, and a large multi-page PDF can use substantial memory at high resolutions.

## Convert pages in your browser

1. Open the [PDF to Image tool](/tools/pdf-to-image).
2. Select a resolution and output format.
3. Leave the page range empty to convert all pages, or enter specific pages such as `1, 3-5`.
4. Convert and review the preview and pixel dimensions before downloading.

The tool renders pages locally in your browser and lets you download image files or a ZIP. Conversion creates a raster image: text in the image is not selectable or searchable. Check color, small text, transparency, and file size before using the export in a document or print workflow.

To create a PDF from image files instead, see [how to convert images to PDF](/blog/how-to-convert-images-to-pdf).
