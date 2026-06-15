import type { StudioBubble, StudioPanel } from "@/types/creator";
import type { CreatorPanelScript } from "@/lib/creator/studioPanelPrompt";

const GRADIENTS = [
  "from-[#5340FF] via-[#7C3AED] to-[#FF4FA3]",
  "from-[#22D3EE] via-[#5340FF] to-[#2A114B]",
  "from-[#FF6847] via-[#FF4FA3] to-[#5340FF]",
  "from-[#FFE033] via-[#FF6847] to-[#FBBF24]",
];

function bubble(
  panelId: string,
  partial: Omit<StudioBubble, "id" | "panelId"> & { id?: string }
): StudioBubble {
  return {
    id: partial.id ?? `bubble-${panelId}-${Math.random().toString(36).slice(2, 7)}`,
    panelId,
    type: partial.type,
    characterId: partial.characterId,
    text: partial.text,
    x: partial.x,
    y: partial.y,
    width: partial.width,
    tail: partial.tail,
    style: partial.style,
  };
}

export function scriptToStudioPanel(params: {
  episodeId: string;
  panelId: string;
  script: CreatorPanelScript;
  characterIds: string[];
  characterNameToId: Map<string, string>;
  imageUrl?: string;
  order: number;
}): StudioPanel {
  const { script, panelId, characterIds, characterNameToId } = params;
  const overlays: StudioBubble[] = [];

  if (script.suggested_narration?.trim()) {
    overlays.push(
      bubble(panelId, {
        type: "narration",
        text: script.suggested_narration.trim(),
        x: 10,
        y: 8,
        width: 80,
        tail: "none",
        style: "default",
      })
    );
  }

  if (script.suggested_dialogue?.trim()) {
    const speakerId = script.speaker
      ? characterNameToId.get(script.speaker.toLowerCase())
      : characterIds[0];
    overlays.push(
      bubble(panelId, {
        type: "speech",
        text: script.suggested_dialogue.trim(),
        characterId: speakerId,
        x: 12,
        y: 55,
        width: 55,
        tail: "bottom-left",
        style: "default",
      })
    );
  }

  return {
    id: panelId,
    episodeId: params.episodeId,
    imageUrl: params.imageUrl,
    gradient: GRADIENTS[(params.order - 1) % GRADIENTS.length],
    prompt: script.visual,
    characterIds,
    overlays,
    order: params.order,
    status: params.imageUrl ? "ready" : "generating",
  };
}

export { GRADIENTS as STUDIO_PANEL_GRADIENTS };
