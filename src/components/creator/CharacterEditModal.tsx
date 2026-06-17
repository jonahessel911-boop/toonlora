"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CharacterPortraitViewer from "@/components/creator/CharacterPortraitViewer";
import CharacterGenerationProgress from "@/components/creator/CharacterGenerationProgress";
import { buildCharacterShortDescription } from "@/lib/creator/characterDescription";
import { buildCharacterPortraitPrompt } from "@/lib/creator/characterImagePrompt";
import type { CharacterVisibility, StudioCharacter } from "@/types/creator";

interface CharacterEditModalProps {
  character: StudioCharacter | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, patch: Partial<StudioCharacter>) => string;
}

export default function CharacterEditModal({
  character,
  open,
  onClose,
  onSave,
}: CharacterEditModalProps) {
  const [personality, setPersonality] = useState("");
  const [visualDescription, setVisualDescription] = useState("");
  const [outfit, setOutfit] = useState("");
  const [visibility, setVisibility] = useState<CharacterVisibility>("private");
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null);
  const [editInstruction, setEditInstruction] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!character || !open) return;
    setPersonality(character.personality);
    setVisualDescription(character.visualDescription);
    setOutfit(character.outfit);
    setVisibility(character.visibility);
    setPortraitUrl(character.portraitUrl ?? null);
    setEditInstruction("");
    setError(null);
    setGenerating(false);
    setGenerationProgress(0);
  }, [character, open]);

  useEffect(() => {
    if (!generating || generationProgress === 100) return;
    const timer = setInterval(() => {
      setGenerationProgress((value) => {
        if (value >= 92) return value;
        const bump = value < 40 ? 4 : value < 70 ? 2 : 0.8;
        return Math.min(92, value + bump);
      });
    }, 500);
    return () => clearInterval(timer);
  }, [generating, generationProgress]);

  if (!character) return null;

  const imageCharacterId =
    character.publishedCharacterId ?? character.id;

  const handleApplyEdit = async () => {
    if (!portraitUrl || !editInstruction.trim()) return;
    setGenerating(true);
    setError(null);
    setGenerationProgress(0);
    try {
      const res = await fetch("/api/creator/character-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "edit",
          characterId: imageCharacterId,
          editInstruction: editInstruction.trim(),
          referencePortraitUrl: portraitUrl,
        }),
      });
      const data = (await res.json()) as {
        portraitUrl?: string;
        error?: string;
      };
      if (!res.ok || !data.portraitUrl) {
        throw new Error(data.error ?? "Portrait edit failed");
      }
      setGenerationProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 350));
      setPortraitUrl(data.portraitUrl);
      setEditInstruction("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Portrait edit failed");
    } finally {
      setGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleSave = () => {
    const shortDescription = buildCharacterShortDescription(
      visualDescription,
      personality,
      outfit
    );
    const consistencyPrompt = buildCharacterPortraitPrompt({
      name: character.name,
      gender: character.gender,
      role: character.role,
      styleTheme: character.styleTheme,
      ageRange: character.ageRange,
      lookDescription: visualDescription,
      outfitDescription: outfit,
      personality,
      hasReferenceImage: character.referenceImages.length > 0,
    });

    const savedId = onSave(character.id, {
      personality,
      visualDescription,
      outfit,
      visibility,
      shortDescription,
      portraitUrl: portraitUrl ?? undefined,
      consistencyPrompt,
      allowOthersToUse: visibility === "public",
    });
    onClose();
    return savedId;
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-[#2A114B]/50 p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[32px] border border-[#E7D8FF] bg-[#FCFAFF] shadow-2xl sm:rounded-[32px]"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E7D8FF] bg-white px-5 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#5340FF]">
                  Edit character
                </p>
                <h2 className="font-heading text-xl font-extrabold text-[#2A114B]">
                  {character.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-[#667085] hover:bg-[#F3ECFF]"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
              {!portraitUrl && generating ? (
                <CharacterGenerationProgress characterName={character.name} />
              ) : (
                <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_260px] lg:grid-cols-[minmax(0,1fr)_280px]">
                  <div className="min-h-0">
                    {portraitUrl ? (
                      <CharacterPortraitViewer
                        src={portraitUrl}
                        alt={character.name}
                        className="w-full"
                        compact
                        overlayLabel={
                          generating ? "Working the magic…" : undefined
                        }
                      />
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-4">
                    <label className="block">
                      <span className="text-sm font-bold text-[#2A114B]">
                        Personality
                      </span>
                      <textarea
                        rows={3}
                        value={personality}
                        onChange={(e) => setPersonality(e.target.value)}
                        disabled={generating}
                        className="mt-2 w-full resize-none rounded-2xl border border-[#E7D8FF] bg-white px-4 py-3 text-sm text-[#2A114B] disabled:opacity-60"
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-bold text-[#2A114B]">
                        Edit image
                      </span>
                      <textarea
                        rows={3}
                        value={editInstruction}
                        onChange={(e) => setEditInstruction(e.target.value)}
                        disabled={generating}
                        placeholder="Change hair color to brown, change outfit to a suit."
                        className="mt-2 w-full resize-none rounded-2xl border border-[#E7D8FF] bg-white px-4 py-3 text-sm text-[#2A114B] placeholder:text-[#98A2B3] disabled:opacity-60"
                      />
                    </label>

                    <button
                      type="button"
                      disabled={generating || !editInstruction.trim() || !portraitUrl}
                      onClick={() => void handleApplyEdit()}
                      className="w-full rounded-2xl border border-[#E7D8FF] bg-white py-3 text-sm font-bold text-[#5340FF] disabled:opacity-50"
                    >
                      {generating ? "Applying…" : "Apply edit"}
                    </button>

                    {generating ? (
                      <div>
                        <div className="mb-1.5 flex justify-end text-xs text-[#667085]">
                          {Math.round(generationProgress)}%
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-[#E7D8FF]">
                          <div
                            className="h-full rounded-full bg-[#5340FF] transition-[width] duration-500"
                            style={{ width: `${generationProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : null}

                    <label className="block">
                      <span className="text-xs font-bold text-[#2A114B]">
                        Look & body
                      </span>
                      <textarea
                        rows={2}
                        value={visualDescription}
                        onChange={(e) => setVisualDescription(e.target.value)}
                        disabled={generating}
                        className="mt-1 w-full resize-none rounded-xl border border-[#E7D8FF] px-3 py-2 text-sm disabled:opacity-60"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-bold text-[#2A114B]">
                        Outfit
                      </span>
                      <textarea
                        rows={2}
                        value={outfit}
                        onChange={(e) => setOutfit(e.target.value)}
                        disabled={generating}
                        className="mt-1 w-full resize-none rounded-xl border border-[#E7D8FF] px-3 py-2 text-sm disabled:opacity-60"
                      />
                    </label>

                    <div>
                      <p className="text-xs font-bold text-[#2A114B]">
                        Visibility
                      </p>
                      <div className="mt-2 flex gap-2">
                        {(["private", "public"] as const).map((value) => (
                          <button
                            key={value}
                            type="button"
                            disabled={generating}
                            onClick={() => setVisibility(value)}
                            className={`rounded-xl px-4 py-2 text-xs font-bold capitalize ${
                              visibility === value
                                ? "bg-[#5340FF] text-white"
                                : "bg-[#F3ECFF] text-[#667085]"
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>

                    {error ? (
                      <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                      </p>
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 border-t border-[#E7D8FF] bg-white px-5 py-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-[#E7D8FF] px-5 py-3 text-sm font-bold text-[#667085]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={generating || !personality.trim()}
                onClick={handleSave}
                className="ml-auto rounded-2xl bg-[#5340FF] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                Save changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
