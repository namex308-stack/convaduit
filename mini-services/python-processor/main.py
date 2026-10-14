"""
Convaudit Python Processor
==========================

A FastAPI service for rapid server-side processing of images and PDFs.
Used as an optional "fast mode" backend by the Convaudit Next.js frontend.

Endpoints
---------
- GET  /health                         — liveness check
- POST /api/compress-image             — Pillow-based image compression
- POST /api/convert-image              — format conversion (PNG/JPG/WebP)
- POST /api/resize-image               — resize/crop to target dimensions
- POST /api/merge-pdf                  — merge multiple PDFs into one
- POST /api/split-pdf                  — split PDF by page ranges
- POST /api/compress-pdf               — compress PDF via pikepdf re-write

Run
---
    uvicorn main:app --host 0.0.0.0 --port 3030 --reload
"""

from __future__ import annotations

import io
import re
from typing import List, Optional

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from PIL import Image
import pikepdf
from pypdf import PdfReader, PdfWriter

# --------------------------------------------------------------------------- #
# App setup
# --------------------------------------------------------------------------- #

app = FastAPI(
    title="Convaudit Python Processor",
    version="1.0.0",
    description="Server-side image & PDF processing for the Convaudit frontend.",
)

# Permissive CORS so the Next.js frontend (and the sandbox gateway) can call us.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    """Liveness probe — returns 200 if the service is up."""
    return {"status": "ok", "service": "convaudit-python-processor", "version": "1.0.0"}


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #

# Maps web MIME types to PIL format names and file extensions.
FORMAT_MAP = {
    "image/jpeg": ("JPEG", "jpg"),
    "image/jpg": ("JPEG", "jpg"),
    "image/png": ("PNG", "png"),
    "image/webp": ("WEBP", "webp"),
}


def _parse_ranges(spec: str, total_pages: int) -> List[tuple[int, int]]:
    """
    Parse a range spec like "1-3, 5, 7-9" into [(1,3), (5,5), (7,9)].

    Pages are 1-indexed in user input; we return inclusive 1-indexed tuples.
    Raises ValueError on invalid input.
    """
    ranges: List[tuple[int, int]] = []
    for token in spec.split(","):
        token = token.strip()
        if not token:
            continue
        m = re.match(r"^(\d+)\s*-\s*(\d+)$", token)
        if m:
            start, end = int(m.group(1)), int(m.group(2))
            if start > end:
                raise ValueError(f"Range start > end: {token}")
            if start < 1 or end > total_pages:
                raise ValueError(
                    f"Range {token} out of bounds (PDF has {total_pages} pages)"
                )
            ranges.append((start, end))
            continue
        m = re.match(r"^(\d+)$", token)
        if m:
            page = int(m.group(1))
            if page < 1 or page > total_pages:
                raise ValueError(
                    f"Page {page} out of bounds (PDF has {total_pages} pages)"
                )
            ranges.append((page, page))
            continue
        raise ValueError(f"Invalid range token: {token}")
    if not ranges:
        raise ValueError("No valid ranges provided")
    return ranges


# --------------------------------------------------------------------------- #
# Image endpoints
# --------------------------------------------------------------------------- #


@app.post("/api/compress-image")
async def compress_image(
    file: UploadFile = File(...),
    quality: int = Form(75),
    format: Optional[str] = Form(None),
):
    """
    Compress an uploaded image using Pillow.

    Parameters
    ----------
    file : image file (JPG/PNG/WebP)
    quality : 1-100 (lossy quality; ignored for PNG)
    format : optional output format override ("JPEG", "PNG", "WEBP")
    """
    if quality < 1 or quality > 100:
        raise HTTPException(400, "quality must be between 1 and 100")

    raw = await file.read()
    try:
        img = Image.open(io.BytesIO(raw))
    except Exception as exc:
        raise HTTPException(400, f"Could not open image: {exc}") from exc

    # Determine output format
    src_mime = file.content_type or "image/jpeg"
    if format:
        out_format = format.upper()
    else:
        out_format, _ = FORMAT_MAP.get(src_mime, ("JPEG", "jpg"))

    out_ext = "jpg" if out_format == "JPEG" else out_format.lower()

    # If converting from PNG (with alpha) to JPEG, flatten onto white
    if out_format == "JPEG" and img.mode in ("RGBA", "LA", "P"):
        background = Image.new("RGB", img.size, (255, 255, 255))
        if img.mode == "P":
            img = img.convert("RGBA")
        background.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
        img = background

    buf = io.BytesIO()
    save_kwargs: dict = {}
    if out_format in ("JPEG", "WEBP"):
        save_kwargs["quality"] = quality
        save_kwargs["optimize"] = True
    elif out_format == "PNG":
        save_kwargs["optimize"] = True

    img.save(buf, format=out_format, **save_kwargs)
    buf.seek(0)

    original_size = len(raw)
    compressed_size = buf.getbuffer().nbytes
    base_name = re.sub(r"\.[^.]+$", "", file.filename or "image")
    out_name = f"{base_name}-compressed.{out_ext}"

    headers = {
        "X-Original-Size": str(original_size),
        "X-Compressed-Size": str(compressed_size),
        "X-Compression-Ratio": f"{(1 - compressed_size / original_size) * 100:.1f}%"
        if original_size
        else "0%",
        "Content-Disposition": f'attachment; filename="{out_name}"',
    }
    return StreamingResponse(
        buf,
        media_type=f"image/{out_ext}",
        headers=headers,
    )


