"use client";

import type { StudioPanel } from "@/types/creator";

interface PanelListProps {
  panels: StudioPanel[];
  activePanelId: string | null;
  loading?: boolean;
  onSelect: (panelId: string) => void;
  onDuplicate: (panelId: string) => void;
  onDelete: (panelId: string) => void;
  onAddPanel: () => void;
}

export default function PanelList({
  panels,
  activePanelId,
  loading,
  onSelect,
  onDuplicate,
  onDelete,
  onAddPanel,
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
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                {panel.imageUrl ? (
                  <img
                    src={panel.imageUrl}
                    alt={`Panel ${panel.order}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className={`h-full w-full bg-gradient-to-br ${panel.gradient}`}
                  />
                )}
                {panel.status === "generating" ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  </div>
                ) : null}
              </div>
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
                disabled={panels.length <= 1}
                onClick={() => onDelete(panel.id)}
                className="flex-1 rounded-lg bg-[#FFF0F0] py-1 text-[10px] font-bold text-[#A4262C] disabled:opacity-40"
              >
                Del
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        disabled={loading}
        onClick={onAddPanel}
        className="m-3 rounded-2xl border border-dashed border-[#5340FF] py-3 text-xs font-bold text-[#5340FF] disabled:opacity-50"
      >
        {loading ? "Generating…" : "+ Add panel with AI"}
      </button>
    </div>
  );
}
