"use client";

import { forwardRef } from "react";
import CoverArt, { getCoverPreset } from "@/components/ui/CoverArt";
import type { ReaderPanelData } from "@/lib/readerPanels";

interface PanelBlockProps {
  panel: ReaderPanelData;
  panelIndex: number;
}

/** Extra scroll room so mobile browser chrome does not cover baked-in caption boxes. */
const PANEL_BOTTOM_SAFE_CLASS =
  "pb-[max(4.5rem,calc(env(safe-area-inset-bottom)+3rem))]";

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
      className={`relative w-full overflow-hidden ${PANEL_BOTTOM_SAFE_CLASS}`}
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
