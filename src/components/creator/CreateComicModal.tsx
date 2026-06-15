"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CharacterCard from "@/components/creator/CharacterCard";
import { useCreatorStore } from "@/store/useCreatorStore";
import {
  formatCreditCost,
  panelGenerationCost,
  type PanelEpisodeLength,
} from "@/lib/creator/credits";
import type { StudioVisibility } from "@/types/creator";

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
}

export default function CreateComicModal({
  open,
  onClose,
  onOpenCharacterModal,
}: CreateComicModalProps) {
  const router = useRouter();
  const getMyCharacters = useCreatorStore((s) => s.getMyCharacters);
  const createStoryFromFlow = useCreatorStore((s) => s.createStoryFromFlow);
  const communityCharacters = useCreatorStore((s) => s.communityCharacters);

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("Fantasy");
  const [description, setDescription] = useState("");
  const [audienceRating, setAudienceRating] = useState("Teen");
  const [visibility, setVisibility] = useState<StudioVisibility>("private");
  const [selectedChars, setSelectedChars] = useState<string[]>([]);
  const [episodePrompt, setEpisodePrompt] = useState("");
  const [panelCount, setPanelCount] = useState<PanelEpisodeLength>(8);
  const [generating, setGenerating] = useState(false);

  const myCharacters = getMyCharacters();
  const usableCommunity = communityCharacters.filter((c) => c.allowOthersToUse);

  const toggleChar = (id: string) => {
    setSelectedChars((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1500));
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
    setGenerating(false);
    onClose();
    router.push(`/creator/editor/${storyId}`);
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
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#2A114B]/40 p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
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
              {step === 0 ? (
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

              {step === 1 ? (
                <div className="space-y-4">
                  <p className="text-sm text-[#667085]">
                    Choose characters before creating your story. They&apos;re
                    reusable across every episode.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={onOpenCharacterModal}
                      className="rounded-xl bg-[#5340FF] px-4 py-2 text-xs font-bold text-white"
                    >
                      + Create character
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
                  {usableCommunity.length > 0 ? (
                    <>
                      <p className="text-xs font-bold uppercase text-[#667085]">
                        Community characters
                      </p>
                      {usableCommunity.slice(0, 2).map((c) => (
                        <CharacterCard
                          key={c.id}
                          character={c}
                          selectable
                          selected={selectedChars.includes(c.id)}
                          onSelect={() => toggleChar(c.id)}
                        />
                      ))}
                    </>
                  ) : null}
                </div>
              ) : null}

              {step === 2 ? (
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

              {step === 3 ? (
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

              {step === 4 ? (
                <div className="rounded-2xl bg-[#F3ECFF] p-5 text-center">
                  <p className="font-heading text-lg font-extrabold text-[#2A114B]">
                    Ready to generate
                  </p>
                  <p className="mt-2 text-sm text-[#667085]">
                    {title} · {panelCount} panels ·{" "}
                    {formatCreditCost(panelGenerationCost(panelCount))}
                  </p>
                  <p className="mt-4 text-xs text-[#667085]">
                    You&apos;ll open the panel editor to refine speech bubbles
                    after generation.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="flex gap-3 border-t border-[#E7D8FF] px-6 py-4">
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
                  disabled={generating}
                  onClick={() => void handleFinish()}
                  className="ml-auto rounded-2xl bg-[#FF6847] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                >
                  {generating ? "Generating panels…" : "Open panel editor"}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
