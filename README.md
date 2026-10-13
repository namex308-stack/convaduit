<p align="center">
  <img src="public/logo.svg" alt="Convaduit" width="48" height="48" />
  <h1 align="center">Convaduit</h1>
  <p align="center">
    <strong>Free, private, browser-based tools for creators.</strong>
  </p>
  <p align="center">
    Compress images · Convert HEIC · Merge & split PDFs · YouTube creator tools
    <br />
    <em>No uploads. No sign-up. No watermarks.</em>
  </p>
  <p align="center">
    <a href="https://convaduit.com">Website</a> ·
    <a href="#features">Features</a> ·
    <a href="#getting-started">Get Started</a> ·
    <a href="#contributing">Contributing</a>
  </p>
</p>

---

## What is Convaduit?

Convaduit is a collection of **20+ free online tools** designed for creators, developers, and everyday users who value privacy. Every tool runs **100% in your browser** — files are never uploaded to a server. Built with modern web technologies and powered by proven open-source libraries.

## Features

### 🖼️ Image Tools
- **Compress Image** — Reduce JPG, PNG, and WebP file sizes with adjustable quality
- **HEIC to JPG** — Convert iPhone photos to universally compatible JPG
- **WebP to PNG** — Convert WebP to PNG with full transparency support
- **PNG to JPG** — Convert PNG to JPG with customizable background color
- **JPG to WebP** — Convert to modern WebP for 25-35% smaller file sizes

### 📄 PDF Tools
- **Merge PDF** — Combine multiple PDFs with drag-to-reorder
- **Split PDF** — Extract pages by range (e.g., `1-3, 5, 7-9`)
- **Compress PDF** — Shrink PDF size by rasterizing at configurable DPI
- **PDF to Word** — Extract text into an editable `.doc` file
- **Image to PDF** — Turn images into a single PDF with page size options

### 🎬 YouTube Creator Tools
- **Thumbnail Downloader** — Grab HD thumbnails in all available resolutions
- **Thumbnail Resizer** — Crop to 1280×720 with safe-zone overlay
- **Thumbnail Tester** — Preview thumbnails at real-world display sizes
- **Tags Extractor** — Reveal hidden keywords from any video
- **Title Generator** — SEO-optimized titles with character counter
- **Description Generator** — Structured descriptions with timestamps & hashtags
- **Hashtag Generator** — Niche-specific hashtag suggestions
- **Money Calculator** — Estimate earnings across 16 content niches
- **Channel ID Finder** — Extract UC... channel IDs for APIs
- **Timestamp Link Generator** — Create shareable links to specific moments

### 🔒 Privacy First
- All processing happens locally via **WebAssembly** and the **Canvas API**
- Zero server-side file handling — there's nothing to hack, nothing to leak
- No account required, no tracking cookies for tool usage

## Tech Stack

| Layer           | Technology                                                |
| --------------- | --------------------------------------------------------- |
| **Framework**   | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **UI**          | [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) (Radix) |
| **PDF**         | [pdf-lib](https://pdf-lib.js.org/), [pdfjs-dist](https://mozilla.github.io/pdf.js/) |
| **Images**      | [browser-image-compression](https://github.com/nicedayfor/browser-image-compression), [heic2any](https://github.com/nicedayfor/heic2any), [sharp](https://sharp.pixelplumbing.com/) |
| **Animations**  | [Framer Motion](https://www.framer.com/motion/)           |
| **State**       | [Zustand](https://zustand-demo.pmnd.rs/), [TanStack Query](https://tanstack.com/query) |
| **Database**    | SQLite via [Prisma](https://www.prisma.io/)               |
| **Auth**        | [NextAuth.js](https://next-auth.js.org/)                  |
| **Analytics**   | Google Analytics 4, Google AdSense                        |

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.x (recommended: 20+)
- **npm** ≥ 9.x (ships with Node)

### Installation

```bash
# Clone the repository
git clone https://github.com/namex308-stack/convaduit.git
cd convaduit

# Install dependencies
npm install

# Generate the Prisma client
npx prisma generate

# Push the database schema (creates SQLite dev.db)
npx prisma db push

# Start the development server
npm run dev
```

The app will be available at **[http://localhost:3000](http://localhost:3000)**.

### Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Available Scripts

| Script           | Description                                    |
| ---------------- | ---------------------------------------------- |
| `npm run dev`    | Start dev server with Turbopack on port 3000   |
| `npm run build`  | Production build with standalone output        |
| `npm run start`  | Start the production server                    |
| `npm run lint`   | Run ESLint                                     |
| `npm run db:push`| Push Prisma schema to database                 |
| `npm run db:generate` | Regenerate Prisma client                  |
| `npm run db:migrate`  | Run Prisma migrations (dev)               |

## Project Structure

```
convaduit/
├── prisma/                 # Prisma schema & migrations
│   └── schema.prisma
├── public/                 # Static assets (logo, favicons)
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── about/          # About page
│   │   ├── api/            # API routes
│   │   ├── blog/           # Blog pages (MDX)
│   │   ├── privacy/        # Privacy policy
│   │   ├── terms/          # Terms of service
│   │   ├── tools/[slug]/   # Dynamic tool pages
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Homepage
│   ├── components/
│   │   ├── ads/            # AdSense components
│   │   ├── layout/         # Header, Footer, ThemeProvider
│   │   ├── tools/          # Tool-specific components
│   │   └── ui/             # shadcn/ui primitives
│   ├── hooks/              # Custom React hooks
│   └── lib/                # Utilities, tool definitions, helpers
├── content/                # Blog MDX content
├── mini-services/          # Companion micro-services
├── .env                    # Environment variables (gitignored)
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json
```

## Deployment

### Standalone Build (Docker / VPS)

```bash
npm run build
# Output in .next/standalone/ — run with:
NODE_ENV=production node .next/standalone/server.js
```

### Caddy (Reverse Proxy)

A `Caddyfile` is included for HTTPS reverse proxy:

```bash
caddy run
```

## SEO

Convaduit includes comprehensive SEO out of the box:
- **JSON-LD** structured data (Organization, WebSite, HowTo, FAQPage per tool)
- **OpenGraph** and **Twitter Card** meta tags on every page
- **Dynamic sitemap** at `/sitemap.xml`
- **RSS feed** at `/rss.xml`
- **Robots.txt** with crawl directives
- **Dynamic OG images** generated at build time

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-tool`)
3. **Commit** your changes (`git commit -m 'Add amazing new tool'`)
4. **Push** to the branch (`git push origin feature/amazing-tool`)
5. **Open** a Pull Request

Please make sure your code passes linting (`npm run lint`) before submitting.

## License

This project is proprietary. All rights reserved. See the [Terms of Service](https://convaduit.com/terms) for usage details.

---

<p align="center">
  Built with ❤️ by the <a href="https://convaduit.com">Convaduit</a> team
</p>
