import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
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
 * - title.template: "%s | Convaduit" — per-page titles get the brand appended
 * - title.default: shown on the home page and when no title is set
 * - metadataBase: resolves all relative metadata URLs against convaduit.com
 * - verification: Google Search Console + AdSense placeholder tokens
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: "Convaduit — Free Online Tools for Creators",
    template: "%s | Convaduit",
  },
  description: SITE_CONFIG.description,
  keywords: [
    "online tools",
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
    "youtube thumbnail downloader",
    "youtube title generator",
    "youtube money calculator",
    "youtube tags extractor",
    "convaduit",
    "browser based tools",
    "no upload tools",
  ],
  authors: [{ name: SITE_CONFIG.name }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": `${SITE_CONFIG.url}/feed.xml` },
    languages: {
      en: SITE_CONFIG.url,
      ar: SITE_CONFIG.url,
    },
  },
  openGraph: {
    title: "Convaduit — Free Online Tools for Creators",
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    type: "website",
    locale: "en_US",
    alternateLocale: ["ar_AR"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Convaduit — Free Online Tools for Creators",
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
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
