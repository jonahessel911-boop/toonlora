/** Published series card for browse surfaces (homepage, LP, admin). */
export type SagaBadge =
  | "trending"
  | "new-drop"
  | "founder-saga"
  | "billion-dollar"
  | "company";

export interface CatalogSeries {
  id: string;
  title: string;
  genre: string;
  coverGradient: string;
  source: "admin" | "creator";
  status: "draft" | "published";
  creatorDisplayName: string;
  synopsis: string;
  episodeCount: number;
  viewsCount: number;
  likesCount: number;
  featuredRank: number | null;
  publishedAt: string | null;
  createdAt: string;
  rank?: number;
  isNew?: boolean;
  href?: string;
  coverArtUrl?: string;
  readers?: string;
  likes?: string;
  episodes?: number;
  creator?: string;
  /** Premium saga card fields */
  sagaSubtitle?: string;
  sagaLabel?: string;
  readMinutes?: number;
  sagaBadges?: SagaBadge[];
  chapterProgress?: number;
  panelIndex?: number;
  totalPanels?: number;
}

export function formatCatalogViews(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`;
  return String(count);
}

export function catalogToCard(
  row: CatalogSeries,
  extras?: Partial<CatalogSeries>
): CatalogSeries {
  return {
    ...row,
    readers: formatCatalogViews(row.viewsCount),
    likes: formatCatalogViews(row.likesCount),
    episodes: row.episodeCount,
    creator: row.creatorDisplayName,
    href: `/story/${row.id}`,
    ...extras,
  };
}
