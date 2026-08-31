import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Cairo, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DeferredGoogleAnalytics } from "@/components/analytics/deferred-google-analytics";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { getLocaleConfig } from "@/lib/locale/config";
import { getActiveLocaleId } from "@/lib/locale/resolve";
import { getSiteUrl } from "@/lib/site-url";
import { googleSiteVerificationMetadata } from "@/lib/seo/google-site-verification";
import { OG_IMAGE, TWITTER_IMAGE } from "@/lib/seo/page-metadata";
import {
  SITE_DEFAULT_TITLE,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
} from "@/lib/seo/site-copy";
import { twitterSiteFields } from "@/lib/seo/social";

/** Arabic-first typeface (Latin fallback for brand name, URLs, code). */
const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  // next/font preloads this family (swap + metric fallback keep CLS low).
  // Keep 400–800 so existing font-* utilities do not change appearance.
  preload: true,
  adjustFontFallback: true,
  fallback: ["Tahoma", "Arial", "sans-serif"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  ...googleSiteVerificationMetadata(),
  title: {
    default: SITE_DEFAULT_TITLE,
    template: "%s · ConvAudit",
  },
  description: SITE_DESCRIPTION,
  keywords: [...SITE_KEYWORDS],
  authors: [{ name: "ConvAudit" }],
  creator: "ConvAudit",
  publisher: "ConvAudit",
  // Canonical / OG url are set per public page so private routes do not inherit "/".
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/icon", sizes: "32x32", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
    ],
    apple: [
      { url: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: SITE_DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
    // Canonical / OG url are set per public page so private routes do not inherit "/".
    siteName: "ConvAudit",
    type: "website",
    locale: getLocaleConfig(getActiveLocaleId()).ogLocale,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    ...twitterSiteFields(),
    title: SITE_DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
    images: [TWITTER_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "technology",
  applicationName: "ConvAudit",
  formatDetection: { telephone: false, email: false, address: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ConvAudit",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1d1f21" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = getLocaleConfig(getActiveLocaleId());

  return (
    <html
      lang={locale.htmlLang}
      dir={locale.dir}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className={`${cairo.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AuthProvider>
            {children}
            <SonnerToaster position="top-center" richColors closeButton />
            <Analytics />
            <SpeedInsights />
          </AuthProvider>
        </ThemeProvider>
        <DeferredGoogleAnalytics />
      </body>
    </html>
  );
}
