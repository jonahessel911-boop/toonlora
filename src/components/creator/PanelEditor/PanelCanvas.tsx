"use client";

import type { StudioBubble, StudioPanel } from "@/types/creator";
import BubbleOverlay from "@/components/creator/PanelEditor/BubbleOverlay";

interface PanelCanvasProps {
  panel: StudioPanel;
  selectedBubbleId: string | null;
  getSpeakerName: (characterId?: string) => string | undefined;
  onSelectBubble: (id: string) => void;
  onCanvasClick: () => void;
}

export default function PanelCanvas({
  panel,
  selectedBubbleId,
  getSpeakerName,
  onSelectBubble,
  onCanvasClick,
}: PanelCanvasProps) {
  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div
        className={`relative aspect-[3/4] w-full overflow-hidden rounded-[24px] border border-[#E7D8FF] bg-gradient-to-br shadow-[0_12px_40px_rgba(83,64,255,0.12)] ${panel.gradient}`}
        onClick={onCanvasClick}
        role="presentation"
      >
        {panel.imageUrl ? (
          <img
            src={panel.imageUrl}
            alt={`Panel ${panel.order}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-end p-4">
            <p className="rounded-xl bg-black/30 px-3 py-2 text-xs text-white/90 backdrop-blur">
              {panel.prompt}
            </p>
          </div>
        )}

        {panel.overlays.map((bubble: StudioBubble) => (
          <BubbleOverlay
            key={bubble.id}
            bubble={bubble}
            selected={selectedBubbleId === bubble.id}
            speakerName={getSpeakerName(bubble.characterId)}
            onSelect={() => onSelectBubble(bubble.id)}
          />
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-[#667085]">
        Click a bubble to edit · App-rendered text overlays
      </p>
    </div>
  );
}
