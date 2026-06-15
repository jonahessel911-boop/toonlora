"use client";

import { forwardRef } from "react";
import type { ReaderPanelData } from "@/lib/readerPanels";
import PanelTextOverlayView from "@/components/reader/PanelTextOverlayView";

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
  variant?: "stack" | "flipbook" | "scroll";
}

const ComicPanel = forwardRef<HTMLElement, ComicPanelProps>(function ComicPanel(
  { panel, index, isActive, onClick, variant = "stack" },
  ref
) {
  const scene = SCENE_PRESETS[index % SCENE_PRESETS.length];
  const isFlipbook = variant === "flipbook";
  const isScroll = variant === "scroll";
  const isTbc = panel.textOverlays?.some((b) =>
    b.text.toLowerCase().includes("to be continued")
  );

  return (
    <article
      ref={ref}
      id={`panel-${index}`}
      onClick={onClick}
      className={`relative block w-full overflow-hidden ${
        isScroll
          ? ""
          : isFlipbook
            ? "h-full w-full"
            : `border-b border-[#E7D8FF]/40 last:border-b-0 ${
                isActive ? "ring-2 ring-inset ring-[#7C3AED]/40" : ""
              }`
      } ${onClick ? "cursor-pointer" : ""}`}
    >
      {panel.imageUrl ?? panel.artUrl ? (
        <div
          className={`relative w-full ${
            isScroll
              ? ""
              : isFlipbook
                ? "h-full"
                : "aspect-[3/4] sm:aspect-[4/5]"
          }`}
        >
          <img
            src={panel.imageUrl ?? panel.artUrl}
            alt={`Panel ${panel.panelNumber}`}
            className={`block w-full ${
              isScroll ? "h-auto" : "h-full object-cover"
            }`}
          />
          {panel.textOverlays?.map((overlay) => (
            <PanelTextOverlayView key={overlay.id} overlay={overlay} />
          ))}
        </div>
      ) : (
        <div
          className={`relative w-full bg-gradient-to-br ${scene.bg} ${
            isFlipbook
              ? "h-full min-h-0"
              : isScroll
                ? "min-h-[100dvh]"
                : "min-h-[280px] sm:min-h-[340px]"
          }`}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 30%, ${scene.glow}, transparent 60%)`,
            }}
            aria-hidden
          />

          {scene.mood === "moonlit" && (
            <div
              className="absolute right-[12%] top-[10%] h-16 w-16 rounded-full bg-[#F3ECFF]/90 shadow-[0_0_40px_rgba(243,236,255,0.5)] sm:h-20 sm:w-20"
              aria-hidden
            />
          )}

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

          <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

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

          <div
            className="absolute left-[8%] top-[35%] h-px w-[35%] rotate-[-8deg] opacity-30"
            style={{ backgroundColor: scene.accent }}
            aria-hidden
          />

          {panel.textOverlays?.map((overlay) => (
            <PanelTextOverlayView key={overlay.id} overlay={overlay} />
          ))}

          {isTbc && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#5340FF]/90 via-[#7C3AED]/85 to-[#FF4FA3]/80 px-6">
              <div className="relative w-full max-w-[320px] overflow-hidden rounded-[24px] border-2 border-white/40 bg-white/95 p-6 text-center shadow-[0_24px_60px_rgba(42,17,75,0.25)] sm:p-8">
                <p className="font-heading text-xl font-extrabold text-[#2A114B] sm:text-2xl">
                  To be continued…
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {!isScroll && (
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold text-[#5340FF] shadow-sm ring-1 ring-[#E7D8FF] backdrop-blur-sm">
          {panel.panelNumber}
        </span>
      )}
    </article>
  );
});

export default ComicPanel;

