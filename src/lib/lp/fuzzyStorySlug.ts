import { normalizeCoverTitleSlug } from "@/lib/lp3/coverTitleParam";

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]!;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j]!;
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, prev + cost);
      prev = tmp;
    }
  }
  return row[b.length]!;
}

function compactSlug(slug: string): string {
  return slug.replace(/-/g, "");
}

/** Common ad-link typos → canonical story slug. */
const COVER_TITLE_TYPO_ALIASES: Record<string, string> = {
  ferarri: "ferrari",
  ferrarri: "ferrari",
  ferari: "ferrari",
  enzoferrari: "ferrari",
  mcdonalds: "ray-kroc",
  mcdonald: "ray-kroc",
  raykroc: "ray-kroc",
  stevejobs: "steve-jobs",
  elonmusk: "elon-musk",
  toysrus: "toys-r-us",
  toysr: "toys-r-us",
  berniemadoff: "bernie-madoff",
  lehmanbrothers: "lehman-brothers",
  redbull: "red-bull",
  blackwednesday: "black-wednesday",
  tulipmania: "tulip-mania",
  shoedog: "shoe-dog",
};

function maxEditDistance(length: number): number {
  if (length <= 4) return 1;
  if (length <= 8) return 2;
  return 3;
}

/**
 * Fuzzy-match a `cover_title` slug to a known story id (e.g. ferarri → ferrari).
 */
export function fuzzyMatchStorySlug(
  raw: string,
  candidates: Iterable<string>
): string | undefined {
  const slug = normalizeCoverTitleSlug(raw);
  if (!slug) return undefined;

  const compact = compactSlug(slug);
  const typo = COVER_TITLE_TYPO_ALIASES[slug] ?? COVER_TITLE_TYPO_ALIASES[compact];
  if (typo) return typo;

  const unique = new Map<string, string>();
  for (const id of candidates) {
    const key = compactSlug(normalizeCoverTitleSlug(id));
    if (!unique.has(key)) unique.set(key, normalizeCoverTitleSlug(id));
  }

  let bestId: string | undefined;
  let bestDist = Infinity;

  for (const [candidateCompact, canonicalId] of unique) {
    const dist = levenshtein(compact, candidateCompact);
    const threshold = maxEditDistance(
      Math.max(compact.length, candidateCompact.length)
    );
    if (dist > threshold || dist >= bestDist) continue;
    if (dist < bestDist) {
      bestDist = dist;
      bestId = canonicalId;
    }
  }

  return bestDist > 0 ? bestId : undefined;
}
