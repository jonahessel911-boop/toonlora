"use client";

import CharacterAvatarStudio from "@/components/creator/CharacterAvatarStudio";
import { isDisplayableReference } from "@/components/creator/CharacterReferenceUpload";
import { ensureCharacter } from "@/lib/creator/mockData";
import type { StudioCharacter } from "@/types/creator";

interface CharacterCardProps {
  character: StudioCharacter;
  onOpen?: () => void;
  onUse?: () => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}

export default function CharacterCard({
  character,
  onOpen,
  onUse,
  selectable,
  selected,
  onSelect,
}: CharacterCardProps) {
  const ch = ensureCharacter(character);
  const portrait = ch.portraitUrl;
  const refImage = !portrait
    ? ch.referenceImages.find(isDisplayableReference)
    : undefined;

  const mainContent = (
    <>
      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl border border-[#E7D8FF] bg-[#F3ECFF]">
          {portrait ? (
            <img
              src={portrait}
              alt={`${ch.name} portrait`}
              className="h-full w-full object-contain object-bottom"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, #e8e0f5 25%, transparent 25%),
                  linear-gradient(-45deg, #e8e0f5 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #e8e0f5 75%),
                  linear-gradient(-45deg, transparent 75%, #e8e0f5 75%)
                `,
                backgroundSize: "10px 10px",
                backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0px",
              }}
            />
          ) : refImage ? (
            <img
              src={refImage}
              alt={`${ch.name} reference`}
              className="h-full w-full object-cover"
            />
          ) : (
            <CharacterAvatarStudio
              appearance={ch.appearance}
              interactive={false}
              rotateY={-10}
              className="scale-[0.35] origin-top-left -ml-2 -mt-2"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-base font-extrabold text-[#2A114B]">
              {ch.name}
            </h3>
            <span className="rounded-full bg-[#E9D8FD] px-2 py-0.5 text-[10px] font-bold capitalize text-[#5340FF]">
              {ch.gender}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                ch.visibility === "public"
                  ? "bg-[#E9D8FD] text-[#5340FF]"
                  : "bg-[#F3ECFF] text-[#667085]"
              }`}
            >
              {ch.visibility}
            </span>
          </div>
          <p className="mt-0.5 text-xs capitalize text-[#667085]">
            {ch.role} · {ch.styleTheme}
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-[#667085]">
            {ch.shortDescription}
          </p>
          <p className="mt-2 text-[10px] text-[#667085]">
            Used in {ch.usedInStories.length} stories · ID {ch.id}
          </p>
          {onOpen ? (
            <p className="mt-2 text-[10px] font-bold text-[#5340FF]">
              Tap to view profile →
            </p>
          ) : null}
        </div>
    </>
  );

  return (
    <article
      className={`overflow-hidden rounded-[24px] border bg-white shadow-[0_4px_20px_rgba(83,64,255,0.06)] transition ${
        selected
          ? "border-[#5340FF] ring-2 ring-[#5340FF]/30"
          : "border-[#E7D8FF] hover:shadow-[0_8px_28px_rgba(83,64,255,0.12)]"
      }`}
    >
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          className="flex w-full gap-4 p-4 text-left transition hover:bg-[#FCFAFF]"
        >
          {mainContent}
        </button>
      ) : (
        <div className="flex gap-4 p-4">{mainContent}</div>
      )}

      {(selectable && onSelect) || onUse ? (
        <div className="flex flex-wrap gap-2 border-t border-[#E7D8FF] bg-[#FCFAFF] px-4 py-3">
          {selectable && onSelect ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold ${
                selected
                  ? "bg-[#5340FF] text-white"
                  : "border border-[#E7D8FF] text-[#5340FF]"
              }`}
            >
              {selected ? "Selected" : "Select"}
            </button>
          ) : null}
          {onUse ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUse();
              }}
              className="rounded-xl bg-[#FF6847] px-3 py-1.5 text-xs font-bold text-white"
            >
              Use in story
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
