"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CharacterCard from "@/components/creator/CharacterCard";
import { useCreatorStore } from "@/store/useCreatorStore";
import { useUserStore } from "@/store/useUserStore";
import {
  charactersToApiInput,
  runComicGeneration,
} from "@/lib/creator/generateStudioPanels";
import {
  formatCreditCost,
  panelGenerationCost,
  type PanelEpisodeLength,
} from "@/lib/creator/credits";
import type { ComicGenerationPayload, StudioVisibility } from "@/types/creator";

const GENRES = [
  "Romance",
  "Fantasy",
  "Anime",
  "Comedy",
  "Drama",
  "Adventure",
  "Slice of Life",
];

const PANEL_OPTIONS: { count: PanelEpisodeLength; label: string }[] = [
  { count: 4, label: "Short — 4 panels" },
  { count: 8, label: "Standard — 8 panels" },
  { count: 12, label: "Long — 12 panels" },
  { count: 16, label: "Premium — 16 panels" },
];

interface CreateComicModalProps {
  open: boolean;
  onClose: () => void;
  onOpenCharacterModal: () => void;
  activeJobId?: string | null;
}

export default function CreateComicModal({
  open,
  onClose,
  onOpenCharacterModal,
  activeJobId,
}: CreateComicModalProps) {
  const email = useUserStore((s) => s.email);
  const getMyCharacters = useCreatorStore((s) => s.getMyCharacters);
  const getCharacter = useCreatorStore((s) => s.getCharacter);
  const createStoryFromFlow = useCreatorStore((s) => s.createStoryFromFlow);
  const addGenerationJob = useCreatorStore((s) => s.addGenerationJob);
  const generationJobs = useCreatorStore((s) => s.generationJobs);

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("Fantasy");
  const [description, setDescription] = useState("");
  const [audienceRating, setAudienceRating] = useState("Teen");
  const [visibility, setVisibility] = useState<StudioVisibility>("private");
  const [selectedChars, setSelectedChars] = useState<string[]>([]);
  const [episodePrompt, setEpisodePrompt] = useState("");
  const [panelCount, setPanelCount] = useState<PanelEpisodeLength>(8);
  const [startedJobId, setStartedJobId] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const notifyEmail = email.trim() || "your email";

  const activeJob = useMemo(() => {
    const id = activeJobId ?? startedJobId;
    return id ? generationJobs.find((j) => j.id === id) : undefined;
  }, [activeJobId, startedJobId, generationJobs]);

  const generating = Boolean(
    activeJob && (activeJob.status === "running" || startedJobId)
  );

  const myCharacters = getMyCharacters();

  const toggleChar = (id: string) => {
    setSelectedChars((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    setGenerateError(null);

    try {
      const storyId = createStoryFromFlow({
        title,
        genre,
        description,
        audienceRating,
        visibility,
        characterIds: selectedChars,
        episodePrompt,
        panelCount,
      });

      const story = useCreatorStore.getState().getStory(storyId);
      const episode = story?.episodes[0];
      if (!episode) throw new Error("Story was not created");

      const payload: ComicGenerationPayload = {
        storyId,
        episodeId: episode.id,
        title,
        genre,
        description,
        episodePrompt,
        panelCount,
        characters: charactersToApiInput(selectedChars, getCharacter),
        characterIds: selectedChars,
        existingPanels: episode.panels.map((p) => ({
          id: p.id,
          order: p.order,
        })),
      };

      const jobId = `job-${Date.now()}`;
      addGenerationJob({
        id: jobId,
        storyId,
        episodeId: episode.id,
        title,
        status: "running",
        progress: 0,
        message: "Starting…",
        panelCount,
        completedPanels: 0,
        notifyEmail: email.trim(),
        createdAt: new Date().toISOString(),
        payload,
      });

      setStartedJobId(jobId);
      runComicGeneration(jobId);
    } catch (err) {
      setGenerateError(
        err instanceof Error ? err.message : "Could not start generation"
      );
    }
  };

  const handleCloseWhileGenerating = () => {
    reset();
    onClose();
  };

  const canNext = () => {
    if (step === 0) return title.trim().length > 0;
    if (step === 1) return selectedChars.length > 0;
    if (step === 2) return episodePrompt.trim().length > 10;
    return true;
  };

  const reset = () => {
    setStep(0);
    setTitle("");
    setDescription("");
    setSelectedChars([]);
    setEpisodePrompt("");
    setGenerateError(null);
    setStartedJobId(null);
  };

  const showGenerating = generating && activeJob;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#2A114B]/40 p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (showGenerating) return;
            reset();
            onClose();
          }}
        >
          <motion.div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[32px] border border-[#E7D8FF] bg-white shadow-2xl"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-[#E7D8FF] px-6 py-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#5340FF]">
                Step {step + 1} of 5
              </p>
              <h2 className="font-heading text-xl font-extrabold text-[#2A114B]">
                Create new comic
              </h2>
            </div>

            <div className="p-6">
              {showGenerating ? (
                <div className="flex flex-col items-center gap-4 py-10 text-center">
                  <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-4 border-[#E7D8FF]" />
                    <div
                      className="absolute inset-0 rounded-full border-4 border-[#5340FF] border-t-transparent animate-spin"
                      style={{
                        clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%)`,
                      }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center font-heading text-sm font-extrabold text-[#5340FF]">
                      {activeJob?.progress ?? 0}%
                    </span>
                  </div>

                  <div className="w-full max-w-sm">
                    <div className="h-3 overflow-hidden rounded-full bg-[#F3ECFF]">
                      <div
                        className="h-full rounded-full bg-[#5340FF] transition-all duration-500"
                        style={{ width: `${activeJob?.progress ?? 0}%` }}
                      />
                    </div>
                  </div>

                  <p className="font-heading text-lg font-extrabold text-[#2A114B]">
                    {activeJob?.message ?? "Creating your Lora…"}
                  </p>
                  <p className="max-w-md text-sm text-[#667085]">
                    You can close this window — creation continues in the
                    background. We&apos;ll e-mail{" "}
                    <span className="font-semibold text-[#2A114B]">
                      {notifyEmail}
                    </span>{" "}
                    when your Lora is ready.
                  </p>
                  {activeJob?.panelCount ? (
                    <p className="text-xs text-[#667085]">
                      Panel {activeJob.completedPanels} of{" "}
                      {activeJob.panelCount}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {!showGenerating && step === 0 ? (
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-[#2A114B]">
                    Story title
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[#E7D8FF] px-3 py-2.5 text-sm"
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-xs font-bold text-[#2A114B]">
                      Genre
                      <select
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[#E7D8FF] px-3 py-2.5 text-sm"
                      >
                        {GENRES.map((g) => (
                          <option key={g}>{g}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-xs font-bold text-[#2A114B]">
                      Audience rating
                      <select
                        value={audienceRating}
                        onChange={(e) => setAudienceRating(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[#E7D8FF] px-3 py-2.5 text-sm"
                      >
                        <option>All ages</option>
                        <option>Teen</option>
                        <option>Mature</option>
                      </select>
                    </label>
                  </div>
                  <label className="block text-xs font-bold text-[#2A114B]">
                    Description
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[#E7D8FF] px-3 py-2.5 text-sm"
                    />
                  </label>
                  <div>
                    <p className="text-xs font-bold text-[#2A114B]">Visibility</p>
                    <div className="mt-2 flex gap-2">
                      {(["private", "public"] as const).map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setVisibility(v)}
                          className={`rounded-xl px-4 py-2 text-xs font-bold capitalize ${
                            visibility === v
                              ? "bg-[#5340FF] text-white"
                              : "bg-[#F3ECFF] text-[#667085]"
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {!showGenerating && step === 1 ? (
                <div className="space-y-4">
                  <p className="text-sm text-[#667085]">
                    Choose characters before creating your story.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={onOpenCharacterModal}
                      className="rounded-xl bg-[#5340FF] px-4 py-2 text-xs font-bold text-white"
                    >
                      + Create character
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedChars([]);
                        setStep(2);
                      }}
                      className="text-sm font-semibold text-[#5340FF] underline-offset-2 hover:underline"
                    >
                      Continue without selecting characters
                    </button>
                  </div>
                  <div className="space-y-3">
                    {myCharacters.map((c) => (
                      <CharacterCard
                        key={c.id}
                        character={c}
                        selectable
                        selected={selectedChars.includes(c.id)}
                        onSelect={() => toggleChar(c.id)}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              {!showGenerating && step === 2 ? (
                <label className="block text-xs font-bold text-[#2A114B]">
                  What happens in this episode?
                  <textarea
                    rows={6}
                    value={episodePrompt}
                    onChange={(e) => setEpisodePrompt(e.target.value)}
                    placeholder="Describe the scene, emotions, and cliffhanger..."
                    className="mt-2 w-full rounded-xl border border-[#E7D8FF] px-3 py-2.5 text-sm"
                  />
                </label>
              ) : null}

              {!showGenerating && step === 3 ? (
                <div className="space-y-3">
                  {PANEL_OPTIONS.map((opt) => (
                    <button
                      key={opt.count}
                      type="button"
                      onClick={() => setPanelCount(opt.count)}
                      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left ${
                        panelCount === opt.count
                          ? "border-[#5340FF] bg-[#F3ECFF]"
                          : "border-[#E7D8FF]"
                      }`}
                    >
                      <span className="text-sm font-bold text-[#2A114B]">
                        {opt.label}
                      </span>
                      <span className="text-xs font-bold text-[#5340FF]">
                        {formatCreditCost(panelGenerationCost(opt.count))}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}

              {!showGenerating && step === 4 ? (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-[#F3ECFF] p-5 text-center">
                    <p className="font-heading text-lg font-extrabold text-[#2A114B]">
                      Ready to generate
                    </p>
                    <p className="mt-2 text-sm text-[#667085]">
                      {title} · {panelCount} panels ·{" "}
                      {formatCreditCost(panelGenerationCost(panelCount))}
                    </p>
                    <p className="mt-4 text-xs text-[#667085]">
                      Runs in the background — you can browse the studio or
                      switch apps. We&apos;ll e-mail {notifyEmail} when ready.
                    </p>
                  </div>
                  {generateError ? (
                    <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                      {generateError}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="flex gap-3 border-t border-[#E7D8FF] px-6 py-4">
              {showGenerating ? (
                <button
                  type="button"
                  onClick={handleCloseWhileGenerating}
                  className="ml-auto rounded-2xl bg-[#5340FF] px-6 py-2.5 text-sm font-bold text-white"
                >
                  Close — keep creating in background
                </button>
              ) : (
                <>
                  {step > 0 ? (
                    <button
                      type="button"
                      onClick={() => setStep((s) => s - 1)}
                      className="rounded-2xl border border-[#E7D8FF] px-5 py-2.5 text-sm font-bold text-[#667085]"
                    >
                      Back
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        reset();
                        onClose();
                      }}
                      className="rounded-2xl border border-[#E7D8FF] px-5 py-2.5 text-sm font-bold text-[#667085]"
                    >
                      Cancel
                    </button>
                  )}
                  {step < 4 ? (
                    <button
                      type="button"
                      disabled={!canNext()}
                      onClick={() => setStep((s) => s + 1)}
                      className="ml-auto rounded-2xl bg-[#5340FF] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleFinish}
                      className="ml-auto rounded-2xl bg-[#FF6847] px-5 py-2.5 text-sm font-bold text-white"
                    >
                      Start creating
                    </button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
