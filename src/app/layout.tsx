import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { AdPreferencesProvider } from "@/components/ads/AdPreferences";
import { AdBlockDetector } from "@/components/ads/AdBlockDetector";
import { SITE_CONFIG } from "@/lib/tools";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Global metadata — applies to every page unless overridden.
 *
 * - title.template: "%s | Convaudit" — per-page titles get the brand appended
 * - title.default: shown on the home page and when no title is set
 * - metadataBase: resolves all relative metadata URLs against convaudit.com
 * - verification: Google Search Console + AdSense placeholder tokens
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.title,
    template: "%s | Convaudit",
  },
  description: SITE_CONFIG.description,
  keywords: [
    "online file converter",
    "free online tools",
    "image compressor online",
    "heic to jpg converter",
    "merge pdf online free",
    "split pdf online",
    "pdf to word converter",
    "image to pdf converter",
    "compress pdf online",
    "webp to png converter",
    "png to jpg converter",
    "jpg to webp converter",
    "remove exif online",
    "pdf to image converter",
    "client side file converter",
    "private file converter",
    "browser based tools",
    "no upload file tools",
    "youtube thumbnail downloader",
    "youtube tags extractor",
    "convaudit",
  ],
  authors: [{ name: SITE_CONFIG.name }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": `${SITE_CONFIG.url}/rss.xml`,
      "text/plain": `${SITE_CONFIG.url}/llms.txt`,
    },
    languages: {
      en: SITE_CONFIG.url,
      ar: SITE_CONFIG.url,
    },
  },
  other: {
    "llms.txt": `${SITE_CONFIG.url}/llms.txt`,
  },
  openGraph: {
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    type: "website",
    locale: "en_US",
    alternateLocale: ["ar_AR"],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Google Search Console verification — replace with your verification token.
  // Get it from https://search.google.com/search-console → Settings → Verification.
  verification: {
    google: "GOOGLE_SEARCH_CONSOLE_VERIFICATION_TOKEN",
    // Google AdSense site verification — replace with your publisher ID.
    other: { "google-adsense-account": SITE_CONFIG.adsenseClient },
  },
  category: "utilities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        {/* AdSense script — loaded after the page is interactive.
            Replace ca-pub-XXXXXXXXXXXXXXXX with your real publisher ID. */}
        <Script
          id="adsbygoogle-init"
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE_CONFIG.adsenseClient}`}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {/* Google Analytics 4 — measurement ID G-MDR2NP5CJ3.
            Loaded with afterInteractive strategy so it doesn't block
            first paint. */}
        <Script
          id="ga-src"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-MDR2NP5CJ3"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-MDR2NP5CJ3', {
              anonymize_ip: true,
              cookie_flags: 'SameSite=None;Secure',
            });
          `}
        </Script>
        <ThemeProvider>
          <AdPreferencesProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
            <AdBlockDetector />
          </AdPreferencesProvider>

          {/* Sitewide JSON-LD: Organization + WebSite with SearchAction.
              These appear in the root layout so they're present on every page. */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: SITE_CONFIG.name,
                url: SITE_CONFIG.url,
                logo: `${SITE_CONFIG.url}/logo.svg`,
                description: SITE_CONFIG.description,
                // Replace with your real social profiles when available.
                sameAs: [
                  "https://twitter.com/convaudit",
                  "https://github.com/convaudit",
                  "https://www.youtube.com/@convaudit",
                ],
              }),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: SITE_CONFIG.name,
                url: SITE_CONFIG.url,
                description: SITE_CONFIG.description,
                publisher: {
                  "@type": "Organization",
                  name: SITE_CONFIG.name,
                  url: SITE_CONFIG.url,
                },
                // Sitelinks search box — tells Google we support search.
                // The /search?q={query} path is reserved for a future search page.
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`,
                  },
                  "query-input": "required name=search_term_string",
                },
              }),
            }}
          />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
