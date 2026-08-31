import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Cairo, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DeferredGoogleAnalytics } from "@/components/analytics/deferred-google-analytics";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { LocaleProvider } from "@/lib/locale/provider";
import { LOCALE_COOKIE, parseEnabledLocale } from "@/lib/locale/cookie";
import { getLocaleConfig } from "@/lib/locale/config";
import { getServerLocaleId } from "@/lib/locale/server";
import { getSiteUrl } from "@/lib/site-url";
import { googleSiteVerificationMetadata } from "@/lib/seo/google-site-verification";
import { impactSiteVerificationMetadata } from "@/lib/seo/impact-site-verification";
import { OG_IMAGE, TWITTER_IMAGE } from "@/lib/seo/page-metadata";
import {
  getSiteDefaultTitle,
  getSiteDescription,
  SITE_KEYWORDS,
} from "@/lib/seo/site-copy";
import { twitterSiteFields } from "@/lib/seo/social";

/** Arabic-first typeface (Latin fallback for brand name, URLs, code). */
const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
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

export async function generateMetadata(): Promise<Metadata> {
  const localeId = await getServerLocaleId();
  const locale = getLocaleConfig(localeId);
  const title = getSiteDefaultTitle(localeId);
  const description = getSiteDescription(localeId);

  return {
    metadataBase: new URL(getSiteUrl()),
    ...googleSiteVerificationMetadata(),
    ...impactSiteVerificationMetadata(),
    title: {
      default: title,
      template: "%s · ConvAudit",
    },
    description,
    keywords: [...SITE_KEYWORDS],
    authors: [{ name: "ConvAudit" }],
    creator: "ConvAudit",
    publisher: "ConvAudit",
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
        { url: "/icon", sizes: "32x32", type: "image/png" },
        { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      ],
      apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
      shortcut: "/favicon.ico",
    },
    openGraph: {
      title,
      description,
      siteName: "ConvAudit",
      type: "website",
      locale: locale.ogLocale,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      ...twitterSiteFields(),
      title,
      description,
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
}

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieLocale = parseEnabledLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const localeId = await getServerLocaleId();
  const initialLocale = cookieLocale ?? localeId;
  const locale = getLocaleConfig(initialLocale);

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
          <LocaleProvider initialLocale={initialLocale}>
            <AuthProvider>
              {children}
              <SonnerToaster position="top-center" richColors closeButton />
              <Analytics />
              <SpeedInsights />
            </AuthProvider>
          </LocaleProvider>
        </ThemeProvider>
        <DeferredGoogleAnalytics />
      </body>
    </html>
  );
}