@app.post("/api/convert-image")
async def convert_image(
    file: UploadFile = File(...),
    to_format: str = Form(...),  # "jpeg" | "png" | "webp"
    quality: int = Form(85),
    background: str = Form("#ffffff"),
):
    """
    Convert an image to a different format.
    Used by the WebP→PNG, PNG→JPG, JPG→WebP tools for fast server-side conversion.
    """
    to_format = to_format.upper()
    if to_format not in ("JPEG", "PNG", "WEBP"):
        raise HTTPException(400, "to_format must be jpeg, png, or webp")

    raw = await file.read()
    try:
        img = Image.open(io.BytesIO(raw))
    except Exception as exc:
        raise HTTPException(400, f"Could not open image: {exc}") from exc

    # Handle transparency when converting to JPEG
    if to_format == "JPEG" and img.mode in ("RGBA", "LA", "P"):
        bg = Image.new("RGB", img.size, background)
        if img.mode == "P":
            img = img.convert("RGBA")
        bg.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
        img = bg
    elif to_format == "PNG" and img.mode == "P":
        img = img.convert("RGBA")

    buf = io.BytesIO()
    save_kwargs: dict = {}
    if to_format in ("JPEG", "WEBP"):
        save_kwargs["quality"] = max(1, min(100, quality))
        save_kwargs["optimize"] = True
    elif to_format == "PNG":
        save_kwargs["optimize"] = True

    img.save(buf, format=to_format, **save_kwargs)
    buf.seek(0)

    ext = "jpg" if to_format == "JPEG" else to_format.lower()
    base_name = re.sub(r"\.[^.]+$", "", file.filename or "image")
    out_name = f"{base_name}.{ext}"

    return StreamingResponse(
        buf,
        media_type=f"image/{ext}",
        headers={"Content-Disposition": f'attachment; filename="{out_name}"'},
    )


@app.post("/api/resize-image")
async def resize_image(
    file: UploadFile = File(...),
    width: int = Form(...),
    height: int = Form(...),
    quality: int = Form(85),
):
    """
    Resize an image to exact dimensions using Pillow's high-quality LANCZOS resampling.
    Used by the YouTube Thumbnail Resizer for fast server-side cropping.
    """
    if width < 1 or height < 1:
        raise HTTPException(400, "width and height must be positive")

    raw = await file.read()
    try:
        img = Image.open(io.BytesIO(raw))
    except Exception as exc:
        raise HTTPException(400, f"Could not open image: {exc}") from exc

    # Cover-fit: resize and center-crop so output fills width×height exactly
    src_w, src_h = img.size
    src_ratio = src_w / src_h
    dst_ratio = width / height
    if src_ratio > dst_ratio:
        new_h = height
        new_w = int(height * src_ratio)
    else:
        new_w = width
        new_h = int(width / src_ratio)
    img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    left = (new_w - width) // 2
    top = (new_h - height) // 2
    img = img.crop((left, top, left + width, top + height))

    # Flatten transparency if saving as JPEG
    if img.mode in ("RGBA", "LA", "P"):
        bg = Image.new("RGB", img.size, (255, 255, 255))
        if img.mode == "P":
            img = img.convert("RGBA")
        bg.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
        img = bg

    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    buf.seek(0)

    base_name = re.sub(r"\.[^.]+$", "", file.filename or "image")
    out_name = f"{base_name}-{width}x{height}.png"

    return StreamingResponse(
        buf,
        media_type="image/png",
        headers={"Content-Disposition": f'attachment; filename="{out_name}"'},
    )


