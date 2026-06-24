"use client";

import Link from "next/link";
import { useState } from "react";
import { episodeDraftReaderPath } from "@/lib/episode-builder/draftStorage";
import { downloadEpisodeDraftPdfById } from "@/lib/episode-builder/exportDraftPdf";

interface EpisodeCreateDraftPanelProps {
  draftId: string | null;
  canCreate: boolean;
  creating: boolean;
  onCreateDraft: () => void;
}

export default function EpisodeCreateDraftPanel({
  draftId,
  canCreate,
  creating,
  onCreateDraft,
}: EpisodeCreateDraftPanelProps) {
  const [pdfLoading, setPdfLoading] = useState(false);

  if (!canCreate && !draftId) return null;

  const handleDownloadPdf = async () => {
    if (!draftId || pdfLoading) return;
    setPdfLoading(true);
    try {
      await downloadEpisodeDraftPdfById(draftId);
    } catch (err) {
      alert(err instanceof Error ? err.message : "PDF export failed");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <section className="rounded-[28px] border border-[#E7D8FF] bg-white p-5 shadow-[0_4px_20px_rgba(83,64,255,0.05)]">
      {draftId ? (
        <div className="space-y-3">
          <div>
            <p className="font-heading text-lg font-extrabold text-[#2A114B]">
              Draft ready
            </p>
            <p className="mt-1 text-sm text-[#667085]">
              Open the reader preview or download a PDF with art-only panels and
              story notes beside each scene.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={episodeDraftReaderPath(draftId)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-2xl bg-[#5340FF] px-6 py-3 text-sm font-extrabold text-white shadow-[0_4px_16px_rgba(83,64,255,0.35)] transition hover:bg-[#4330EF]"
            >
              Open draft reader →
            </Link>
            <button
              type="button"
              disabled={pdfLoading}
              onClick={() => void handleDownloadPdf()}
              className="inline-flex rounded-2xl border border-[#5340FF]/30 bg-white px-6 py-3 text-sm font-bold text-[#5340FF] transition hover:bg-[#F3ECFF] disabled:opacity-50"
            >
              {pdfLoading ? "Exporting PDF…" : "Download PDF"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-heading text-lg font-extrabold text-[#2A114B]">
              Review your episode
            </p>
            <p className="mt-1 text-sm text-[#667085]">
              Save a draft and read it like a vertical webtoon.
            </p>
          </div>
          <button
            type="button"
            disabled={!canCreate || creating}
            onClick={onCreateDraft}
            className="rounded-2xl bg-[#5340FF] px-6 py-3 text-sm font-extrabold text-white shadow-[0_4px_16px_rgba(83,64,255,0.35)] transition hover:bg-[#4330EF] disabled:opacity-50"
          >
            {creating ? "Creating draft…" : "Create draft"}
          </button>
        </div>
      )}
    </section>
  );
}
