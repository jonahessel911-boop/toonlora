import type { Metadata } from "next";
import { Fredoka, Inter } from "next/font/google";
import AppShell from "@/components/AppShell";
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
      <body className="min-h-full bg-background font-sans antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
