<p align="center">
  <img src="public/logo.svg" alt="Convaudit" width="48" height="48" />
</p>

<h1 align="center">Convaudit</h1>

<p align="center">
  Free online tools for images, PDFs, and YouTube workflows.
  <br />
  Browser-based file processing is available for supported tools and modes.
</p>

<p align="center">
  <a href="https://convaudit.com">Website</a> ·
  <a href="https://convaudit.com/#tools">Tools</a> ·
  <a href="https://convaudit.com/blog">Guides</a>
</p>

---

## About

Convaudit is a web application with image converters, PDF utilities, creator tools, and practical guides. The site is built with Next.js and is designed to make common file and creator workflows straightforward.

Processing behavior depends on the tool and its selected mode. Many image and PDF operations run locally in the browser. The image compressor also offers a Python mode that uploads the selected image to the configured backend. Some creator features contact third-party services. Check the relevant tool and the [privacy policy](https://convaudit.com/privacy) before using sensitive data.

## Tools

- **Images:** Compress images, remove image metadata, convert HEIC to JPG, and convert between JPG, PNG, and WebP.
- **PDFs:** Merge and split documents, compress PDFs, convert PDFs to images or Word documents, and create PDFs from images.
- **YouTube:** Download available thumbnails, resize and preview artwork, inspect video tags, and use channel, title, description, hashtag, money, and timestamp utilities.
- **Guides:** Read practical articles about image formats and compression, photo metadata, PDF workflows, and thumbnail requirements.

Browse the complete collection on the [Convaudit homepage](https://convaudit.com/#tools).

## Technology

- Next.js App Router, React, and TypeScript
- Tailwind CSS and Radix UI
- `pdf-lib` and Mozilla PDF.js for PDF workflows
- Canvas and browser image-processing libraries for image workflows
- Prisma with SQLite for database-backed features

## Development

### Requirements

- Node.js 20.9 or newer
- npm

### Set up

```bash
git clone https://github.com/namex308-stack/convaduit.git
cd convaduit
npm install
```

Create a local `.env` from `.env.example` and set values appropriate for your environment. Do not commit secrets. For local database-backed features, configure `DATABASE_URL` to a SQLite database file, then run:

```bash
npx prisma generate
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the development server.

### Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Check TypeScript types |
| `npm run build` | Create the production standalone build |
| `npm run start` | Start the standalone production server |
| `npx prisma generate` | Generate the Prisma client |
| `npx prisma db push` | Apply the Prisma schema to the configured database |

## Repository layout

```text
content/blog/       Markdown articles
prisma/             Prisma schema and migrations
public/             Static assets
src/app/            App Router pages and route handlers
src/components/     Shared UI and tool components
src/lib/             Tool definitions and application helpers
tests/              Runtime build integration scripts
mini-services/      Supporting services
```

## Contributing

Bug reports and focused improvements are welcome. Before opening a pull request, run `npm run lint`, `npx tsc --noEmit`, and `npm run build`. Include relevant test coverage when changing application behavior.

## License

This repository does not grant an open-source license. See the [Terms of Service](https://convaudit.com/terms) for the terms that apply to use of the hosted service.
