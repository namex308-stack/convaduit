---
title: "HEIC vs JPG: Which Format Should You Use?"
description: "A practical comparison of HEIC and JPG — file sizes, quality, compatibility, and when to use each format."
date: "2025-09-12"
author: "Convaduit Team"
tags: ["image", "heic", "jpg", "formats"]
coverImage: ""
---

If you've ever copied photos from a recent iPhone to a Windows PC or uploaded them to a website that rejected them, you've hit the HEIC vs JPG problem. Apple defaults to HEIC for photos because it produces smaller files, but the rest of the world still largely expects JPG. In this article, we'll compare the two formats in detail so you know exactly when to use each.

## What is HEIC?

HEIC (High Efficiency Image Container) is the image format Apple adopted starting with iOS 11 in 2017. It uses the HEVC (H.265) video codec to compress still images. A typical HEIC file is roughly half the size of an equivalent JPG at the same visual quality, which is a meaningful win when you're shooting hundreds of photos a month.

HEIC also supports some features JPG doesn't:

- **16-bit color** (vs JPG's 8-bit), which gives smoother gradients
- **Alpha channels** for transparency
- **Multiple images per file** (think Live Photos or image bursts)
- **Depth maps** for portrait-mode effects

The downside: not every app, browser, or operating system supports HEIC natively. While Safari, Chrome, and Firefox have all added support, many content management systems, email clients, and older apps still reject it.

## What is JPG?

JPG (Joint Photographic Experts Group) has been the dominant photo format since the early 1990s. It's a lossy format that throws away information the human eye is least likely to notice, achieving file sizes 5-10x smaller than uncompressed bitmaps.

JPG's biggest advantage is universal compatibility. Every browser, every operating system, every image editor, and every social media platform accepts JPG. If you're not sure what to use, JPG is the safe default.

The format's limitations:

- **No transparency** (white background is your only option)
- **8-bit color only** (potential banding in smooth gradients like blue skies)
- **Generational loss** (each re-save degrades quality slightly)
- **No multi-image containers**

## File size comparison

For a typical 12-megapixel smartphone photo at default quality:

| Format | Typical size | Quality loss |
|--------|--------------|--------------|
| JPG (quality 85) | 3.5 MB | Noticeable on close inspection |
| HEIC | 1.8 MB | Visually identical to JPG |
| JPG (quality 70) | 1.6 MB | Visible artifacts in detail areas |

HEIC's advantage shrinks at lower quality settings, but for everyday photography where visual quality matters, HEIC delivers the same perceptual quality at roughly half the file size.

## When to use HEIC

- **On your phone**: If you're shooting photos that will live on your device or in iCloud, keep HEIC. The storage savings add up fast.
- **For archival storage**: If disk space matters more than compatibility, HEIC is a reasonable archival format.
- **When you control the playback environment**: If you know the photos will only be viewed on Apple devices or modern browsers, HEIC's smaller size is a clear win.

## When to use JPG

- **Uploading to websites**: Most web forms, CMS platforms, and email clients still expect JPG. Save yourself a support ticket and convert first.
- **Sharing with non-Apple users**: Android and Windows users may not have HEIC codecs installed by default.
- **When you need maximum compatibility**: Print shops, older software, and embedded systems often only understand JPG.
- **For web publishing**: While modern browsers support HEIC, the JPG fallback is universal and the file size difference matters less when properly compressed.

## How to convert HEIC to JPG

If you need to convert HEIC files to JPG, you have a few options:

1. **On iPhone**: Settings → Photos → Transfer to Mac or PC → "Automatic" will convert HEIC to JPG during USB transfer.
2. **On macOS**: Preview can open and export HEIC files as JPG.
3. **Online**: Our [HEIC to JPG tool](/tools/heic-to-jpg) runs entirely in your browser using WebAssembly — your photos never leave your device.

The browser-based approach is especially nice for sensitive photos because there's no server upload to worry about.

## The bottom line

For most people, the answer is simple: **shoot in HEIC, share in JPG**. Keep HEIC as your default on iPhone to save storage, then convert to JPG when you need to share, upload, or send a photo to someone who might not have HEIC support.

Both formats have their place, and with the right tools, switching between them takes seconds.
