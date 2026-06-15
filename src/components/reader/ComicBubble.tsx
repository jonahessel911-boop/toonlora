import type { TextBubble } from "@/types/pipeline";
import { normalizePanelBubbles } from "@/lib/comicTextLayout";

function maxBubbleWidth(text: string, type: TextBubble["type"]): string {
  const len = text.length;
  if (type === "narration") {
    if (len < 40) return "min(88%, 300px)";
    if (len < 90) return "min(92%, 360px)";
    return "min(94%, 420px)";
  }
  if (type === "sfx") return "auto";
  if (len < 24) return "min(62%, 210px)";
  if (len < 55) return "min(74%, 280px)";
  if (len < 90) return "min(82%, 340px)";
  return "min(88%, 380px)";
}

interface ComicBubbleProps {
  bubble: TextBubble;
  align?: "left" | "right" | "center";
}

export default function ComicBubble({
  bubble,
  align = "center",
}: ComicBubbleProps) {
  const { type, speaker, text } = bubble;
  const alignClass =
    align === "left"
      ? "self-start"
      : align === "right"
        ? "self-end"
        : "self-center";

  if (type === "sfx") {
    return (
      <div className={`pointer-events-none ${alignClass}`}>
        <p
          className="rounded-md bg-white/90 px-1.5 py-0.5 font-black uppercase tracking-[0.12em] text-[#2A114B] shadow-sm ring-1 ring-black/10"
          style={{ fontSize: "clamp(10px, 2.6vw, 14px)" }}
        >
          {text}
        </p>
      </div>
    );
  }

  if (type === "narration") {
    return (
      <div className={`pointer-events-none ${alignClass}`}>
        <div
          className="rounded-md border border-[#D4C9B8] bg-[#F5F0E6] px-3 py-2 shadow-[0_2px_8px_rgba(42,31,20,0.12)] sm:rounded-lg sm:px-3.5 sm:py-2.5"
          style={{ maxWidth: maxBubbleWidth(text, "narration"), width: "fit-content" }}
        >
          <p className="text-center text-[11px] font-medium leading-snug text-[#2A2520] sm:text-xs sm:leading-relaxed">
            {text}
          </p>
        </div>
      </div>
    );
  }

  const tailOnRight =
    align === "right" || bubble.tail_direction === "bottom-right";

  return (
    <div className={`pointer-events-none ${alignClass}`}>
      <div
        className="relative w-fit rounded-2xl border-2 border-[#1a1a1a] bg-white px-3 py-2 shadow-[0_4px_14px_rgba(0,0,0,0.22)] sm:px-3.5 sm:py-2.5"
        style={{ maxWidth: maxBubbleWidth(text, "speech") }}
      >
        {speaker ? (
          <p className="mb-0.5 text-[9px] font-black uppercase tracking-wider text-[#5340FF] sm:text-[10px]">
            {speaker}
          </p>
        ) : null}
        <p className="text-[12px] font-semibold leading-snug text-[#111] sm:text-[13px] sm:leading-normal">
          {text}
        </p>
        <span
          className={`absolute -bottom-[6px] h-3 w-3 rotate-45 border-b-2 border-r-2 border-[#1a1a1a] bg-white ${
            tailOnRight ? "right-4" : "left-4"
          }`}
          aria-hidden
        />
      </div>
    </div>
  );
}

function speechSide(
  bubble: TextBubble,
  index: number,
  panelIndex: number
): "left" | "right" {
  if (bubble.tail_direction === "bottom-right") return "right";
  if (bubble.tail_direction === "bottom-left") return "left";
  return (panelIndex + index) % 2 === 0 ? "left" : "right";
}

/** Zone-based bubble layout — ignores raw x/y so overlays stay readable on mobile. */
export function PanelBubbleStack({
  bubbles,
  panelIndex = 0,
}: {
  bubbles: TextBubble[];
  panelIndex?: number;
}) {
  const { narrationTop, narrationBottom, speech, sfx } =
    normalizePanelBubbles(bubbles, panelIndex);

  if (!narrationTop && !narrationBottom && speech.length === 0 && !sfx) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {narrationTop ? (
        <div className="absolute inset-x-2 top-2 flex justify-center sm:inset-x-3 sm:top-2.5">
          <ComicBubble bubble={narrationTop} align="center" />
        </div>
      ) : null}

      {sfx ? (
        <div className="absolute right-2 top-2 sm:right-3 sm:top-2.5">
          <ComicBubble bubble={sfx} align="right" />
        </div>
      ) : null}

      {speech.length > 0 ? (
        <div className="absolute inset-x-2 top-[9%] flex max-h-[38%] flex-col gap-1.5 overflow-hidden sm:inset-x-3 sm:top-[10%] sm:gap-2">
          {speech.map((b, i) => {
            const side = speechSide(b, i, panelIndex);
            return (
              <div
                key={`d-${i}`}
                className={`flex w-full ${
                  side === "right" ? "justify-end" : "justify-start"
                }`}
              >
                <ComicBubble
                  bubble={{
                    ...b,
                    tail_direction:
                      side === "right" ? "bottom-right" : "bottom-left",
                  }}
                  align={side}
                />
              </div>
            );
          })}
        </div>
      ) : null}

      {narrationBottom ? (
        <div className="absolute inset-x-2 bottom-2 flex justify-center sm:inset-x-3 sm:bottom-2.5">
          <ComicBubble bubble={narrationBottom} align="center" />
        </div>
      ) : null}
    </div>
  );
}
