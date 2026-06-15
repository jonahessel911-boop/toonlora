import { getGenreColors } from "@/lib/brand";

export interface CoverArtProps {
  gradient: string;
  emoji?: string;
  genre?: string;
  title?: string;
  showOverlay?: boolean;
  seed?: number;
  className?: string;
}

function hash(str: string): number {
  return str.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

/** Premium mock cover — layered scene art, not a centered emoji placeholder */
export default function CoverArt({
  gradient,
  genre = "Story",
  title,
  showOverlay = true,
  seed: seedProp,
  className = "",
}: CoverArtProps) {
  const seed = seedProp ?? hash(`${genre}-${title ?? ""}`);
  const hueShift = seed % 360;
  const genreStyle = getGenreColors(genre);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Base gradient mesh */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background: `radial-gradient(circle at 20% 20%, hsla(${hueShift}, 80%, 70%, 0.45), transparent 45%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.35), transparent 40%), radial-gradient(circle at 50% 100%, rgba(42,17,75,0.35), transparent 55%)`,
        }}
      />

      {/* Horizon / ground */}
      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-black/35 via-black/10 to-transparent" />

      {/* Decorative shapes */}
      <div className="absolute -right-8 top-4 h-24 w-24 rounded-full bg-white/15 blur-sm" />
      <div className="absolute left-3 top-8 h-10 w-10 rounded-full bg-white/20" />
      <div
        className="absolute right-6 top-14 h-2 w-2 rounded-full bg-white/70"
        style={{ boxShadow: "12px 8px 0 rgba(255,255,255,0.5), 24px -4px 0 rgba(255,255,255,0.35)" }}
      />

      {/* Speed / scene lines */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute left-[10%] top-[25%] h-px w-[35%] rotate-[-12deg] bg-white" />
        <div className="absolute left-[15%] top-[32%] h-px w-[28%] rotate-[-8deg] bg-white" />
        <div className="absolute right-[8%] top-[40%] h-px w-[30%] rotate-[10deg] bg-white" />
      </div>

      {/* Stylized title monogram */}
      {title ? (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <span
            className="font-heading font-extrabold text-white/[0.12]"
            style={{ fontSize: "clamp(3.5rem, 28vw, 7rem)" }}
          >
            {title.trim()[0]?.toUpperCase() ?? "T"}
          </span>
        </div>
      ) : null}

      {/* Inner comic frame */}
      <div className="pointer-events-none absolute inset-2 rounded-[12px] border border-white/20 sm:inset-2.5" />

      {/* Character silhouettes */}
      <div className="absolute bottom-[8%] left-1/2 flex -translate-x-1/2 items-end gap-1">
        <div
          className="rounded-full bg-black/25 backdrop-blur-[1px]"
          style={{ width: 28 + (seed % 12), height: 28 + (seed % 12) }}
        />
        <div
          className="rounded-t-full bg-black/30"
          style={{ width: 36 + (seed % 16), height: 52 + (seed % 20) }}
        />
        <div
          className="rounded-full bg-black/20"
          style={{ width: 22 + (seed % 10), height: 22 + (seed % 10) }}
        />
      </div>

      {/* Foreground glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

      {showOverlay && (
        <>
          <span
            className={`absolute left-2.5 top-2.5 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-sm ${genreStyle.bg} ${genreStyle.text}`}
          >
            {genre}
          </span>
          {title && (
            <div className="absolute bottom-0 left-0 right-0 p-2 pt-6 sm:p-2.5 sm:pt-8">
              <p className="line-clamp-2 text-[11px] font-extrabold leading-tight text-white drop-shadow-md sm:text-sm">
                {title}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export const COVER_PRESETS: Record<
  string,
  { gradient: string; emoji: string }
> = {
  Anime: { gradient: "from-[#8B5CF6] via-[#A78BFA] to-[#FF4FA3]", emoji: "🌸" },
  Romance: { gradient: "from-[#FF4FA3] via-[#F472B6] to-[#FFD84D]", emoji: "💕" },
  Fantasy: { gradient: "from-[#7C3AED] via-[#9333EA] to-[#C4B5FD]", emoji: "🧙" },
  Drama: { gradient: "from-[#FB7185] via-[#F472B6] to-[#EC4899]", emoji: "🎭" },
  Comedy: { gradient: "from-[#FFD84D] via-[#FBBF24] to-[#FF4FA3]", emoji: "😂" },
  Adventure: { gradient: "from-[#22D3EE] via-[#38BDF8] to-[#60A5FA]", emoji: "⚔️" },
  "Slice of Life": {
    gradient: "from-[#34D399] via-[#4ADE80] to-[#86EFAC]",
    emoji: "☕",
  },
  Spicy: { gradient: "from-[#FF4FA3] via-[#F43F5E] to-[#FB7185]", emoji: "🔥" },
  default: {
    gradient: "from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA]",
    emoji: "✨",
  },
};

export function getCoverPreset(genre: string) {
  return COVER_PRESETS[genre] ?? COVER_PRESETS.default;
}
