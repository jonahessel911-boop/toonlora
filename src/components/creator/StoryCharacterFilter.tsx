"use client";

import type { StudioCharacter } from "@/types/creator";

interface StoryCharacterFilterProps {
  characters: StudioCharacter[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function StoryCharacterFilter({
  characters,
  selectedIds,
  onChange,
}: StoryCharacterFilterProps) {
  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
    );
  };

  if (characters.length === 0) return null;

  return (
    <div className="rounded-[24px] border border-[#E7D8FF] bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs font-bold text-[#2A114B]">Characters included:</p>
        {selectedIds.length > 0 ? (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-[10px] font-bold text-[#5340FF] hover:underline"
          >
            Clear
          </button>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {characters.map((character) => {
          const selected = selectedIds.includes(character.id);
          return (
            <button
              key={character.id}
              type="button"
              onClick={() => toggle(character.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                selected
                  ? "bg-[#5340FF] text-white shadow-[0_2px_8px_rgba(83,64,255,0.3)]"
                  : "border border-[#E7D8FF] bg-[#F3ECFF] text-[#5340FF] hover:border-[#5340FF]/40"
              }`}
            >
              {character.name}
            </button>
          );
        })}
      </div>
      {selectedIds.length > 0 ? (
        <p className="mt-2 text-[10px] text-[#667085]">
          Showing stories that include{" "}
          {selectedIds.length === 1 ? "this character" : "any selected character"}
        </p>
      ) : null}
    </div>
  );
}
