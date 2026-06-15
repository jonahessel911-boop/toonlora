"use client";

import type { PanelTextOverlay } from "@/lib/panelOverlayLayout";

interface PanelTextOverlayViewProps {
  overlay: PanelTextOverlay;
}

export default function PanelTextOverlayView({
  overlay,
}: PanelTextOverlayViewProps) {
  const { type, speaker, text, position, tail } = overlay;

  const style: React.CSSProperties = {
    left: `${position.x}%`,
    top: `${position.y}%`,
    width: `${position.width}%`,
    maxWidth: type === "speech" ? "70%" : type === "narration" ? "78%" : "28%",
  };

  if (type === "sfx") {
    return (
      <div
        className="pointer-events-none absolute z-10"
        style={style}
      >
        <span className="inline-block rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#2A114B] shadow-sm ring-1 ring-black/10 sm:text-[11px]">
          {text}
        </span>
      </div>
    );
  }

  if (type === "narration") {
    return (
      <div className="pointer-events-none absolute z-10" style={style}>
        <div className="rounded-[14px] border border-[#E7D8FF] bg-[#FFF8E8] px-3 py-2 shadow-[0_4px_14px_rgba(0,0,0,0.1)] sm:px-4 sm:py-2.5">
          <p
            className="text-center font-medium leading-[1.3] text-[#101828]"
            style={{ fontSize: "clamp(12px, 3.2vw, 15px)" }}
          >
            {text}
          </p>
        </div>
      </div>
    );
  }

  const tailRight = tail === "bottom-right" || tail === "right";

  return (
    <div className="pointer-events-none absolute z-10" style={style}>
      <div
        className="relative rounded-[18px] border-2 border-[rgba(16,24,40,0.16)] bg-white px-3 py-2.5 shadow-[0_8px_20px_rgba(0,0,0,0.14)] sm:px-4 sm:py-3"
        style={{ maxWidth: "100%" }}
      >
        {speaker ? (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#5340FF] sm:text-[11px]">
            {speaker}
          </p>
        ) : null}
        <p
          className="font-medium leading-[1.3] text-[#101828]"
          style={{ fontSize: "clamp(14px, 3.6vw, 17px)" }}
        >
          {text}
        </p>
        {tail && tail !== "none" ? (
          <span
            className={`absolute -bottom-[7px] h-3 w-3 rotate-45 border-b-2 border-r-2 border-[rgba(16,24,40,0.16)] bg-white ${
              tailRight ? "right-5" : "left-5"
            }`}
            aria-hidden
          />
        ) : null}
      </div>
    </div>
  );
}

/** Caption cards below shared strip art — no absolute positioning on the image. */
export function PanelCaptionCards({
  overlays,
  panelNumber,
}: {
  overlays: PanelTextOverlay[];
  panelNumber: number;
}) {
  if (!overlays.length) return null;

  return (
    <section
      className="border-t border-white/[0.08] bg-[#12081F] px-4 py-4 sm:px-5 sm:py-5"
      aria-label={`Panel ${panelNumber} dialogue`}
    >
      <div className="flex flex-col gap-3">
        {overlays.map((overlay) => (
          <CaptionCard key={overlay.id} overlay={overlay} />
        ))}
      </div>
    </section>
  );
}

function CaptionCard({ overlay }: { overlay: PanelTextOverlay }) {
  const { type, speaker, text } = overlay;

  if (type === "narration") {
    return (
      <div className="mx-auto max-w-[92%] rounded-[14px] border border-[#E7D8FF]/40 bg-[#F3ECFF] px-4 py-3">
        <p className="text-center text-sm leading-[1.35] text-[#101828]">{text}</p>
      </div>
    );
  }

  if (type === "sfx") {
    return (
      <p className="text-center text-xs font-black uppercase tracking-widest text-white/70">
        {text}
      </p>
    );
  }

  return (
    <div className="max-w-[88%] rounded-[18px] border-2 border-white/10 bg-white px-4 py-3 shadow-lg">
      {speaker ? (
        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#5340FF]">
          {speaker}
        </p>
      ) : null}
      <p className="text-sm leading-[1.35] text-[#101828]">{text}</p>
    </div>
  );
}
