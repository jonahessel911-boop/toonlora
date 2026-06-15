"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CharacterRole, CharacterVisibility } from "@/types/creator";
import { STUDIO_CREDIT_COSTS, formatCreditCost } from "@/lib/creator/credits";

const ROLES: CharacterRole[] = [
  "main character",
  "love interest",
  "villain",
  "friend",
  "side character",
  "mentor",
];

const THEMES = [
  "romance",
  "fantasy",
  "anime",
  "drama",
  "comedy",
  "slice of life",
  "dark",
  "cozy",
];

interface CharacterCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    shortDescription: string;
    personality: string;
    visualDescription: string;
    outfit: string;
    colorPalette: string[];
    styleTheme: string;
    ageRange: string;
    role: CharacterRole;
    consistencyPrompt: string;
    visibility: CharacterVisibility;
    allowOthersToUse: boolean;
    attributionRequired: boolean;
  }) => void;
}

export default function CharacterCreateModal({
  open,
  onClose,
  onCreate,
}: CharacterCreateModalProps) {
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [personality, setPersonality] = useState("");
  const [visualDescription, setVisualDescription] = useState("");
  const [outfit, setOutfit] = useState("");
  const [palette, setPalette] = useState("#5340FF, #FF4FA3, #22D3EE");
  const [styleTheme, setStyleTheme] = useState("fantasy");
  const [ageRange, setAgeRange] = useState("18-24");
  const [role, setRole] = useState<CharacterRole>("main character");
  const [consistencyPrompt, setConsistencyPrompt] = useState("");
  const [visibility, setVisibility] = useState<CharacterVisibility>("private");
  const [allowOthers, setAllowOthers] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1200));
    onCreate({
      name,
      shortDescription,
      personality,
      visualDescription,
      outfit,
      colorPalette: palette.split(",").map((c) => c.trim()),
      styleTheme,
      ageRange,
      role,
      consistencyPrompt: consistencyPrompt || visualDescription,
      visibility,
      allowOthersToUse: visibility === "public" ? allowOthers : false,
      attributionRequired: true,
    });
    setGenerating(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#2A114B]/40 p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[32px] border border-[#E7D8FF] bg-white shadow-2xl"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-[#E7D8FF] px-6 py-5">
              <h2 className="font-heading text-xl font-extrabold text-[#2A114B]">
                Create character
              </h2>
              <p className="mt-1 text-sm text-[#667085]">
                Design a reusable AI character for your comics.{" "}
                {formatCreditCost(STUDIO_CREDIT_COSTS.generateCharacter)} to
                generate references.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-bold text-[#2A114B]">
                  Character name
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#E7D8FF] px-3 py-2.5 text-sm"
                  />
                </label>
                <label className="block text-xs font-bold text-[#2A114B]">
                  Age range
                  <input
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#E7D8FF] px-3 py-2.5 text-sm"
                  />
                </label>
              </div>

              <label className="block text-xs font-bold text-[#2A114B]">
                Short description
                <textarea
                  required
                  rows={2}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#E7D8FF] px-3 py-2.5 text-sm"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-bold text-[#2A114B]">
                  Role
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as CharacterRole)}
                    className="mt-1 w-full rounded-xl border border-[#E7D8FF] px-3 py-2.5 text-sm"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs font-bold text-[#2A114B]">
                  Theme
                  <select
                    value={styleTheme}
                    onChange={(e) => setStyleTheme(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#E7D8FF] px-3 py-2.5 text-sm"
                  >
                    {THEMES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block text-xs font-bold text-[#2A114B]">
                Personality
                <textarea
                  rows={2}
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#E7D8FF] px-3 py-2.5 text-sm"
                />
              </label>

              <label className="block text-xs font-bold text-[#2A114B]">
                Visual style / description
                <textarea
                  rows={2}
                  value={visualDescription}
                    onChange={(e) => setVisualDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#E7D8FF] px-3 py-2.5 text-sm"
                />
              </label>

              <label className="block text-xs font-bold text-[#2A114B]">
                Outfit
                <input
                  value={outfit}
                  onChange={(e) => setOutfit(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#E7D8FF] px-3 py-2.5 text-sm"
                />
              </label>

              <label className="block text-xs font-bold text-[#2A114B]">
                Color palette (comma-separated)
                <input
                  value={palette}
                  onChange={(e) => setPalette(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#E7D8FF] px-3 py-2.5 text-sm"
                />
              </label>

              <label className="block text-xs font-bold text-[#2A114B]">
                Consistency notes
                <textarea
                  rows={2}
                  value={consistencyPrompt}
                  onChange={(e) => setConsistencyPrompt(e.target.value)}
                  placeholder="Prompt hints to keep this character consistent across panels"
                  className="mt-1 w-full rounded-xl border border-[#E7D8FF] px-3 py-2.5 text-sm"
                />
              </label>

              <div className="rounded-2xl bg-[#F3ECFF] p-4">
                <p className="text-xs font-bold text-[#2A114B]">Visibility</p>
                <div className="mt-2 flex gap-3">
                  {(["private", "public"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVisibility(v)}
                      className={`rounded-xl px-4 py-2 text-xs font-bold capitalize ${
                        visibility === v
                          ? "bg-[#5340FF] text-white"
                          : "bg-white text-[#667085]"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                {visibility === "public" ? (
                  <label className="mt-3 flex items-center gap-2 text-xs text-[#667085]">
                    <input
                      type="checkbox"
                      checked={allowOthers}
                      onChange={(e) => setAllowOthers(e.target.checked)}
                    />
                    Allow other creators to use this character (attribution
                    required)
                  </label>
                ) : null}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-2xl border border-[#E7D8FF] py-3 text-sm font-bold text-[#667085]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="flex-1 rounded-2xl bg-[#FF6847] py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  {generating ? "Generating references…" : "Create character"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
