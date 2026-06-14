"use client";

import SpeechBubble from "@/components/SpeechBubble";
import type { ReaderPanelData } from "@/lib/readerPanels";

const SCENE_PRESETS = [
  {
    bg: "from-[#2A114B] via-[#4C1D95] to-[#1E0A35]",
    glow: "rgba(124,58,237,0.35)",
    accent: "#22D3EE",
    mood: "moonlit",
  },
  {
    bg: "from-[#5340FF] via-[#7C3AED] to-[#FF4FA3]",
    glow: "rgba(255,79,163,0.25)",
    accent: "#FFE033",
    mood: "magic",
  },
  {
    bg: "from-[#0E7490] via-[#22D3EE] to-[#5340FF]",
    glow: "rgba(34,211,238,0.3)",
    accent: "#FFE033",
    mood: "action",
  },
  {
    bg: "from-[#FF6847] via-[#FF4FA3] to-[#5340FF]",
    glow: "rgba(255,104,71,0.28)",
    accent: "#FFE033",
    mood: "sunset",
  },
  {
    bg: "from-[#F3ECFF] via-[#E9D8FD] to-[#C4B5FD]",
    glow: "rgba(124,58,237,0.2)",
    accent: "#5340FF",
    mood: "calm",
  },
] as const;

interface ComicPanelProps {
  panel: ReaderPanelData;
  index: number;
  isActive?: boolean;
  onClick?: () => void;
}

