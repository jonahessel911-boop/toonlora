"use client";

import { useCallback, useRef, useState } from "react";

interface CharacterPortraitViewerProps {
  src: string;
  alt: string;
  className?: string;
  compact?: boolean;
  overlayLabel?: string;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 5;

const CHECKERBOARD_STYLE = {
  backgroundColor: "#f0f0f0",
  backgroundImage: `
    linear-gradient(45deg, #d8d8d8 25%, transparent 25%),
    linear-gradient(-45deg, #d8d8d8 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #d8d8d8 75%),
    linear-gradient(-45deg, transparent 75%, #d8d8d8 75%)
  `,
  backgroundSize: "20px 20px",
  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
} as const;

export default function CharacterPortraitViewer({
  src,
  alt,
  className = "",
  compact = false,
  overlayLabel,
}: CharacterPortraitViewerProps) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const clampScale = (value: number) =>
    Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));

  const zoomBy = useCallback((delta: number) => {
    setScale((s) => clampScale(s + delta));
  }, []);

  const resetView = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      zoomBy(e.deltaY > 0 ? -0.12 : 0.12);
    },
    [zoomBy]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: offset.x,
      originY: offset.y,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    setOffset({
      x: drag.originX + (e.clientX - drag.startX),
      y: drag.originY + (e.clientY - drag.startY),
    });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const frameMinH = compact ? "min-h-[200px]" : "min-h-[280px] sm:min-h-[360px]";

  return (
    <div className={`relative flex flex-col ${className}`}>
      <div
        className={`relative flex-1 cursor-grab overflow-hidden rounded-2xl border border-[#E7D8FF] active:cursor-grabbing ${frameMinH}`}
        style={CHECKERBOARD_STYLE}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className={`flex h-full items-center justify-center ${frameMinH}`}>
          <img
            src={src}
            alt={alt}
            draggable={false}
            className="max-h-[min(52vh,320px)] max-w-full select-none object-contain transition-transform duration-75"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            }}
          />
        </div>
        {!overlayLabel ? (
          <p className="pointer-events-none absolute left-3 top-3 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-semibold text-[#667085]">
            Scroll to zoom · drag to pan
          </p>
        ) : null}
        {overlayLabel ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl bg-[#FCFAFF]/88 backdrop-blur-[2px]">
            <p className="font-heading text-lg font-extrabold text-[#2A114B]">
              {overlayLabel}
            </p>
          </div>
        ) : null}
      </div>

      <div className={`flex items-center justify-center gap-2 ${compact ? "mt-2" : "mt-3"}`}>
        <button
          type="button"
          onClick={() => zoomBy(-0.25)}
          className="rounded-xl border border-[#E7D8FF] bg-white px-3 py-2 text-sm font-bold text-[#5340FF]"
          aria-label="Zoom out"
        >
          −
        </button>
        <span className="min-w-[4rem] text-center text-xs font-bold text-[#667085]">
          {Math.round(scale * 100)}%
        </span>
        <button
          type="button"
          onClick={() => zoomBy(0.25)}
          className="rounded-xl border border-[#E7D8FF] bg-white px-3 py-2 text-sm font-bold text-[#5340FF]"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          onClick={resetView}
          className="rounded-xl border border-[#E7D8FF] bg-white px-3 py-2 text-xs font-bold text-[#667085]"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
