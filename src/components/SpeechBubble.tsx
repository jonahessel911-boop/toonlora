import type { TextBubble } from "@/types/pipeline";
import ComicBubble from "@/components/reader/ComicBubble";
import { normalizePanelBubbles } from "@/lib/comicTextLayout";

interface SpeechBubbleProps {
  bubble: TextBubble;
  panelIndex?: number;
}

/** Single-bubble overlay — uses zone layout, not raw x/y coordinates. */
export default function SpeechBubble({
  bubble,
  panelIndex = 0,
}: SpeechBubbleProps) {
  const { speech } = normalizePanelBubbles([bubble], panelIndex);
  const item = speech[0] ?? bubble;
  const align =
    item.tail_direction === "bottom-right"
      ? "right"
      : item.tail_direction === "bottom-left"
        ? "left"
        : "center";

  return <ComicBubble bubble={item} align={align} />;
}
