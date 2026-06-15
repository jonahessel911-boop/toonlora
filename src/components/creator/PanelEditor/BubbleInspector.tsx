"use client";

import type { StudioBubble, StudioCharacter, StudioPanel } from "@/types/creator";
import type { BubbleTail, BubbleType } from "@/types/creator";
import { STUDIO_CREDIT_COSTS, formatCreditCost } from "@/lib/creator/credits";

type InspectorTab = "bubble" | "panel" | "characters" | "ai";

interface BubbleInspectorProps {
  tab: InspectorTab;
  onTabChange: (tab: InspectorTab) => void;
  bubble: StudioBubble | null;
  panel: StudioPanel | null;
  storyCharacters: StudioCharacter[];
  onUpdateBubble: (patch: Partial<StudioBubble>) => void;
  onDeleteBubble: () => void;
  onAddBubble: (type: BubbleType) => void;
  onUpdatePanel: (patch: Partial<StudioPanel>) => void;
}

export default function BubbleInspector({
  tab,
  onTabChange,
  bubble,
  panel,
  storyCharacters,
  onUpdateBubble,
  onDeleteBubble,
  onAddBubble,
  onUpdatePanel,
}: BubbleInspectorProps) {
  const tabs: { id: InspectorTab; label: string }[] = [
    { id: "bubble", label: "Bubble" },
    { id: "panel", label: "Panel" },
    { id: "characters", label: "Characters" },
    { id: "ai", label: "AI tools" },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex gap-1 border-b border-[#E7D8FF] p-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onTabChange(t.id)}
            className={`flex-1 rounded-xl py-2 text-[10px] font-bold ${
              tab === t.id
                ? "bg-[#5340FF] text-white"
                : "text-[#667085] hover:bg-[#F3ECFF]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === "bubble" ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(
                ["speech", "thought", "narration", "sfx"] as BubbleType[]
              ).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => onAddBubble(type)}
                  className="rounded-xl bg-[#F3ECFF] px-3 py-1.5 text-[10px] font-bold capitalize text-[#5340FF]"
                >
                  + {type}
                </button>
              ))}
            </div>

            {bubble ? (
              <>
                <label className="block text-xs font-bold text-[#2A114B]">
                  Text
                  <textarea
                    rows={3}
                    value={bubble.text}
                    onChange={(e) =>
                      onUpdateBubble({ text: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-[#E7D8FF] px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-xs font-bold text-[#2A114B]">
                  Type
                  <select
                    value={bubble.type}
                    onChange={(e) =>
                      onUpdateBubble({
                        type: e.target.value as BubbleType,
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-[#E7D8FF] px-3 py-2 text-sm"
                  >
                    <option value="speech">Speech</option>
                    <option value="thought">Thought</option>
                    <option value="narration">Narration</option>
                    <option value="sfx">SFX</option>
                  </select>
                </label>
                <label className="block text-xs font-bold text-[#2A114B]">
                  Speaker
                  <select
                    value={bubble.characterId ?? ""}
                    onChange={(e) =>
                      onUpdateBubble({
                        characterId: e.target.value || undefined,
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-[#E7D8FF] px-3 py-2 text-sm"
                  >
                    <option value="">None</option>
                    {storyCharacters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs font-bold text-[#2A114B]">
                  Tail
                  <select
                    value={bubble.tail}
                    onChange={(e) =>
                      onUpdateBubble({ tail: e.target.value as BubbleTail })
                    }
                    className="mt-1 w-full rounded-xl border border-[#E7D8FF] px-3 py-2 text-sm"
                  >
                    <option value="bottom-left">Bottom left</option>
                    <option value="bottom-right">Bottom right</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                    <option value="none">None</option>
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="block text-xs font-bold text-[#2A114B]">
                    X %
                    <input
                      type="number"
                      value={bubble.x}
                      onChange={(e) =>
                        onUpdateBubble({ x: Number(e.target.value) })
                      }
                      className="mt-1 w-full rounded-xl border border-[#E7D8FF] px-2 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-xs font-bold text-[#2A114B]">
                    Y %
                    <input
                      type="number"
                      value={bubble.y}
                      onChange={(e) =>
                        onUpdateBubble({ y: Number(e.target.value) })
                      }
                      className="mt-1 w-full rounded-xl border border-[#E7D8FF] px-2 py-2 text-sm"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={onDeleteBubble}
                  className="w-full rounded-xl border border-[#FECACA] py-2 text-xs font-bold text-[#A4262C]"
                >
                  Delete bubble
                </button>
              </>
            ) : (
              <p className="text-sm text-[#667085]">
                Select a bubble on the canvas or add a new one.
              </p>
            )}
          </div>
        ) : null}

        {tab === "panel" && panel ? (
          <div className="space-y-4">
            <label className="block text-xs font-bold text-[#2A114B]">
              Panel prompt
              <textarea
                rows={4}
                value={panel.prompt}
                onChange={(e) => onUpdatePanel({ prompt: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#E7D8FF] px-3 py-2 text-sm"
              />
            </label>
            <button
              type="button"
              className="w-full rounded-xl bg-[#5340FF] py-2.5 text-xs font-bold text-white"
            >
              Regenerate panel ({formatCreditCost(STUDIO_CREDIT_COSTS.regeneratePanel)})
            </button>
            <button
              type="button"
              className="w-full rounded-xl border border-[#E7D8FF] py-2.5 text-xs font-bold text-[#5340FF]"
            >
              Improve lighting
            </button>
            <button
              type="button"
              className="w-full rounded-xl border border-[#E7D8FF] py-2.5 text-xs font-bold text-[#5340FF]"
            >
              Make more emotional
            </button>
          </div>
        ) : null}

        {tab === "characters" ? (
          <div className="space-y-3">
            {storyCharacters.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-[#E7D8FF] p-3"
              >
                <p className="font-bold text-[#2A114B]">{c.name}</p>
                <p className="mt-1 text-[10px] text-[#667085]">
                  {c.consistencyPrompt}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        {tab === "ai" ? (
          <div className="space-y-2">
            {[
              "Add more panels",
              "Rewrite dialogue",
              "Make scene more dramatic",
              "Generate alternate ending",
              "Improve panel composition",
              "Regenerate art only",
              "Keep same characters",
            ].map((label) => (
              <button
                key={label}
                type="button"
                className="w-full rounded-xl border border-[#E7D8FF] px-3 py-2.5 text-left text-xs font-bold text-[#2A114B] hover:bg-[#F3ECFF]"
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
