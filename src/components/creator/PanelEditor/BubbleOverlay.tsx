"use client";

import type { StudioBubble } from "@/types/creator";

interface BubbleOverlayProps {
  bubble: StudioBubble;
  selected?: boolean;
  speakerName?: string;
  onSelect: () => void;
  onDrag?: (x: number, y: number) => void;
}

export default function BubbleOverlay({
  bubble,
  selected,
  speakerName,
  onSelect,
}: BubbleOverlayProps) {
  const style: React.CSSProperties = {
    left: `${bubble.x}%`,
    top: `${bubble.y}%`,
    width: `${bubble.width}%`,
    maxWidth: bubble.type === "narration" ? "78%" : "70%",
  };

  const base =
    "absolute z-10 cursor-pointer transition ring-offset-2 " +
    (selected ? "ring-2 ring-[#5340FF]" : "hover:ring-2 hover:ring-[#E9D8FD]");

  if (bubble.type === "sfx") {
    return (
      <button type="button" className={base} style={style} onClick={onSelect}>
        <span className="inline-block rounded-lg bg-white/95 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[#2A114B] shadow ring-1 ring-black/10">
          {bubble.text}
        </span>
      </button>
    );
  }

  if (bubble.type === "narration") {
    return (
      <button type="button" className={base} style={style} onClick={onSelect}>
        <div className="rounded-[14px] border border-[#E7D8FF] bg-[#FFF8E8] px-3 py-2 shadow-md">
          <p className="text-center text-xs font-medium text-[#101828]">
            {bubble.text}
          </p>
        </div>
      </button>
    );
  }

  if (bubble.type === "thought") {
    return (
      <button type="button" className={base} style={style} onClick={onSelect}>
        <div className="rounded-[20px] border-2 border-dashed border-[#5340FF]/40 bg-white/90 px-3 py-2 shadow-md">
          <p className="text-xs italic text-[#667085]">{bubble.text}</p>
        </div>
      </button>
    );
  }

  const tailRight =
    bubble.tail === "bottom-right" || bubble.tail === "right";

  return (
    <button type="button" className={base} style={style} onClick={onSelect}>
      <div className="relative rounded-[18px] border-2 border-[rgba(16,24,40,0.16)] bg-white px-3 py-2 shadow-lg">
        {speakerName ? (
          <p className="mb-0.5 text-[10px] font-bold uppercase text-[#5340FF]">
            {speakerName}
          </p>
        ) : null}
        <p className="text-left text-sm font-medium text-[#101828]">
          {bubble.text}
        </p>
        {bubble.tail !== "none" ? (
          <span
            className={`absolute -bottom-[6px] h-2.5 w-2.5 rotate-45 border-b-2 border-r-2 border-[rgba(16,24,40,0.16)] bg-white ${
              tailRight ? "right-4" : "left-4"
            }`}
          />
        ) : null}
      </div>
    </button>
  );
}
