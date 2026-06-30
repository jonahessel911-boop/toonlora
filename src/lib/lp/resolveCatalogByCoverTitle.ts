import {
  formatCoverTitleLabel,
  normalizeCoverTitleSlug,
} from "@/lib/lp3/coverTitleParam";
import { fuzzyMatchStorySlug } from "@/lib/lp/fuzzyStorySlug";
import { resolveStoryIdFromCoverTitle } from "@/lib/lp/storyTeasers";
import { COMPANY_NAME_BY_ID, FOUNDER_NAME_BY_ID } from "@/lib/mock/sagaMeta";
import type { CatalogSeries } from "@/types/catalog";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isStoryUuid(value: string): boolean {
  return UUID_RE.test(value);
}

function seriesHaystack(series: CatalogSeries): string {
  return [
    series.title,
    series.slug ?? "",
    series.mainCharacter ?? "",
    series.synopsis ?? "",
    series.creatorDisplayName ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

function seriesSlugBase(slug: string): string {
  return normalizeCoverTitleSlug(slug).replace(/-[a-f0-9]{8}$/i, "");
}

/** Map `cover_title` to a published catalog row (UUID id), not mock teaser slugs. */
export function findCatalogSeriesByCoverTitle(
  catalog: CatalogSeries[],
  coverTitle: string | null | undefined
): CatalogSeries | undefined {
  if (!coverTitle?.trim() || catalog.length === 0) return undefined;

  const param = coverTitle.trim();
  const paramSlug = normalizeCoverTitleSlug(param);

  if (isStoryUuid(paramSlug)) {
    return catalog.find((s) => s.id === paramSlug);
  }

  const canonicalId =
    resolveStoryIdFromCoverTitle(param) ??
    fuzzyMatchStorySlug(
      param,
      catalog.flatMap((s) => [s.slug, s.id].filter(Boolean) as string[])
    );
  const label = formatCoverTitleLabel(param).toLowerCase();

  for (const series of catalog) {
    const haystack = seriesHaystack(series);
    const dbSlug = series.slug ? normalizeCoverTitleSlug(series.slug) : "";
    const dbSlugBase = dbSlug ? seriesSlugBase(dbSlug) : "";

    if (
      dbSlug &&
      (dbSlug === paramSlug ||
        dbSlug.startsWith(`${paramSlug}-`) ||
        dbSlugBase === paramSlug)
    ) {
      return series;
    }

    if (dbSlug && canonicalId) {
      if (
        dbSlug === canonicalId ||
        dbSlug.startsWith(`${canonicalId}-`) ||
        dbSlugBase === canonicalId
      ) {
        return series;
      }
    }

    if (canonicalId) {
      const founder = FOUNDER_NAME_BY_ID[canonicalId]?.toLowerCase();
      const company = COMPANY_NAME_BY_ID[canonicalId]
        ?.split(" · ")[0]
        ?.trim()
        .toLowerCase();

      if (founder && haystack.includes(founder)) return series;
      if (company && company.length > 2 && haystack.includes(company)) {
        return series;
      }
    }

    if (label.length > 2 && haystack.includes(label)) return series;
  }

  return undefined;
}
