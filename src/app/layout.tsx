import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import AppShell from "@/components/AppShell";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import { GA_MEASUREMENT_ID } from "@/lib/analytics/ga-measurement-id";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Toonlora — Business History, Told Like a Cinematic Series",
  description:
    "Business stories you actually want to binge. Weekly illustrated chapters about founders, empires, failures, and comebacks.",
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full scroll-smooth`}
      style={
        {
          "--font-heading": "var(--font-inter), Inter, sans-serif",
          "--font-body": "var(--font-inter), Inter, sans-serif",
        } as React.CSSProperties
      }
    >
      {GA_MEASUREMENT_ID ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="beforeInteractive"
          />
          <Script id="google-analytics-init" strategy="beforeInteractive">
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
      <body className="min-h-[100dvh] bg-background font-sans antialiased">
        <GoogleAnalytics />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
