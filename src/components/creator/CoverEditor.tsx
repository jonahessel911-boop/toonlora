"use client";

import type { StudioStory } from "@/types/creator";
import { STUDIO_CREDIT_COSTS, formatCreditCost } from "@/lib/creator/credits";

interface CoverEditorProps {
  story: StudioStory;
  onUpdateGradient: (gradient: string) => void;
}

const GRADIENTS = [
  "from-[#5340FF] via-[#7C3AED] to-[#FF4FA3]",
  "from-[#22D3EE] via-[#5340FF] to-[#2A114B]",
  "from-[#FF6847] via-[#FF4FA3] to-[#5340FF]",
  "from-[#FFE033] via-[#FF6847] to-[#FBBF24]",
];

export default function CoverEditor({
  story,
  onUpdateGradient,
}: CoverEditorProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div
        className={`aspect-[3/4] rounded-[32px] bg-gradient-to-br shadow-[0_12px_40px_rgba(83,64,255,0.15)] ${story.coverGradient}`}
      >
        <div className="flex h-full flex-col justify-end p-6">
          <span className="w-fit rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#5340FF]">
            {story.genre}
          </span>
          <h3 className="mt-3 font-heading text-3xl font-extrabold text-white drop-shadow-lg">
            {story.title}
          </h3>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-heading text-lg font-extrabold text-[#2A114B]">
          Cover editor
        </h3>
        <button
          type="button"
          className="w-full rounded-2xl bg-[#5340FF] py-3 text-sm font-bold text-white"
        >
          Generate cover with AI ({formatCreditCost(STUDIO_CREDIT_COSTS.generateCover)})
        </button>
        <button
          type="button"
          className="w-full rounded-2xl border border-[#E7D8FF] py-3 text-sm font-bold text-[#5340FF]"
        >
          Upload cover
        </button>
        <div>
          <p className="text-xs font-bold text-[#667085]">Gradient presets</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {GRADIENTS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => onUpdateGradient(g)}
                className={`h-12 w-16 rounded-xl bg-gradient-to-br ${g} ring-2 ${
                  story.coverGradient === g
                    ? "ring-[#5340FF]"
                    : "ring-transparent"
                }`}
              />
            ))}
          </div>
        </div>
        <p className="text-xs text-[#667085]">
          Preview updates as a story card on your profile and the Toonlora
          homepage.
        </p>
      </div>
    </div>
  );
}
