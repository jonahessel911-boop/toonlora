import { CATEGORIES } from "@/lib/constants";

export const EMAIL_BRAND = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://toonlora.com",
  fromName: "Toonlora",
  fromEmail: process.env.POSTMARK_FROM_EMAIL?.trim() || "platform@toonlora.com",
  purple: "#5340FF",
  purpleDark: "#2A114B",
  coral: "#FF6847",
  pink: "#FF4FA3",
  lavender: "#F3ECFF",
  border: "#E7D8FF",
  muted: "#667085",
} as const;

export function logoUrl(): string {
  return `${EMAIL_BRAND.siteUrl}/images/toonlora-logo.png`;
}

export const FEATURED_STORIES = [
  {
    title: "Moonlit Hearts",
    genre: "Romance",
    views: "24.8k reads",
    colorStart: "#FF4FA3",
    colorEnd: "#FF8CC8",
    href: "/",
  },
  {
    title: "Starfall Academy",
    genre: "Fantasy",
    views: "18.2k reads",
    colorStart: "#5340FF",
    colorEnd: "#8B7CFF",
    href: "/",
  },
  {
    title: "Skybound Quest",
    genre: "Adventure",
    views: "12.4k reads",
    colorStart: "#22D3EE",
    colorEnd: "#60A5FA",
    href: "/",
  },
  {
    title: "Neon After School",
    genre: "Anime",
    views: "9.6k reads",
    colorStart: "#8B5CF6",
    colorEnd: "#C4B5FD",
    href: "/",
  },
] as const;

export const TOP_CATEGORIES = CATEGORIES.slice(0, 8);
