"use client";

import { motion } from "framer-motion";

interface EpisodeCompleteCardProps {
  seriesTitle?: string;
  episodeNumber?: number;
  isCatalog?: boolean;
  credits?: number;
  generating?: boolean;
  onShare?: () => void;
  onNextEpisode?: () => void;
  onContinueReading?: () => void;
  onCreateInspired?: () => void;
}

export default function EpisodeCompleteCard({
  seriesTitle,
  episodeNumber = 1,
  isCatalog = false,
  credits = 7,
  generating = false,
  onShare,
  onNextEpisode,
  onContinueReading,
  onCreateInspired,
}: EpisodeCompleteCardProps) {
  return (
    <section className="relative overflow-hidden rounded-b-[18px] bg-gradient-to-b from-[#F3ECFF] via-[#FCFAFF] to-[#E9D8FD]/40 px-4 py-8 sm:px-6 sm:py-10">
      {/* Ambient decoration */}
      <div
        className="pointer-events-none absolute -left-8 top-6 h-28 w-28 rounded-full bg-[#5340FF]/10 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-6 bottom-4 h-32 w-32 rounded-full bg-[#FF4FA3]/10 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-[10%] top-4 text-[#5340FF]/30"
        aria-hidden
      >
        ✦
      </div>
      <div
        className="pointer-events-none absolute right-[12%] top-10 text-[#FFE033]/50"
        aria-hidden
      >
        ✦
      </div>

      {/* Mini panel strip */}
      <div className="relative mb-6 flex justify-center gap-2">
        {["from-[#5340FF] to-[#7C3AED]", "from-[#FF4FA3] to-[#FF6847]", "from-[#22D3EE] to-[#5340FF]"].map(
          (g, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`h-14 w-10 overflow-hidden rounded-lg bg-gradient-to-br ${g} shadow-md ring-2 ring-white sm:h-16 sm:w-11`}
              style={{ rotate: `${(i - 1) * 6}deg` }}
            />
          )
        )}
      </div>

      <div className="relative mx-auto max-w-[480px] overflow-hidden rounded-[28px] border border-[#E7D8FF] bg-white p-6 text-center shadow-[0_20px_60px_rgba(83,64,255,0.12),0_0_0_1px_rgba(124,58,237,0.04)] sm:p-8">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#7C3AED]/10 blur-2xl"
          aria-hidden
        />

        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3ECFF] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#7C3AED] ring-1 ring-[#E7D8FF]">
          ✦ Episode {episodeNumber} is free
        </span>

        <h2 className="font-heading mt-4 text-2xl font-extrabold text-[#2A114B] sm:text-[1.75rem]">
          Episode complete ✨
        </h2>

        {seriesTitle && (
          <p className="mt-1 text-sm font-semibold text-[#5340FF]">{seriesTitle}</p>
        )}

        <p className="mx-auto mt-3 max-w-[360px] text-sm leading-relaxed text-[#667085]">
          Share this episode, continue the story, or create your own version.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {isCatalog ? (
            <button
              type="button"
              onClick={onContinueReading}
              className="inline-flex h-14 w-full items-center justify-center rounded-full bg-[#FF6847] text-base font-extrabold text-white shadow-[0_10px_28px_rgba(255,104,71,0.3)] transition hover:brightness-105 active:scale-[0.98]"
            >
              Continue reading
            </button>
          ) : (
            onNextEpisode && (
              <button
                type="button"
                disabled={generating}
                onClick={onNextEpisode}
                className="inline-flex h-14 w-full items-center justify-center rounded-full bg-[#FFE033] text-base font-extrabold text-[#2A114B] shadow-[0_10px_28px_rgba(255,224,51,0.35)] transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50"
              >
                {generating
                  ? "Creating next episode…"
                  : `Next episode · ${credits} credits`}
              </button>
            )
          )}

          {onShare && (
            <button
              type="button"
              onClick={onShare}
              className="inline-flex h-12 w-full items-center justify-center rounded-full border-2 border-[#E7D8FF] bg-[#FCFAFF] text-sm font-bold text-[#5340FF] transition hover:bg-[#F3ECFF]"
            >
              Share episode
            </button>
          )}

          {onCreateInspired && !isCatalog && (
            <button
              type="button"
              onClick={onCreateInspired}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-[#5340FF]/20 bg-white text-sm font-bold text-[#2A114B] transition hover:bg-[#F3ECFF]/60"
            >
              Create inspired version
              <span className="rounded-full bg-[#E9D8FD] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#7C3AED]">
                Uses credits
              </span>
            </button>
          )}
        </div>

        <p className="mt-4 text-xs text-[#667085]">
          {isCatalog
            ? "Create a free account to continue reading."
            : "Creating and inspired versions use credits."}
        </p>
      </div>
    </section>
  );
}
