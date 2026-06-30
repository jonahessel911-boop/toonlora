import type { Metadata } from "next";
import { Suspense } from "react";
import LP5FunnelClient from "@/components/lp5/LP5FunnelClient";
import { isServerDatabaseConfigured } from "@/lib/config";
import { findPublishedCatalogByCoverTitle, listIndexCatalog } from "@/lib/services/catalog-repository";
import { PLATFORM_FULL_NAME } from "@/lib/seo/site";
import { catalogToCard, type CatalogSeries } from "@/types/catalog";

export const metadata: Metadata = {
  title: `Start reading | ${PLATFORM_FULL_NAME}`,
  description:
    "Read chapter 1 free — then unlock 3000+ verified business stories.",
  robots: { index: false, follow: false },
};

export default async function LandingPage5({
  searchParams,
}: {
  searchParams: Promise<{ cover_title?: string }>;
}) {
  const { cover_title: coverTitle } = await searchParams;
  let initialCatalog: CatalogSeries[] = [];

  if (isServerDatabaseConfigured()) {
    try {
      const series = await listIndexCatalog({ limit: 24 });
      initialCatalog = series.map((s) => catalogToCard(s));

      if (coverTitle?.trim()) {
        const pinned = await findPublishedCatalogByCoverTitle(coverTitle);
        if (pinned && !initialCatalog.some((s) => s.id === pinned.id)) {
          initialCatalog = [catalogToCard(pinned), ...initialCatalog];
        }
      }
    } catch {
      /* client hook falls back to mock catalog */
    }
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-[100dvh] items-center justify-center bg-[#F6F1E7]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E6DFD1] border-t-[#2F80ED]" />
        </div>
      }
    >
      <LP5FunnelClient initialCatalog={initialCatalog} />
    </Suspense>
  );
}
