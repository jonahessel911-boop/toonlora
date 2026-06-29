import { BRAND_SUBHEADLINE } from "@/lib/brand";

export const PLATFORM_NAME = "Toonlora";
export const PLATFORM_TAGLINE = "Cinematic Business Stories";
export const PLATFORM_FULL_NAME = `${PLATFORM_NAME} | ${PLATFORM_TAGLINE}`;

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ||
    "https://toonlora.com"
  );
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (path.startsWith("http")) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageTitle(segment?: string): string {
  if (!segment?.trim()) return PLATFORM_FULL_NAME;
  return `${segment.trim()} | ${PLATFORM_NAME}`;
}

export const DEFAULT_SITE_DESCRIPTION = BRAND_SUBHEADLINE;

export const DEFAULT_KEYWORDS = [
  "business stories",
  "founder stories",
  "illustrated business history",
  "webtoon business",
  "entrepreneur stories",
  "company breakdown",
  "rise and fall",
  "cinematic business stories",
  "Toonlora",
];
