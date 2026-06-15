"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CharacterPortraitViewer from "@/components/creator/CharacterPortraitViewer";
import CharacterAvatarStudio from "@/components/creator/CharacterAvatarStudio";
import { isDisplayableReference } from "@/components/creator/CharacterReferenceUpload";
import {
  getCharacterDialogueInStory,
  getStoriesForCharacter,
} from "@/lib/creator/characterStories";
import { ensureCharacter } from "@/lib/creator/mockData";
import type { StudioCharacter, StudioStory } from "@/types/creator";

interface CharacterDetailModalProps {
  character: StudioCharacter | null;
  stories: StudioStory[];
  open: boolean;
  onClose: () => void;
  onUseInStory: (characterId: string) => void;
  onDelete: (characterId: string) => void;
  onOpenStory: (storyId: string) => void;
}

export default function CharacterDetailModal({
  character,
  stories,
  open,
  onClose,
  onUseInStory,
  onDelete,
  onOpenStory,
}: CharacterDetailModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const ch = useMemo(
    () => (character ? ensureCharacter(character) : null),
    [character]
  );

  const characterStories = useMemo(
    () => (ch ? getStoriesForCharacter(ch.id, ch, stories) : []),
    [ch, stories]
  );

  const handleClose = () => {
    setConfirmDelete(false);
    onClose();
  };

  useEffect(() => {
    if (!open) setConfirmDelete(false);
  }, [open]);

  if (!ch) return null;

  const portrait = ch.portraitUrl;
  const refImage = !portrait
    ? ch.referenceImages.find(isDisplayableReference)
    : undefined;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-[#2A114B]/50 p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="flex h-[100dvh] max-h-[100dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[32px] border border-[#E7D8FF] bg-[#FCFAFF] shadow-2xl sm:h-auto sm:max-h-[92vh] sm:rounded-[32px]"
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 48, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E7D8FF] bg-white px-5 py-4 sm:px-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#5340FF]">
                  Character profile
                </p>
                <h2 className="font-heading text-xl font-extrabold text-[#2A114B]">
                  {ch.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl p-2 text-[#667085] hover:bg-[#F3ECFF]"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
                <div className="space-y-4">
                  {portrait ? (
                    <CharacterPortraitViewer
                      src={portrait}
                      alt={ch.name}
                      className="w-full"
                    />
                  ) : refImage ? (
                    <div className="overflow-hidden rounded-2xl border border-[#E7D8FF]">
                      <img
                        src={refImage}
                        alt={ch.name}
                        className="aspect-[3/4] w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-2xl border border-[#E7D8FF] bg-[#F3ECFF]">
                      <CharacterAvatarStudio
                        appearance={ch.appearance}
                        name={ch.name}
                        interactive={false}
                        rotateY={-12}
                      />
                    </div>
                  )}

                  <div className="rounded-2xl border border-[#E7D8FF] bg-white p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#667085]">
                      Character ID
                    </p>
                    <p className="mt-1 break-all font-mono text-xs text-[#2A114B]">
                      {ch.id}
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#E9D8FD] px-3 py-1 text-xs font-bold capitalize text-[#5340FF]">
                      {ch.gender}
                    </span>
                    <span className="rounded-full bg-[#F3ECFF] px-3 py-1 text-xs font-bold capitalize text-[#667085]">
                      {ch.role}
                    </span>
                    <span className="rounded-full bg-[#F3ECFF] px-3 py-1 text-xs font-bold capitalize text-[#667085]">
                      {ch.styleTheme}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                        ch.visibility === "public"
                          ? "bg-[#E9D8FD] text-[#5340FF]"
                          : "bg-[#F3ECFF] text-[#667085]"
                      }`}
                    >
                      {ch.visibility}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#2A114B]">
                      Short description
                    </p>
                    <p className="mt-1 text-sm text-[#667085]">
                      {ch.shortDescription}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-bold text-[#2A114B]">
                        Personality
                      </p>
                      <p className="mt-1 text-sm text-[#667085]">
                        {ch.personality}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#2A114B]">
                        Age range
                      </p>
                      <p className="mt-1 text-sm text-[#667085]">{ch.ageRange}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#2A114B]">
                      Look & body
                    </p>
                    <p className="mt-1 text-sm text-[#667085]">
                      {ch.visualDescription}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#2A114B]">Outfit</p>
                    <p className="mt-1 text-sm text-[#667085]">{ch.outfit}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#2A114B]">
                      AI consistency prompt
                    </p>
                    <textarea
                      readOnly
                      rows={5}
                      value={ch.consistencyPrompt}
                      className="mt-1 w-full rounded-2xl border border-[#E7D8FF] bg-white px-3 py-2 font-mono text-xs leading-relaxed text-[#2A114B]"
                    />
                  </div>

                  <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#667085]">
                      Active in stories ({characterStories.length})
                    </p>
                    {characterStories.length === 0 ? (
                      <p className="rounded-2xl border border-dashed border-[#E7D8FF] p-4 text-sm text-[#667085]">
                        Not used in any stories yet.
                      </p>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {characterStories.map((story) => {
                          const dialogue = getCharacterDialogueInStory(
                            ch.id,
                            story
                          );
                          return (
                            <button
                              key={story.id}
                              type="button"
                              onClick={() => onOpenStory(story.id)}
                              className="overflow-hidden rounded-2xl border border-[#E7D8FF] bg-white text-left transition hover:border-[#5340FF]/50 hover:shadow-md"
                            >
                              <div
                                className={`aspect-[3/4] bg-gradient-to-br ${story.coverGradient}`}
                              >
                                {story.coverUrl ? (
                                  <img
                                    src={story.coverUrl}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full flex-col justify-end p-3">
                                    <span className="w-fit rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-[#5340FF]">
                                      {story.genre}
                                    </span>
                                    <p className="mt-1 font-heading text-sm font-extrabold text-white drop-shadow">
                                      {story.title}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div className="p-3">
                                <p className="font-bold text-[#2A114B]">
                                  {story.title}
                                </p>
                                <p className="mt-0.5 text-[10px] capitalize text-[#667085]">
                                  {story.status} · {story.genre}
                                </p>
                                {dialogue.length > 0 ? (
                                  <p className="mt-2 line-clamp-2 text-xs italic text-[#667085]">
                                    &ldquo;{dialogue[0]}&rdquo;
                                    {dialogue.length > 1
                                      ? ` +${dialogue.length - 1} more lines`
                                      : ""}
                                  </p>
                                ) : (
                                  <p className="mt-2 text-xs text-[#667085]">
                                    Appears in {story.episodes.length} episode
                                    {story.episodes.length !== 1 ? "s" : ""}
                                  </p>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 shrink-0 border-t border-[#E7D8FF] bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
              {confirmDelete ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-[#A4262C]">
                    Delete {ch.name}? This cannot be undone.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="rounded-2xl border border-[#E7D8FF] px-4 py-3 text-sm font-bold text-[#667085]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(ch.id);
                        handleClose();
                      }}
                      className="rounded-2xl bg-[#A4262C] px-4 py-3 text-sm font-bold text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="rounded-2xl border border-[#FECACA] px-4 py-3 text-sm font-bold text-[#A4262C]"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onUseInStory(ch.id);
                      handleClose();
                    }}
                    className="rounded-2xl bg-[#FF6847] px-4 py-3 text-sm font-bold text-white"
                  >
                    Use in story
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
