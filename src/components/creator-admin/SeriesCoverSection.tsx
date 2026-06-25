"use client";

import ApiUsageDisplay from "@/components/creator-admin/ApiUsageDisplay";
import type { CreatorAdminSeriesDetail } from "@/types/creator-admin";
import type { ApiUsageSummary } from "@/lib/api-usage-cost";

const CATEGORY_LABELS: Record<string, string> = {
  rise_and_fall: "Rise & Fall",
  founder_stories: "Founder Stories",
  business: "Business",
  empires: "Empires",
  heists: "Heists & Frauds",
};

interface SeriesCoverSectionProps {
  series: CreatorAdminSeriesDetail;
  busy: boolean;
  lastUsage: ApiUsageSummary | null;
  onGenerate: () => void;
}

export default function SeriesCoverSection({
  series,
  busy,
  lastUsage,
  onGenerate,
}: SeriesCoverSectionProps) {
  const categoryLabel =
    CATEGORY_LABELS[series.category ?? ""] ?? series.category ?? "Business";
  const headline = series.display_title ?? series.title;

  return (
    <div className="mb-6 rounded-xl border border-[#07111F]/10 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#667085]">
            Series cover
          </p>
          <h3 className="mt-1 text-base font-bold leading-snug text-[#07111F]">
            {headline}
          </h3>
          <p className="mt-1 text-xs text-[#667085]">{categoryLabel}</p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={onGenerate}
          className="shrink-0 rounded-lg bg-[#07111F] px-3 py-2 text-sm font-semibold text-[#F6F1E7] disabled:opacity-50"
        >
          {busy
            ? "Cover genereren…"
            : series.cover_art_url
              ? "Cover opnieuw maken"
              : "Cover aanmaken"}
        </button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="mx-auto w-full max-w-[220px] shrink-0 sm:mx-0">
          <div className="overflow-hidden rounded-xl border border-[#07111F]/10 bg-[#07111F]/5 shadow-sm">
            {series.cover_art_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={series.cover_art_url}
                alt={headline}
                className="aspect-[2/3] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[2/3] flex-col items-center justify-center gap-2 p-4 text-center text-sm text-[#667085]">
                <span className="text-2xl">📕</span>
                <p>Nog geen cover — genereer op basis van research & storyline</p>
              </div>
            )}
          </div>
          <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-wide text-[#667085] sm:text-left">
            Catalog cover
          </p>
        </div>

        <div className="min-w-0 flex-1 text-sm text-[#667085]">
          <p>
            De cover is een algemene series-poster: hoofdpersoon + iconisch symbool
            (bijv. Enzo Ferrari + F40), pakkende titel in beeld, Toonlora-stijl.
          </p>
          {series.cover_image_prompt ? (
            <details className="mt-3 rounded-lg border border-[#07111F]/10 p-3">
              <summary className="cursor-pointer text-xs font-bold text-[#07111F]">
                Cover prompt
              </summary>
              <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed">
                {series.cover_image_prompt}
              </p>
            </details>
          ) : null}
          {lastUsage ? (
            <div className="mt-3">
              <ApiUsageDisplay usage={lastUsage} compact />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
