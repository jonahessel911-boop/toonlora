import type { Metadata } from "next";
import LP3FunnelClient from "@/components/lp3/LP3FunnelClient";
import { isServerDatabaseConfigured } from "@/lib/config";
import { listIndexCatalog } from "@/lib/services/catalog-repository";
import { PLATFORM_FULL_NAME } from "@/lib/seo/site";
import { catalogToCard, type CatalogSeries } from "@/types/catalog";

export const metadata: Metadata = {
  title: `Business Stories | ${PLATFORM_FULL_NAME}`,
  description:
    "Answer a few questions to uncover the most in-depth business stories in the world.",
  robots: { index: false, follow: false },
};

export default async function LandingPage4() {
  let initialCatalog: CatalogSeries[] = [];

  if (isServerDatabaseConfigured()) {
    try {
      const series = await listIndexCatalog({ limit: 24 });
      initialCatalog = series.map((s) => catalogToCard(s));
    } catch {
      /* client hook falls back to mock catalog */
    }
  }

  return <LP3FunnelClient initialCatalog={initialCatalog} variant="lp4" />;
}
