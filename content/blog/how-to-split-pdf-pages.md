---
title: "How to Split a PDF and Extract Specific Pages"
description: "Learn how to extract PDF pages or divide a document into separate files using page ranges, and what to check before sharing the results."
date: "2026-02-28"
modifiedDate: "2026-10-16"
author: "Convaudit Team"
tags: ["split PDF", "extract PDF pages", "documents"]
toolSlug: "split-pdf"
coverImage: ""
---

To split a PDF, enter the page numbers or ranges you want in a PDF splitter. Each comma-separated entry becomes a separate file. For example, `1-3, 5, 8-10` creates three PDFs: pages 1–3, page 5, and pages 8–10.

## Choose the pages you need

PDF page numbers start at 1. Use a single number for one page, or a hyphen for an inclusive range:

| Input | Files created |
| --- | --- |
| `4` | One PDF containing page 4 |
| `2-6` | One PDF containing pages 2 through 6 |
| `1-3, 7, 10-12` | Three PDFs: pages 1–3, page 7, and pages 10–12 |

Check the page count in your PDF viewer first. A range must not include page 0 or a number beyond the final page. Each comma-separated range is exported as its own file; this tool does not combine non-adjacent pages into one output PDF.

## Split a PDF in your browser

1. Open the [Split PDF tool](/tools/split-pdf).
2. Select a PDF from your device.
3. Enter the page ranges, separated by commas—for example, `1-3, 7`.
4. Start the split and download the resulting files.

Convaudit copies the selected pages into new PDFs in your browser. The selected files are not sent to Convaudit for processing. Very large or complex PDFs may take longer or exceed the memory available to your browser.

## Review the output before sending it

Splitting changes the document, so check each output file before sharing it:

- Confirm that every file contains the intended pages and that the page order is correct.
- Open links, form fields, bookmarks, signatures, or other interactive features if the source relies on them; these may not work the same way in a newly assembled PDF.
- A digital signature on the source does not make the newly created file signed or validate the new file.
- If the document contains confidential details on a page, removing other pages is not the same as redacting the remaining content.

Need to put the extracted pages back together? Use the [Merge PDF tool](/tools/merge-pdf). If the file is too large to send, see the guide to [reducing PDF file size](/blog/reduce-pdf-file-size).
