"use client";

import Link from "next/link";
import type { EpisodeCharacterRef } from "@/lib/characters/episodeCharacters";

const GRADIENTS = [
  "from-[#5340FF] via-[#7C3AED] to-[#FF4FA3]",
  "from-[#22D3EE] via-[#5340FF] to-[#2A114B]",
  "from-[#FF6847] via-[#FFE033] to-[#FF4FA3]",
  "from-[#0E7490] via-[#22D3EE] to-[#5340FF]",
  "from-[#2A114B] via-[#5340FF] to-[#6D4CFF]",
];

function gradientForName(name: string) {
  const seed = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return GRADIENTS[seed % GRADIENTS.length];
}

function initialsForName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

interface CharacterPortraitThumbProps {
  character: EpisodeCharacterRef;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASS = {
  sm: "h-16 w-16",
  md: "h-20 w-20",
  lg: "h-28 w-28",
} as const;

export default function CharacterPortraitThumb({
  character,
  size = "md",
  className = "",
}: CharacterPortraitThumbProps) {
  const sizeClass = SIZE_CLASS[size];
  const hasPortrait = Boolean(character.portraitUrl);

  return (
    <div
      className={`overflow-hidden rounded-2xl ${sizeClass} ${className} ${
        hasPortrait
          ? "bg-transparent"
          : "border border-[#E7D8FF] bg-[#F3ECFF]"
      }`}
    >
      {hasPortrait ? (
        <img
          src={character.portraitUrl}
          alt={character.name}
          className="h-full w-full object-contain object-bottom"
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradientForName(character.name)}`}
        >
          <span className="font-heading text-lg font-extrabold text-white drop-shadow">
            {initialsForName(character.name)}
          </span>
        </div>
      )}
    </div>
  );
}

export function CharacterPortraitLink({
  character,
  size = "md",
}: {
  character: EpisodeCharacterRef;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <Link
      href={`/character/${character.slug}`}
      className="group flex w-[108px] shrink-0 flex-col items-center gap-2 sm:w-[120px]"
    >
      <CharacterPortraitThumb
        character={character}
        size={size}
        className="transition group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_24px_rgba(83,64,255,0.18)]"
      />
      <div className="w-full text-center">
        <p className="truncate text-sm font-bold text-[#222] group-hover:text-[#5340FF]">
          {character.name}
        </p>
        {character.role ? (
          <p className="mt-0.5 truncate text-[11px] text-[#888]">{character.role}</p>
        ) : null}
      </div>
    </Link>
  );
}
