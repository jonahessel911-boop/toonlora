"use client";

import type { StudioPanel } from "@/types/creator";

interface PanelListProps {
  panels: StudioPanel[];
  activePanelId: string | null;
  onSelect: (panelId: string) => void;
  onDuplicate: (panelId: string) => void;
  onDelete: (panelId: string) => void;
}

export default function PanelList({
  panels,
  activePanelId,
  onSelect,
  onDuplicate,
  onDelete,
}: PanelListProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#E7D8FF] px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">
          Panels
        </p>
        <p className="text-sm font-bold text-[#2A114B]">{panels.length} total</p>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {panels.map((panel) => (
          <div
            key={panel.id}
            className={`rounded-2xl border p-2 transition ${
              activePanelId === panel.id
                ? "border-[#5340FF] bg-[#F3ECFF]"
                : "border-[#E7D8FF] bg-white hover:border-[#5340FF]/50"
            }`}
          >
            <button
              type="button"
              onClick={() => onSelect(panel.id)}
              className="w-full text-left"
            >
              <div
                className={`aspect-[4/3] rounded-xl bg-gradient-to-br ${panel.gradient}`}
              />
              <p className="mt-2 text-xs font-bold text-[#2A114B]">
                Panel {panel.order}
              </p>
              <p className="text-[10px] capitalize text-[#667085]">
                {panel.status} · {panel.overlays.length} bubbles
              </p>
            </button>
            <div className="mt-2 flex gap-1">
              <button
                type="button"
                onClick={() => onDuplicate(panel.id)}
                className="flex-1 rounded-lg bg-[#F3ECFF] py-1 text-[10px] font-bold text-[#5340FF]"
              >
                Dup
              </button>
              <button
                type="button"
                onClick={() => onDelete(panel.id)}
                className="flex-1 rounded-lg bg-[#FFF0F0] py-1 text-[10px] font-bold text-[#A4262C]"
              >
                Del
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="m-3 rounded-2xl border border-dashed border-[#5340FF] py-3 text-xs font-bold text-[#5340FF]"
      >
        + Add panels with AI
      </button>
    </div>
  );
}