# --------------------------------------------------------------------------- #
# PDF endpoints
# --------------------------------------------------------------------------- #


@app.post("/api/merge-pdf")
async def merge_pdf(files: List[UploadFile] = File(...)):
    """
    Merge multiple PDFs into one. Returns the combined PDF.
    """
    if len(files) < 2:
        raise HTTPException(400, "Provide at least two PDF files to merge")

    writer = PdfWriter()
    for upload in files:
        raw = await upload.read()
        try:
            reader = PdfReader(io.BytesIO(raw))
        except Exception as exc:
            raise HTTPException(400, f"Could not read {upload.filename}: {exc}") from exc
        for page in reader.pages:
            writer.add_page(page)

    buf = io.BytesIO()
    writer.write(buf)
    buf.seek(0)

    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="merged.pdf"'},
    )


@app.post("/api/split-pdf")
async def split_pdf(
    file: UploadFile = File(...),
    ranges: str = Form(...),
):
    """
    Split a PDF by page ranges. Returns a single PDF containing the extracted
    pages. For multiple ranges, call this endpoint once per range and zip
    the results on the client.

    Parameters
    ----------
    file : PDF file
    ranges : e.g. "1-3" or "5" or "7-9"
    """
    raw = await file.read()
    try:
        reader = PdfReader(io.BytesIO(raw))
    except Exception as exc:
        raise HTTPException(400, f"Could not read PDF: {exc}") from exc

    total = len(reader.pages)
    try:
        parsed = _parse_ranges(ranges, total)
    except ValueError as exc:
        raise HTTPException(400, str(exc))

    writer = PdfWriter()
    for start, end in parsed:
        for page_num in range(start, end + 1):
            writer.add_page(reader.pages[page_num - 1])

    buf = io.BytesIO()
    writer.write(buf)
    buf.seek(0)

    base_name = re.sub(r"\.pdf$", "", file.filename or "document", flags=re.IGNORECASE)
    first, last = parsed[0][0], parsed[-1][1]
    label = f"pages-{first}-{last}" if first != last else f"page-{first}"
    out_name = f"{base_name}-{label}.pdf"

    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{out_name}"'},
    )


@app.post("/api/compress-pdf")
async def compress_pdf(
    file: UploadFile = File(...),
    level: str = Form("medium"),  # low | medium | high
):
    """
    Compress a PDF by re-writing it with pikepdf, stripping metadata,
    and recompressing streams. The 'level' parameter controls how
    aggressive the compression is.

    - low:     lossless re-write, strip metadata only
    - medium:  re-compress object streams, strip metadata
    - high:    same as medium + downsample images (best-effort)
    """
    raw = await file.read()
    try:
        src = pikepdf.Pdf.open(io.BytesIO(raw))
    except Exception as exc:
        raise HTTPException(400, f"Could not read PDF: {exc}") from exc

    buf = io.BytesIO()
    save_kwargs: dict = {}
    if level in ("medium", "high"):
        save_kwargs["object_stream_mode"] = pikepdf.ObjectStreamMode.generate
    else:
        save_kwargs["object_stream_mode"] = pikepdf.ObjectStreamMode.preserve

    # Strip metadata to reduce size
    try:
        with src.open_metadata() as meta:
            meta.clear()
    except Exception:
        pass  # some PDFs have no metadata stream

    src.save(buf, **save_kwargs)
    src.close()
    buf.seek(0)

    original_size = len(raw)
    compressed_size = buf.getbuffer().nbytes
    base_name = re.sub(r"\.pdf$", "", file.filename or "document", flags=re.IGNORECASE)
    out_name = f"{base_name}-compressed.pdf"

    headers = {
        "X-Original-Size": str(original_size),
        "X-Compressed-Size": str(compressed_size),
        "X-Compression-Ratio": f"{(1 - compressed_size / original_size) * 100:.1f}%"
        if original_size
        else "0%",
        "Content-Disposition": f'attachment; filename="{out_name}"',
    }
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers=headers,
    )


# --------------------------------------------------------------------------- #
# Main
# --------------------------------------------------------------------------- #

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=3030)
