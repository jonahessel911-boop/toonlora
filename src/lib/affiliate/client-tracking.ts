import { AFFILIATE_QUERY_PARAM } from "@/lib/affiliate/links";
import { isValidAffiliateSlug, normalizeAffiliateSlug } from "@/lib/affiliate/slug";
import { STORAGE_KEYS } from "@/lib/constants";

const AFFILIATE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

interface StoredAffiliateRef {
  slug: string;
  capturedAt: string;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function captureAffiliateFromUrl(searchParams: URLSearchParams): string | null {
  const raw = searchParams.get(AFFILIATE_QUERY_PARAM);
  if (!raw) return null;
  const slug = normalizeAffiliateSlug(raw);
  if (!isValidAffiliateSlug(slug)) return null;
  return slug;
}

export function persistAffiliateSlug(slug: string): void {
  if (!isBrowser() || !isValidAffiliateSlug(slug)) return;
  const payload: StoredAffiliateRef = {
    slug,
    capturedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEYS.affiliateSlug, JSON.stringify(payload));
}

export function getStoredAffiliateSlug(): string | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.affiliateSlug);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAffiliateRef;
    if (!parsed.slug || !isValidAffiliateSlug(parsed.slug)) return null;
    const age = Date.now() - new Date(parsed.capturedAt).getTime();
    if (age > AFFILIATE_TTL_MS) {
      localStorage.removeItem(STORAGE_KEYS.affiliateSlug);
      return null;
    }
    return parsed.slug;
  } catch {
    return null;
  }
}

export function clearStoredAffiliateSlug(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEYS.affiliateSlug);
}
