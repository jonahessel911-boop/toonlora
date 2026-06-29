import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import AppShell from "@/components/AppShell";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import { BRAND_SUBHEADLINE } from "@/lib/brand";
import { GA_MEASUREMENT_ID } from "@/lib/analytics/ga-measurement-id";
import {
  DEFAULT_KEYWORDS,
  DEFAULT_SITE_DESCRIPTION,
  getSiteUrl,
  PLATFORM_FULL_NAME,
  PLATFORM_NAME,
} from "@/lib/seo/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: PLATFORM_FULL_NAME,
    template: `%s | ${PLATFORM_NAME}`,
  },
  description: DEFAULT_SITE_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  applicationName: PLATFORM_NAME,
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: PLATFORM_FULL_NAME,
    title: PLATFORM_FULL_NAME,
    description: BRAND_SUBHEADLINE,
    images: [{ url: "/images/toonlora-logo.png", alt: PLATFORM_FULL_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: PLATFORM_FULL_NAME,
    description: BRAND_SUBHEADLINE,
    images: ["/images/toonlora-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} h-full scroll-smooth`}
      suppressHydrationWarning
      style={
        {
          "--font-heading": "var(--font-inter), Inter, sans-serif",
          "--font-body": "var(--font-inter), Inter, sans-serif",
        } as React.CSSProperties
      }
    >
      <body
        className="min-h-[100dvh] bg-background font-sans antialiased"
        suppressHydrationWarning
      >
        {GA_MEASUREMENT_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  send_page_view: true,
                });
              `}
            </Script>
          </>
        ) : null}
        <GoogleAnalytics />
        <NextIntlClientProvider messages={messages}>
          <AppShell>{children}</AppShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
