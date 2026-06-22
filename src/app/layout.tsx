import type { Metadata } from "next";
import { Fredoka, Inter } from "next/font/google";
import Script from "next/script";
import AppShell from "@/components/AppShell";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import { GA_MEASUREMENT_ID } from "@/lib/analytics/ga-measurement-id";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Toonlora — Create & Share Cartoon Stories",
  description:
    "Read free cartoon stories from the community. Turn your idea into a shareable webtoon episode in minutes.",
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
      className={`${fredoka.variable} ${inter.variable} h-full scroll-smooth`}
      style={
        {
          "--font-heading": "var(--font-fredoka), Fredoka, sans-serif",
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
