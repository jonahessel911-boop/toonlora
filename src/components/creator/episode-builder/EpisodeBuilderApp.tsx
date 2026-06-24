"use client";

import Link from "next/link";
import EpisodeCreateDraftPanel from "@/components/creator/episode-builder/EpisodeCreateDraftPanel";
import EpisodeInputCard from "@/components/creator/episode-builder/EpisodeInputCard";
import EpisodeProgressBanner from "@/components/creator/episode-builder/EpisodeProgressBanner";
import SceneProgressList from "@/components/creator/episode-builder/SceneProgressList";
import { useEpisodeBuilder } from "@/hooks/useEpisodeBuilder";

export default function EpisodeBuilderApp() {
  const {
    input,
    updateInput,
    plan,
    pipelinePhase,
    pipelineStep,
    pipelineRunning,
    error,
    progress,
    draftId,
    creatingDraft,
    generateEpisode,
    regenerateImage,
    createDraft,
    loadPreset,
    enhanceDescription,
    enhancing,
    createInDepth,
    creatingInDepth,
    endGeneration,
  } = useEpisodeBuilder();

  const showProgress = pipelineRunning || creatingInDepth || Boolean(plan);
  const canCreateDraft =
    Boolean(plan) &&
    !pipelineRunning &&
    progress.completed > 0;

  return (
    <div className="h-full overflow-y-auto bg-[#FCFAFF]">
      <header className="border-b border-[#E7D8FF] bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
          <Link
            href="/creator"
            className="text-xs font-semibold text-[#5340FF] hover:underline"
          >
            ← Back to Studio
          </Link>
          <h1 className="font-heading mt-1 text-2xl font-extrabold text-[#2A114B] sm:text-3xl">
            Episode Builder
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-6">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <EpisodeInputCard
          input={input}
          loading={pipelineRunning}
          enhancing={enhancing}
          creatingInDepth={creatingInDepth}
          onChange={updateInput}
          onGenerate={() => void generateEpisode()}
          onEnhance={() => void enhanceDescription()}
          onCreateInDepth={() => void createInDepth()}
          onLoadPreset={loadPreset}
        />

        {showProgress ? (
          <EpisodeProgressBanner
            phase={pipelinePhase}
            step={pipelineStep}
            storyTitle={plan?.storyTitle}
            completed={progress.completed}
            total={progress.total}
            failed={progress.failed}
            onEndGeneration={
              pipelinePhase === "generating_images"
                ? () => endGeneration()
                : undefined
            }
          />
        ) : null}

        {plan ? (
          <SceneProgressList
            scenes={plan.scenes}
            pipelineRunning={pipelineRunning}
            onRetry={(id) => void regenerateImage(id)}
          />
        ) : null}

        <EpisodeCreateDraftPanel
          draftId={draftId}
          canCreate={canCreateDraft}
          creating={creatingDraft}
          onCreateDraft={() => void createDraft()}
        />
      </main>
    </div>
  );
}
