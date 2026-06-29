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

function setSessionAffiliateSlug(slug: string): void {
  if (!isBrowser() || !isValidAffiliateSlug(slug)) return;
  sessionStorage.setItem(STORAGE_KEYS.affiliateSessionSlug, slug);
}

function getSessionAffiliateSlug(): string | null {
  if (!isBrowser()) return null;
  const slug = sessionStorage.getItem(STORAGE_KEYS.affiliateSessionSlug);
  if (!slug || !isValidAffiliateSlug(slug)) return null;
  return slug;
}

function clearSessionAffiliateSlug(): void {
  if (!isBrowser()) return;
  sessionStorage.removeItem(STORAGE_KEYS.affiliateSessionSlug);
}

/** Long-lived attribution for signup/checkout — not for URL decoration. */
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
  clearSessionAffiliateSlug();
}

/** Slug for links/redirects — only when this visit came through ?aff=. */
export function getAffiliateSlugForLinks(): string | null {
  if (!isBrowser()) return null;
  const fromUrl = captureAffiliateFromUrl(new URLSearchParams(window.location.search));
  if (fromUrl) return fromUrl;
  return getSessionAffiliateSlug();
}

/** Append ?aff=slug to internal paths (preserves existing query + hash). */
export function appendAffiliateToHref(
  href: string,
  slug: string | null | undefined
): string {
  if (!slug || !isValidAffiliateSlug(slug)) return href;
  if (
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("javascript:")
  ) {
    return href;
  }

  if (href.startsWith("http://") || href.startsWith("https://")) {
    try {
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://toonlora.com";
      const url = new URL(href);
      if (url.origin !== origin) return href;
    } catch {
      return href;
    }
  }

  try {
    const base =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://toonlora.com";
    const url = new URL(href, base);
    if (url.searchParams.has(AFFILIATE_QUERY_PARAM)) return href;
    url.searchParams.set(AFFILIATE_QUERY_PARAM, slug);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return href;
  }
}

/** Capture ?aff= for attribution; clear session when absent. Never reads localStorage for URLs. */
export function syncAffiliateFromSearchParams(
  searchParams: URLSearchParams
): string | null {
  const fromUrl = captureAffiliateFromUrl(searchParams);
  if (fromUrl) {
    persistAffiliateSlug(fromUrl);
    setSessionAffiliateSlug(fromUrl);
    return fromUrl;
  }

  clearSessionAffiliateSlug();
  return null;
}
