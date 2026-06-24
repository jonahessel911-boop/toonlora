const AFFILIATE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeAffiliateSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isValidAffiliateSlug(slug: string): boolean {
  return (
    slug.length >= 3 &&
    slug.length <= 64 &&
    AFFILIATE_SLUG_PATTERN.test(slug)
  );
}
