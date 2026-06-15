"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCreatorStore } from "@/store/useCreatorStore";
import PanelList from "@/components/creator/PanelEditor/PanelList";
import PanelCanvas from "@/components/creator/PanelEditor/PanelCanvas";
import BubbleInspector from "@/components/creator/PanelEditor/BubbleInspector";
import type { BubbleType } from "@/types/creator";

interface PanelEditorProps {
  storyId: string;
}

export default function PanelEditor({ storyId }: PanelEditorProps) {
  const story = useCreatorStore((s) => s.getStory(storyId));
  const getCharacter = useCreatorStore((s) => s.getCharacter);
  const editorEpisodeId = useCreatorStore((s) => s.editorEpisodeId);
  const editorPanelId = useCreatorStore((s) => s.editorPanelId);
  const selectedBubbleId = useCreatorStore((s) => s.selectedBubbleId);
  const setEditorContext = useCreatorStore((s) => s.setEditorContext);
  const setSelectedBubble = useCreatorStore((s) => s.setSelectedBubble);
  const updatePanel = useCreatorStore((s) => s.updatePanel);
  const addBubble = useCreatorStore((s) => s.addBubble);
  const updateBubble = useCreatorStore((s) => s.updateBubble);
  const deleteBubble = useCreatorStore((s) => s.deleteBubble);

  const [inspectorTab, setInspectorTab] = useState<
    "bubble" | "panel" | "characters" | "ai"
  >("bubble");

  const episode = useMemo(
    () =>
      story?.episodes.find((e) => e.id === editorEpisodeId) ??
      story?.episodes[0],
    [story, editorEpisodeId]
  );

  const panel = useMemo(
    () =>
      episode?.panels.find((p) => p.id === editorPanelId) ??
      episode?.panels[0],
    [episode, editorPanelId]
  );

  const storyCharacters = useMemo(
    () =>
      (story?.characterIds ?? [])
        .map((id) => getCharacter(id))
        .filter(Boolean) as NonNullable<ReturnType<typeof getCharacter>>[],
    [story, getCharacter]
  );

  const selectedBubble = panel?.overlays.find(
    (b) => b.id === selectedBubbleId
  );

  if (!story || !episode || !panel) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-[#667085]">Story not found.</p>
        <Link href="/creator" className="ml-2 text-[#5340FF]">
          Back to studio
        </Link>
      </div>
    );
  }

  const epId = episode.id;
  const panelId = panel.id;

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <div className="hidden w-[200px] shrink-0 border-r border-[#E7D8FF] bg-white lg:block xl:w-[220px]">
        <PanelList
          panels={episode.panels}
          activePanelId={panelId}
          onSelect={(id) => setEditorContext(storyId, epId, id)}
          onDuplicate={() => {}}
          onDelete={() => {}}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#FCFAFF] p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <Link
              href="/creator"
              className="text-xs font-bold text-[#5340FF] hover:underline"
            >
              ← Studio
            </Link>
            <h1 className="font-heading text-lg font-extrabold text-[#2A114B]">
              {story.title} · {episode.title}
            </h1>
          </div>
          <span className="rounded-full bg-[#FFE033]/40 px-3 py-1 text-[10px] font-bold text-[#2A114B]">
            Panel {panel.order}
          </span>
        </div>

        <PanelCanvas
          panel={panel}
          selectedBubbleId={selectedBubbleId}
          getSpeakerName={(id) => (id ? getCharacter(id)?.name : undefined)}
          onSelectBubble={setSelectedBubble}
          onCanvasClick={() => setSelectedBubble(null)}
        />
      </div>

      <div className="w-full shrink-0 border-t border-[#E7D8FF] bg-white lg:w-[300px] lg:border-l lg:border-t-0 xl:w-[320px]">
        <BubbleInspector
          tab={inspectorTab}
          onTabChange={setInspectorTab}
          bubble={selectedBubble ?? null}
          panel={panel}
          storyCharacters={storyCharacters}
          onUpdateBubble={(patch) =>
            selectedBubble &&
            updateBubble(storyId, epId, panelId, selectedBubble.id, patch)
          }
          onDeleteBubble={() =>
            selectedBubble &&
            deleteBubble(storyId, epId, panelId, selectedBubble.id)
          }
          onAddBubble={(type: BubbleType) =>
            addBubble(storyId, epId, panelId, {
              type,
              text: type === "sfx" ? "WHOOSH" : "New line...",
              x: 12,
              y: 12,
              width: 45,
              tail: type === "speech" ? "bottom-left" : "none",
              style: "default",
              characterId: storyCharacters[0]?.id,
            })
          }
          onUpdatePanel={(patch) =>
            updatePanel(storyId, epId, panelId, patch)
          }
        />
      </div>
    </div>
  );
}
