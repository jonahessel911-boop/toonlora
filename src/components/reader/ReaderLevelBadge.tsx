"use client";

import { READER_RANKS, getRankProgress, type ReaderRank } from "@/lib/levels";
import type { ReadingLevelStats } from "@/lib/levels";

interface ReaderLevelBadgeProps {
  rank: ReaderRank;
  size?: "sm" | "md";
}

export function ReaderLevelBadge({ rank, size = "md" }: ReaderLevelBadgeProps) {
  const isSm = size === "sm";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wide ${rank.colorClass} ${
        isSm ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-[11px]"
      }`}
      style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
    >
      <span aria-hidden>{rank.emoji}</span>
      {rank.name}
    </span>
  );
}

interface ReaderLevelProgressionProps {
  stats: ReadingLevelStats;
}

export function ReaderLevelProgression({ stats }: ReaderLevelProgressionProps) {
  const { current, next, progress, label } = getRankProgress(stats);
  const visibleRanks = READER_RANKS.filter(
    (r) => !r.secret || stats.fullStoriesRead >= r.minFullStories
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <ReaderLevelBadge rank={current} />
        {next ? (
          <span className="text-xs text-[#667085]">{label}</span>
        ) : (
          <span className="text-xs font-semibold text-[#7C3AED]">Max rank</span>
        )}
      </div>

      {next ? (
        <div className="h-2 overflow-hidden rounded-full bg-[#E9D8FD]/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#5340FF] to-[#7C3AED] transition-all duration-500"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      ) : null}

      <p className="text-center text-[11px] font-medium text-[#667085]">
        Read more → rank up → unlock rewards
      </p>

      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max items-start gap-3 px-1">
          {visibleRanks.map((rank) => {
            const unlocked =
              stats.fullStoriesRead >= rank.minFullStories &&
              stats.episodesCompleted >= rank.minEpisodes;
            const isCurrent = rank.id === current.id;
            return (
              <div
                key={rank.id}
                className="flex w-[72px] flex-col items-center text-center"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-lg ${
                    isCurrent
                      ? `${rank.bgClass} ring-2 ring-[#5340FF] ring-offset-2 ring-offset-white`
                      : unlocked
                        ? rank.bgClass
                        : "bg-[#E7D8FF]/60 opacity-50"
                  }`}
                >
                  {rank.emoji}
                </div>
                <p
                  className={`mt-1.5 text-[9px] font-extrabold uppercase leading-tight ${
                    isCurrent ? rank.colorClass : "text-[#667085]"
                  }`}
                >
                  {rank.secret && !unlocked ? "???" : rank.name}
                </p>
                <p className="mt-0.5 text-[8px] leading-tight text-[#98A2B3]">
                  {rank.requirement}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
