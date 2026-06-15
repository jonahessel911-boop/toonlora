"use client";

import type { StudioCharacter } from "@/types/creator";

interface CharacterCardProps {
  character: StudioCharacter;
  onUse?: () => void;
  onEdit?: () => void;
  onMakePublic?: () => void;
  onDuplicate?: () => void;
  onView?: () => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}

export default function CharacterCard({
  character,
  onUse,
  onEdit,
  onMakePublic,
  onDuplicate,
  onView,
  selectable,
  selected,
  onSelect,
}: CharacterCardProps) {
  return (
    <article
      className={`overflow-hidden rounded-[24px] border bg-white shadow-[0_4px_20px_rgba(83,64,255,0.06)] transition ${
        selected
          ? "border-[#5340FF] ring-2 ring-[#5340FF]/30"
          : "border-[#E7D8FF] hover:shadow-[0_8px_28px_rgba(83,64,255,0.12)]"
      }`}
    >
      <div className="flex gap-4 p-4">
        <div
          className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${character.portraitGradient} font-heading text-2xl font-extrabold text-white shadow-inner`}
        >
          {character.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-base font-extrabold text-[#2A114B]">
              {character.name}
            </h3>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                character.visibility === "public"
                  ? "bg-[#E9D8FD] text-[#5340FF]"
                  : "bg-[#F3ECFF] text-[#667085]"
              }`}
            >
              {character.visibility}
            </span>
          </div>
          <p className="mt-0.5 text-xs capitalize text-[#667085]">
            {character.role} · {character.styleTheme}
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-[#667085]">
            {character.shortDescription}
          </p>
          <p className="mt-2 text-[10px] text-[#667085]">
            Used in {character.usedInStories.length} stories · by{" "}
            {character.creatorName}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-[#E7D8FF] bg-[#FCFAFF] px-4 py-3">
        {selectable && onSelect ? (
          <button
            type="button"
            onClick={onSelect}
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
            onClick={onUse}
            className="rounded-xl bg-[#FF6847] px-3 py-1.5 text-xs font-bold text-white"
          >
            Use in story
          </button>
        ) : null}
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="rounded-xl border border-[#E7D8FF] px-3 py-1.5 text-xs font-bold text-[#5340FF]"
          >
            Edit
          </button>
        ) : null}
        {onMakePublic && character.visibility === "private" ? (
          <button
            type="button"
            onClick={onMakePublic}
            className="rounded-xl border border-[#E7D8FF] px-3 py-1.5 text-xs font-bold text-[#667085]"
          >
            Make public
          </button>
        ) : null}
        {onDuplicate ? (
          <button
            type="button"
            onClick={onDuplicate}
            className="rounded-xl border border-[#E7D8FF] px-3 py-1.5 text-xs font-bold text-[#667085]"
          >
            Duplicate
          </button>
        ) : null}
        {onView ? (
          <button
            type="button"
            onClick={onView}
            className="rounded-xl border border-[#E7D8FF] px-3 py-1.5 text-xs font-bold text-[#667085]"
          >
            Profile
          </button>
        ) : null}
      </div>
    </article>
  );
}
