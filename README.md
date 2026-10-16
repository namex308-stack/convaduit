<p align="center">
  <img src="public/logo.svg" alt="Convaudit logo" width="64" height="64" />
</p>

<h1 align="center">Convaudit</h1>

<p align="center">
  Private-by-default tools for image, PDF, and creator workflows.
  <br />
  Convert, organize, and prepare files with a growing collection of browser-based tools.
</p>

<p align="center">
  <a href="https://convaudit.com">Visit Convaudit</a> ·
  <a href="https://convaudit.com/#tools">Explore tools</a> ·
  <a href="https://convaudit.com/blog">Read the guides</a> ·
  <a href="https://convaudit.com/privacy">Privacy</a>
</p>

---

## Overview

Convaudit brings practical image converters, PDF utilities, YouTube creator tools, and step-by-step guides together in one web application. The interface is designed to make everyday file workflows clear and accessible without requiring an account.

### What you can do

| Image tools | PDF tools | Creator tools |
| --- | --- | --- |
| Compress images and remove metadata | Merge, split, and compress PDFs | Download and resize YouTube thumbnails |
| Convert HEIC, JPG, PNG, and WebP | Convert PDFs to images or Word documents | Inspect tags and generate titles, descriptions, and hashtags |
| Create PDFs from images | Work with PDF pages in your browser | Calculate channel metrics and create timestamp links |

Browse the full collection on the [Convaudit homepage](https://convaudit.com/#tools).

## Privacy and processing

Processing depends on the tool and the selected mode. Many image and PDF operations run locally in your browser. The image compressor also offers a Python mode that sends the selected image to the configured backend, and some creator features contact third-party services. Review the details for each tool and the [privacy policy](https://convaudit.com/privacy) before using sensitive data.

## Technology

- **Application:** Next.js App Router, React, and TypeScript
- **Interface:** Tailwind CSS, Radix UI, and Lucide icons
- **PDF workflows:** `pdf-lib` and Mozilla PDF.js
- **Image workflows:** Canvas APIs and browser image-processing libraries
- **Database-backed features:** Prisma with SQLite

## Run locally

### Requirements

- Node.js 20.9 or newer
- npm

### Setup

```bash
git clone https://github.com/namex308-stack/convaduit.git
cd convaduit
npm ci
```

Create a local `.env` file from `.env.example` and configure the values for your environment. Do not commit secrets. For database-backed features, set `DATABASE_URL` to a SQLite database file, then generate the Prisma client and apply the schema:

```bash
npx prisma generate
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Project commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Check TypeScript types |
| `npm run build` | Build the production application |
| `npm run start` | Start the standalone production server |
| `npx prisma generate` | Generate the Prisma client |
| `npx prisma db push` | Apply the Prisma schema to the configured database |

## Project structure

```text
content/blog/       Blog articles
mini-services/      Supporting services
prisma/             Prisma schema and migrations
public/             Static assets
src/app/            App Router pages and API routes
src/components/     Shared interface and tool components
src/lib/             Application helpers and tool definitions
tests/              Runtime build integration scripts
```

## Contributing

Focused bug reports and improvements are welcome. Before opening a pull request, run `npm run lint`, `npx tsc --noEmit`, and `npm run build`. Include relevant test coverage when changing application behavior, and never include credentials or other secrets.

## License

This repository does not grant an open-source license. The hosted service is subject to the [Convaudit Terms of Service](https://convaudit.com/terms).
