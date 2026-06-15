"use client";

import { useState } from "react";
import type { CharacterAppearance } from "@/lib/creator/characterAppearance";
import {
  ACCESSORY_OPTIONS,
  BOTTOM_OPTIONS,
  EYE_OPTIONS,
  FACE_OPTIONS,
  HAIR_COLORS,
  HAIR_OPTIONS,
  SHOES_OPTIONS,
  SKIN_TONES,
  TOP_OPTIONS,
  mockAiApplyPrompt,
  mockAiRandomizePart,
} from "@/lib/creator/characterStyleOptions";
import { STUDIO_CREDIT_COSTS, formatCreditCost } from "@/lib/creator/credits";

type StyleTab = "face" | "hair" | "outfit" | "colors" | "ai";

interface CharacterStylePanelProps {
  appearance: CharacterAppearance;
  onChange: (next: CharacterAppearance) => void;
}

export default function CharacterStylePanel({
  appearance,
  onChange,
}: CharacterStylePanelProps) {
  const [tab, setTab] = useState<StyleTab>("outfit");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  const runAi = async (
    label: string,
    fn: () => CharacterAppearance
  ) => {
    setAiLoading(label);
    await new Promise((r) => setTimeout(r, 900));
    onChange(fn());
    setAiLoading(null);
  };

  const tabs: { id: StyleTab; label: string }[] = [
    { id: "face", label: "Face" },
    { id: "hair", label: "Hair" },
    { id: "outfit", label: "Outfit" },
    { id: "colors", label: "Colors" },
    { id: "ai", label: "AI" },
  ];

  const OptionGrid = ({
    options,
    selected,
    onSelect,
  }: {
    options: { id: string; label: string }[];
    selected: string;
    onSelect: (id: string) => void;
  }) => (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onSelect(opt.id)}
          className={`rounded-xl border px-2 py-2.5 text-xs font-bold transition ${
            selected === opt.id
              ? "border-[#5340FF] bg-[#F3ECFF] text-[#5340FF]"
              : "border-[#E7D8FF] text-[#667085] hover:border-[#5340FF]/40"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex gap-1 border-b border-[#E7D8FF] p-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-xl py-2 text-[10px] font-bold sm:text-xs ${
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
        {tab === "face" && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-[#2A114B]">Face style</p>
            <OptionGrid
              options={FACE_OPTIONS}
              selected={appearance.faceId}
              onSelect={(faceId) => onChange({ ...appearance, faceId })}
            />
            <p className="text-xs font-bold text-[#2A114B]">Eyes</p>
            <OptionGrid
              options={EYE_OPTIONS}
              selected={appearance.eyeId}
              onSelect={(eyeId) => onChange({ ...appearance, eyeId })}
            />
            <p className="text-xs font-bold text-[#2A114B]">Skin tone</p>
            <div className="flex flex-wrap gap-2">
              {SKIN_TONES.map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => onChange({ ...appearance, skinTone: tone })}
                  className={`h-9 w-9 rounded-full ring-2 ${
                    appearance.skinTone === tone
                      ? "ring-[#5340FF]"
                      : "ring-transparent"
                  }`}
                  style={{ background: tone }}
                />
              ))}
            </div>
            <button
              type="button"
              disabled={!!aiLoading}
              onClick={() =>
                void runAi("face", () => mockAiRandomizePart(appearance, "face"))
              }
              className="w-full rounded-xl bg-[#5340FF] py-2.5 text-xs font-bold text-white disabled:opacity-60"
            >
              {aiLoading === "face"
                ? "AI reshaping face…"
                : `AI new face (${formatCreditCost(2)})`}
            </button>
          </div>
        )}

        {tab === "hair" && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-[#2A114B]">Hairstyle</p>
            <OptionGrid
              options={HAIR_OPTIONS}
              selected={appearance.hairId}
              onSelect={(hairId) => onChange({ ...appearance, hairId })}
            />
            <p className="text-xs font-bold text-[#2A114B]">Hair color</p>
            <div className="flex flex-wrap gap-2">
              {HAIR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChange({ ...appearance, hairColor: c })}
                  className={`h-8 w-8 rounded-full ring-2 ${
                    appearance.hairColor === c
                      ? "ring-[#5340FF]"
                      : "ring-transparent"
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
            <button
              type="button"
              disabled={!!aiLoading}
              onClick={() =>
                void runAi("hair", () => mockAiRandomizePart(appearance, "hair"))
              }
              className="w-full rounded-xl bg-[#5340FF] py-2.5 text-xs font-bold text-white disabled:opacity-60"
            >
              {aiLoading === "hair" ? "AI styling hair…" : "AI new hairstyle"}
            </button>
          </div>
        )}

        {tab === "outfit" && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-[#2A114B]">Top</p>
            <OptionGrid
              options={TOP_OPTIONS}
              selected={appearance.topId}
              onSelect={(topId) => onChange({ ...appearance, topId })}
            />
            <p className="text-xs font-bold text-[#2A114B]">Bottom</p>
            <OptionGrid
              options={BOTTOM_OPTIONS}
              selected={appearance.bottomId}
              onSelect={(bottomId) => onChange({ ...appearance, bottomId })}
            />
            <p className="text-xs font-bold text-[#2A114B]">Shoes</p>
            <OptionGrid
              options={SHOES_OPTIONS}
              selected={appearance.shoesId}
              onSelect={(shoesId) => onChange({ ...appearance, shoesId })}
            />
            <p className="text-xs font-bold text-[#2A114B]">Accessory</p>
            <OptionGrid
              options={ACCESSORY_OPTIONS}
              selected={appearance.accessoryId}
              onSelect={(accessoryId) =>
                onChange({ ...appearance, accessoryId })
              }
            />
            <button
              type="button"
              disabled={!!aiLoading}
              onClick={() =>
                void runAi("outfit", () =>
                  mockAiRandomizePart(appearance, "outfit")
                )
              }
              className="w-full rounded-xl bg-[#FF6847] py-2.5 text-xs font-bold text-white disabled:opacity-60"
            >
              {aiLoading === "outfit"
                ? "AI dressing character…"
                : `AI new outfit (${formatCreditCost(3)})`}
            </button>
          </div>
        )}

        {tab === "colors" && (
          <div className="space-y-4">
            {(
              [
                ["topColor", "Top color"],
                ["bottomColor", "Bottom color"],
                ["shoesColor", "Shoe color"],
                ["accentColor", "Accent"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <p className="text-xs font-bold text-[#2A114B]">{label}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {HAIR_COLORS.map((c) => (
                    <button
                      key={`${key}-${c}`}
                      type="button"
                      onClick={() => onChange({ ...appearance, [key]: c })}
                      className={`h-8 w-8 rounded-full ring-2 ${
                        appearance[key] === c
                          ? "ring-[#5340FF]"
                          : "ring-transparent"
                      }`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "ai" && (
          <div className="space-y-4">
            <p className="text-sm text-[#667085]">
              Describe how you want to change this character. AI updates face,
              outfit, and colors together.
            </p>
            <textarea
              rows={4}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. fantasy mage with purple robes and silver hair"
              className="w-full rounded-xl border border-[#E7D8FF] px-3 py-2.5 text-sm"
            />
            <button
              type="button"
              disabled={!aiPrompt.trim() || !!aiLoading}
              onClick={() =>
                void runAi("full", () =>
                  mockAiApplyPrompt(appearance, aiPrompt)
                )
              }
              className="w-full rounded-xl bg-[#5340FF] py-3 text-sm font-bold text-white disabled:opacity-40"
            >
              {aiLoading === "full"
                ? "Applying AI style…"
                : `Apply AI style (${formatCreditCost(STUDIO_CREDIT_COSTS.generateCharacter)})`}
            </button>
            <button
              type="button"
              disabled={!!aiLoading}
              onClick={() =>
                void runAi("full", () =>
                  mockAiRandomizePart(appearance, "full")
                )
              }
              className="w-full rounded-xl border border-[#E7D8FF] py-2.5 text-xs font-bold text-[#5340FF]"
            >
              Surprise me — random full look
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
