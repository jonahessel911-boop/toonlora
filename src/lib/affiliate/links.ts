import { isValidAffiliateSlug, normalizeAffiliateSlug } from "@/lib/affiliate/slug";

export function getSiteOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ||
    "https://toonlora.com"
  );
}

export function buildAffiliateLink(slug: string, origin = getSiteOrigin()): string {
  const normalized = normalizeAffiliateSlug(slug);
  if (!isValidAffiliateSlug(normalized)) {
    return `${origin}/?aff=`;
  }
  return `${origin}/?aff=${encodeURIComponent(normalized)}`;
}

export const AFFILIATE_QUERY_PARAM = "aff";
