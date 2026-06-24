"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  getEpisodeBuilderDraft,
  type EpisodeBuilderDraftRecord,
} from "@/lib/episode-builder/draftStorage";
import { styleModeToLabel } from "@/lib/episode-builder/constants";
import { exportEpisodeDraftPdf } from "@/lib/episode-builder/exportDraftPdf";
import {
  getSceneChangeText,
  getSceneStoryText,
  getSceneSuggestedCopy,
} from "@/lib/episode-builder/sceneStoryText";
import { planAddsTextInImage } from "@/lib/episode-builder/imagePromptService";
import { isSceneComplete } from "@/types/episode-builder";

interface EpisodeDraftReaderProps {
  draftId: string;
}

function SceneStoryPanel({ scene }: { scene: EpisodeBuilderDraftRecord["plan"]["scenes"][number] }) {
  const story = getSceneStoryText(scene);
  const change = getSceneChangeText(scene);
  const suggestedCopy = getSceneSuggestedCopy(scene);

  return (
    <aside className="flex flex-col justify-center border-t border-white/10 bg-[#0E0618] p-4 sm:border-l sm:border-t-0 sm:p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#A78BFA]">
        Scene {scene.sceneNumber} · {scene.title}
      </p>
      <h2 className="font-heading mt-2 text-sm font-extrabold uppercase tracking-wide text-white/50">
        Story
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-white/90">{story}</p>
      {change ? (
        <p className="mt-3 text-xs leading-relaxed text-white/55">
          <span className="font-bold text-white/70">What changes: </span>
          {change}
        </p>
      ) : null}
      {scene.location ? (
        <p className="mt-2 text-xs text-white/40">{scene.location}</p>
      ) : null}
      {suggestedCopy.length > 0 ? (
        <div className="mt-4 border-t border-white/10 pt-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-white/40">
            Suggested copy (add manually)
          </p>
          <ul className="mt-2 space-y-1.5">
            {suggestedCopy.map((line, i) => (
              <li key={i} className="text-xs leading-relaxed text-white/60">
                {line}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}

export default function EpisodeDraftReader({ draftId }: EpisodeDraftReaderProps) {
  const [draft, setDraft] = useState<EpisodeBuilderDraftRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfStatus, setPdfStatus] = useState("");

  useEffect(() => {
    setDraft(getEpisodeBuilderDraft(draftId));
    setLoading(false);
  }, [draftId]);

  const handleDownloadPdf = useCallback(async () => {
    if (!draft || pdfLoading) return;
    setPdfLoading(true);
    setPdfStatus("");
    try {
      await exportEpisodeDraftPdf(draft.plan, setPdfStatus);
    } catch (err) {
      setPdfStatus(err instanceof Error ? err.message : "PDF export failed");
    } finally {
      setPdfLoading(false);
    }
  }, [draft, pdfLoading]);

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#08040F]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-[#5340FF]" />
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#08040F] px-4 text-center text-white">
        <h1 className="font-heading text-2xl font-extrabold">Draft not found</h1>
        <p className="mt-2 max-w-md text-sm text-white/60">
          This draft may have been cleared or opened on another device. Create a
          new episode in the builder.
        </p>
        <Link
          href="/creator/episode-builder"
          className="mt-6 rounded-2xl bg-[#5340FF] px-6 py-3 text-sm font-bold text-white"
        >
          Back to Episode Builder
        </Link>
      </div>
    );
  }

  const { plan } = draft;
  const readyCount = plan.scenes.filter((s) => isSceneComplete(s.status)).length;
  const textInImage = planAddsTextInImage(plan);

  return (
    <div className="min-h-[100dvh] bg-[#08040F] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#08040F]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <Link
            href="/creator/episode-builder"
            className="text-xs font-semibold text-[#A78BFA] hover:underline"
          >
            ← Episode Builder
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pdfLoading || readyCount === 0}
              onClick={() => void handleDownloadPdf()}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white transition hover:bg-white/20 disabled:opacity-40"
            >
              {pdfLoading ? "Exporting…" : "Download PDF"}
            </button>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/70">
              Draft preview
            </span>
          </div>
        </div>
        {pdfStatus ? (
          <p className="mx-auto max-w-4xl px-4 pb-2 text-center text-[10px] text-white/50">
            {pdfStatus}
          </p>
        ) : null}
      </header>

      <article className="mx-auto w-full max-w-4xl px-4 pb-20 pt-6">
        <div className="mb-8 max-w-2xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#A78BFA]">
            {plan.genre} · {styleModeToLabel(plan.styleMode)}
          </p>
          <h1 className="font-heading mt-2 text-3xl font-extrabold leading-tight">
            {plan.storyTitle}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-white/75">
            {plan.logline}
          </p>
          <p className="mt-2 text-sm text-white/45">
            {plan.tone} · {readyCount}/{plan.scenes.length} images ·{" "}
            {textInImage
              ? "narration rendered inside panels"
              : "art-only panels — story notes beside each scene"}
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {plan.scenes.map((scene) => (
            <figure
              key={scene.id}
              className="overflow-hidden rounded-xl border border-white/10 bg-[#12081F]"
            >
              <div className="grid sm:grid-cols-[minmax(0,1fr)_minmax(220px,32%)]">
                <div className="min-w-0">
                  {scene.imageUrl ? (
                    <img
                      src={scene.imageUrl}
                      alt=""
                      className="block w-full"
                    />
                  ) : (
                    <div className="flex aspect-[5/8] flex-col items-center justify-center px-6 text-center">
                      <p className="font-heading text-lg font-extrabold text-white/30">
                        Image {scene.sceneNumber}
                      </p>
                      <p className="mt-1 text-sm text-white/40">{scene.title}</p>
                      <p className="mt-2 text-xs text-white/30">Not generated yet</p>
                    </div>
                  )}
                </div>
                <SceneStoryPanel scene={scene} />
              </div>
            </figure>
          ))}
        </div>
      </article>
    </div>
  );
}
