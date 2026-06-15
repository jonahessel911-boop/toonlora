"use client";

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
    <section className="relative overflow-hidden bg-gradient-to-br from-[#2A114B] via-[#3D2BB8] to-[#5340FF] px-5 py-10 sm:px-8 sm:py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 0%, rgba(255,255,255,0.15), transparent 45%), radial-gradient(circle at 80% 100%, rgba(255,224,51,0.08), transparent 40%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-[480px] text-center">
        <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/90">
          Episode {episodeNumber} is free
        </span>

        <h2 className="font-heading mt-4 text-2xl font-extrabold text-white sm:text-3xl">
          Episode complete ✨
        </h2>

        {seriesTitle ? (
          <p className="mt-1 text-sm font-semibold text-white/80">{seriesTitle}</p>
        ) : null}

        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/75">
          Continue reading or create your own version.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {isCatalog ? (
            <button
              type="button"
              onClick={onContinueReading}
              className="btn-coral h-12 w-full text-sm font-bold sm:h-14 sm:text-base"
            >
              Continue reading
            </button>
          ) : (
            onNextEpisode && (
              <button
                type="button"
                disabled={generating}
                onClick={onNextEpisode}
                className="btn-coral h-12 w-full text-sm font-bold disabled:opacity-50 sm:h-14 sm:text-base"
              >
                {generating
                  ? "Creating next episode…"
                  : `Next episode · ${credits} credits`}
              </button>
            )
          )}

          {onShare ? (
            <button
              type="button"
              onClick={onShare}
              className="h-12 w-full rounded-full border-2 border-white/35 bg-white/10 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/15 sm:h-14"
            >
              Share
            </button>
          ) : null}

          {onCreateInspired && !isCatalog ? (
            <button
              type="button"
              onClick={onCreateInspired}
              className="h-12 w-full rounded-full border-2 border-white/25 bg-transparent text-sm font-bold text-white/95 transition hover:bg-white/10 sm:h-14"
            >
              Create inspired version
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
