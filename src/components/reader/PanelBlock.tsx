"use client";

import { forwardRef } from "react";
import CoverArt, { getCoverPreset } from "@/components/ui/CoverArt";
import type { ReaderPanelData } from "@/lib/readerPanels";

interface PanelBlockProps {
  panel: ReaderPanelData;
  panelIndex: number;
}

const PanelBlock = forwardRef<HTMLElement, PanelBlockProps>(function PanelBlock(
  { panel, panelIndex },
  ref
) {
  const preset = getCoverPreset(panel.genre ?? "Fantasy");
  const seed = panel.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

  return (
    <article
      ref={ref}
      id={`panel-${panelIndex}`}
      className="relative w-full overflow-hidden"
    >
      {panel.imageUrl ? (
        <img
          src={panel.imageUrl}
          alt={`Panel ${panel.panelNumber}`}
          className="block h-auto w-full"
          draggable={false}
        />
      ) : (
        <div className="relative min-h-[55vh] w-full sm:min-h-[420px]">
          <CoverArt
            gradient={panel.gradient}
            genre={panel.genre ?? "Story"}
            showOverlay
            seed={seed}
            className="h-full min-h-[55vh] w-full sm:min-h-[420px]"
          />
        </div>
      )}

    </article>
  );
});

export default PanelBlock;