export default function ComicPanel({
  panel,
  index,
  isActive,
  onClick,
}: ComicPanelProps) {
  const scene = SCENE_PRESETS[index % SCENE_PRESETS.length];
  const isTbc = panel.bubbles?.some((b) =>
    b.text.toLowerCase().includes("to be continued")
  );

  return (
    <article
      id={`panel-${index}`}
      onClick={onClick}
      className={`relative w-full overflow-hidden border-b border-[#E7D8FF]/40 last:border-b-0 ${
        isActive ? "ring-2 ring-inset ring-[#7C3AED]/40" : ""
      } ${onClick ? "cursor-pointer" : ""}`}
    >
      {panel.artUrl ? (
        <div className="relative aspect-[3/4] w-full sm:aspect-[4/5]">
          <img
            src={panel.artUrl}
            alt={`Panel ${panel.panelNumber}`}
            className="h-full w-full object-cover"
          />
          {panel.bubbles?.map((b, i) => (
            <SpeechBubble key={i} bubble={b} />
          ))}
        </div>
      ) : (
        <div
          className={`relative min-h-[280px] w-full bg-gradient-to-br sm:min-h-[340px] ${scene.bg}`}
        >
          {/* Ambient glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 30%, ${scene.glow}, transparent 60%)`,
            }}
            aria-hidden
          />

          {/* Moon / sun */}
          {scene.mood === "moonlit" && (
            <div
              className="absolute right-[12%] top-[10%] h-16 w-16 rounded-full bg-[#F3ECFF]/90 shadow-[0_0_40px_rgba(243,236,255,0.5)] sm:h-20 sm:w-20"
              aria-hidden
            />
          )}

          {/* Stars / sparkles */}
          <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden>
            {[...Array(6)].map((_, i) => (
              <span
                key={i}
                className="absolute text-[10px] text-white/70"
                style={{
                  left: `${12 + i * 14}%`,
                  top: `${8 + (i % 3) * 12}%`,
                }}
              >
                ✦
              </span>
            ))}
          </div>

          {/* Horizon */}
          <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

          {/* Character silhouettes */}
          {!isTbc && (
            <div className="absolute bottom-[12%] left-1/2 flex -translate-x-1/2 items-end gap-2 sm:gap-3">
              <div
                className="rounded-full bg-black/30 backdrop-blur-[1px]"
                style={{
                  width: 24 + (index % 3) * 4,
                  height: 24 + (index % 3) * 4,
                }}
              />
              <div
                className="rounded-t-full bg-black/35"
                style={{
                  width: 32 + (index % 4) * 6,
                  height: 48 + (index % 5) * 8,
                }}
              />
              {index % 2 === 0 && (
                <div
                  className="rounded-full bg-black/25"
                  style={{ width: 20, height: 20 }}
                />
              )}
            </div>
          )}

          {/* Scene accent line */}
          <div
            className="absolute left-[8%] top-[35%] h-px w-[35%] rotate-[-8deg] opacity-30"
            style={{ backgroundColor: scene.accent }}
            aria-hidden
          />

          {/* SFX overlay */}
          {panel.sfx && (
            <p className="absolute left-1/2 top-[18%] -translate-x-1/2 font-black uppercase tracking-[0.2em] text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)] sm:text-2xl">
              {panel.sfx}
            </p>
          )}

          {/* Inline bubbles at bottom */}
          <div className="absolute inset-x-0 bottom-0 space-y-2 p-4 sm:p-5">
            {panel.bubbles
              ?.filter((b) => b.type !== "sfx")
              .map((b, i) => (
                <InlineBubble key={i} bubble={b} />
              ))}
          </div>

          {/* TBC cliffhanger */}
          {isTbc && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#5340FF]/90 via-[#7C3AED]/85 to-[#FF4FA3]/80 px-6">
              <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden>
                {[...Array(8)].map((_, i) => (
                  <span
                    key={i}
                    className="absolute text-white/80"
                    style={{
                      left: `${8 + i * 11}%`,
                      top: `${6 + (i % 4) * 18}%`,
                      fontSize: i % 2 === 0 ? "14px" : "10px",
                    }}
                  >
                    ✦
                  </span>
                ))}
              </div>
              <div className="relative w-full max-w-[320px] overflow-hidden rounded-[24px] border-2 border-white/40 bg-white/95 p-6 text-center shadow-[0_24px_60px_rgba(42,17,75,0.25)] sm:p-8">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5340FF] to-[#FF4FA3] text-xl text-white shadow-lg">
                  ✦
                </div>
                <p className="font-heading text-xl font-extrabold text-[#2A114B] sm:text-2xl">
                  To be continued…
                </p>
                <p className="mt-2 text-sm font-semibold text-[#5340FF]">
                  Episode 1 · {panel.panelNumber} panels
                </p>
                <div className="mt-4 flex justify-center gap-1.5">
                  {["#5340FF", "#FF6847", "#FFE033", "#22D3EE"].map((c) => (
                    <span
                      key={c}
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Panel number badge */}
      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold text-[#5340FF] shadow-sm ring-1 ring-[#E7D8FF] backdrop-blur-sm">
        {panel.panelNumber}
      </span>
    </article>
  );
}

function InlineBubble({
  bubble,
}: {
  bubble: import("@/types/pipeline").TextBubble;
}) {
  if (bubble.type === "narration") {
    return (
      <div className="mx-auto max-w-[90%] rounded-xl border border-[#E7D8FF]/60 bg-[#F3ECFF]/95 px-4 py-3 text-center shadow-sm backdrop-blur-sm">
        <p className="text-sm italic leading-relaxed text-[#2A114B]/80 sm:text-base">
          {bubble.text}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[92%]">
      <div className="relative rounded-2xl border-2 border-[#2A114B]/15 bg-white px-4 py-3 shadow-[0_8px_24px_rgba(42,17,75,0.12)]">
        {bubble.speaker && (
          <p className="mb-1 text-[11px] font-extrabold uppercase tracking-wide text-[#7C3AED]">
            {bubble.speaker}
          </p>
        )}
        <p className="text-sm font-semibold leading-snug text-[#101828] sm:text-base">
          {bubble.text}
        </p>
        <div className="absolute -bottom-2 left-6 h-3 w-3 rotate-45 border-b-2 border-r-2 border-[#2A114B]/15 bg-white" />
      </div>
    </div>
  );
}
