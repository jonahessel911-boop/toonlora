"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CharacterPortraitViewer from "@/components/creator/CharacterPortraitViewer";
import CharacterReferenceUpload from "@/components/creator/CharacterReferenceUpload";
import type { CharacterGender } from "@/lib/creator/characterAppearance";
import { defaultAppearance } from "@/lib/creator/characterAppearance";
import { buildCharacterPortraitPrompt } from "@/lib/creator/characterImagePrompt";
import type { CharacterRole, CharacterVisibility } from "@/types/creator";
import { STUDIO_CREDIT_COSTS, formatCreditCost } from "@/lib/creator/credits";

const STEPS = ["Describe", "Generate portrait", "Save"] as const;

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
    gender: CharacterGender;
    appearance: ReturnType<typeof defaultAppearance>;
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
    referenceImages: string[];
    portraitUrl: string;
  }) => void;
}

export default function CharacterCreateModal({
  open,
  onClose,
  onCreate,
}: CharacterCreateModalProps) {
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState<CharacterGender>("woman");
  const [name, setName] = useState("");
  const [lookDescription, setLookDescription] = useState("");
  const [outfitDescription, setOutfitDescription] = useState("");
  const [personality, setPersonality] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [styleTheme, setStyleTheme] = useState("fantasy");
  const [ageRange, setAgeRange] = useState("18-24");
  const [role, setRole] = useState<CharacterRole>("main character");
  const [visibility, setVisibility] = useState<CharacterVisibility>("private");
  const [allowOthers, setAllowOthers] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState("");
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [draftCharacterId] = useState(() => `char-${Date.now()}`);

  const autoPrompt = useMemo(
    () =>
      buildCharacterPortraitPrompt({
        name: name.trim() || "Character",
        gender,
        role,
        styleTheme,
        ageRange,
        lookDescription: lookDescription.trim() || "Expressive webtoon character with distinctive features.",
        outfitDescription:
          outfitDescription.trim() || "Stylish outfit matching the story theme.",
        personality:
          personality.trim() || "Warm, approachable expression with confident posture.",
        hasReferenceImage: referenceImages.length > 0,
      }),
    [
      name,
      gender,
      role,
      styleTheme,
      ageRange,
      lookDescription,
      outfitDescription,
      personality,
      referenceImages.length,
    ]
  );

  useEffect(() => {
    if (step === 1 && !imagePrompt) {
      setImagePrompt(autoPrompt);
    }
  }, [step, autoPrompt, imagePrompt]);

  const reset = useCallback(() => {
    setStep(0);
    setGender("woman");
    setName("");
    setLookDescription("");
    setOutfitDescription("");
    setPersonality("");
    setShortDescription("");
    setPortraitUrl(null);
    setImagePrompt("");
    setGenerateError(null);
    setReferenceImages([]);
  }, []);

  const handleGenderChange = (g: CharacterGender) => {
    setGender(g);
    setPortraitUrl(null);
    setImagePrompt("");
  };

  const handleGeneratePortrait = async () => {
    setGenerating(true);
    setGenerateError(null);
    try {
      const res = await fetch("/api/creator/character-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: draftCharacterId,
          prompt: imagePrompt || autoPrompt,
          name: name.trim(),
          gender,
          role,
          styleTheme,
          ageRange,
          lookDescription,
          outfitDescription,
          personality,
          hasReferenceImage: referenceImages.length > 0,
        }),
      });
      const data = (await res.json()) as {
        portraitUrl?: string;
        error?: string;
        prompt?: string;
      };
      if (!res.ok || !data.portraitUrl) {
        throw new Error(data.error ?? "Portrait generation failed");
      }
      setPortraitUrl(data.portraitUrl);
      if (data.prompt) setImagePrompt(data.prompt);
    } catch (err) {
      setGenerateError(
        err instanceof Error ? err.message : "Portrait generation failed"
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = () => {
    if (!portraitUrl) return;
    const appearance = defaultAppearance(gender);
    onCreate({
      name,
      gender,
      appearance,
      shortDescription:
        shortDescription ||
        `${lookDescription.slice(0, 80)}`.trim() ||
        name,
      personality,
      visualDescription: lookDescription,
      outfit: outfitDescription,
      colorPalette: [
        appearance.topColor,
        appearance.bottomColor,
        appearance.accentColor,
      ],
      styleTheme,
      ageRange,
      role,
      consistencyPrompt: imagePrompt || autoPrompt,
      visibility,
      allowOthersToUse: visibility === "public" ? allowOthers : false,
      attributionRequired: true,
      referenceImages,
      portraitUrl,
    });
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const canContinueDescribe =
    name.trim() &&
    lookDescription.trim() &&
    outfitDescription.trim() &&
    personality.trim();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#2A114B]/50 p-0 sm:items-stretch sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="flex max-h-[100dvh] w-full max-w-6xl flex-col overflow-hidden rounded-t-[32px] border border-[#E7D8FF] bg-[#FCFAFF] shadow-2xl sm:my-auto sm:max-h-[92vh] sm:rounded-[32px]"
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 48, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E7D8FF] bg-white px-5 py-4 sm:px-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#5340FF]">
                  Character studio
                </p>
                <h2 className="font-heading text-xl font-extrabold text-[#2A114B]">
                  Create character
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl p-2 text-[#667085] hover:bg-[#F3ECFF]"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-2 border-b border-[#E7D8FF] bg-white px-5 py-3 sm:px-6">
              {STEPS.map((label, i) => (
                <div
                  key={label}
                  className={`flex flex-1 items-center gap-2 rounded-xl px-2 py-1.5 text-[10px] font-bold sm:text-xs ${
                    step === i
                      ? "bg-[#5340FF] text-white"
                      : i < step
                        ? "bg-[#E9D8FD] text-[#5340FF]"
                        : "text-[#667085]"
                  }`}
                >
                  <span className="hidden sm:inline">{i + 1}.</span> {label}
                </div>
              ))}
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
              {step >= 1 ? (
                <div className="relative flex shrink-0 flex-col border-b border-[#E7D8FF] bg-gradient-to-b from-[#F3ECFF] to-white p-4 lg:w-[44%] lg:border-b-0 lg:border-r">
                  {generating ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
                      <div className="h-14 w-14 animate-spin rounded-full border-4 border-[#E7D8FF] border-t-[#5340FF]" />
                      <p className="font-heading text-lg font-extrabold text-[#2A114B]">
                        Painting your character…
                      </p>
                      <p className="max-w-xs text-center text-sm text-[#667085]">
                        Full body, three-quarter pose, transparent background
                      </p>
                    </div>
                  ) : portraitUrl ? (
                    <CharacterPortraitViewer
                      src={portraitUrl}
                      alt={name || "Character portrait"}
                      className="h-full"
                    />
                  ) : (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#E7D8FF] bg-white/60 p-8 text-center">
                      <p className="text-4xl">🎨</p>
                      <p className="font-heading text-base font-extrabold text-[#2A114B]">
                        Portrait preview
                      </p>
                      <p className="text-sm text-[#667085]">
                        Your character will stand half schuin to the camera with a
                        transparent cutout background — zoom in to inspect details.
                      </p>
                    </div>
                  )}
                </div>
              ) : null}

              <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
                {step === 0 && (
                  <div className="mx-auto max-w-lg space-y-5">
                    <div className="rounded-2xl bg-[#F3ECFF] p-4 text-sm text-[#2A114B]">
                      <p className="font-bold">How your portrait will look</p>
                      <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-[#667085]">
                        <li>Full-body character standing in a relaxed pose</li>
                        <li>Three-quarter angle — body turned, face toward you</li>
                        <li>Transparent background (PNG cutout asset)</li>
                        <li>Webtoon / cartoon style matching your theme</li>
                      </ul>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-[#2A114B]">
                        Character gender
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        {(
                          [
                            { id: "woman" as const, label: "Woman", icon: "♀" },
                            { id: "man" as const, label: "Man", icon: "♂" },
                          ] as const
                        ).map((g) => (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => handleGenderChange(g.id)}
                            className={`rounded-2xl border-2 px-4 py-5 text-center transition ${
                              gender === g.id
                                ? "border-[#5340FF] bg-[#F3ECFF] shadow-[0_4px_14px_rgba(83,64,255,0.2)]"
                                : "border-[#E7D8FF] bg-white hover:border-[#5340FF]/40"
                            }`}
                          >
                            <span className="text-2xl">{g.icon}</span>
                            <p className="mt-1 font-heading text-base font-extrabold text-[#2A114B]">
                              {g.label}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

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
                      Face, hair & body
                      <textarea
                        required
                        rows={3}
                        value={lookDescription}
                        onChange={(e) => setLookDescription(e.target.value)}
                        placeholder="e.g. Tall woman with wavy auburn hair, green eyes, light freckles, athletic build, warm smile…"
                        className="mt-1 w-full rounded-xl border border-[#E7D8FF] px-3 py-2.5 text-sm"
                      />
                    </label>

                    <label className="block text-xs font-bold text-[#2A114B]">
                      Outfit & accessories
                      <textarea
                        required
                        rows={3}
                        value={outfitDescription}
                        onChange={(e) => setOutfitDescription(e.target.value)}
                        placeholder="e.g. Cropped leather jacket, white tee, high-waist jeans, silver pendant, combat boots…"
                        className="mt-1 w-full rounded-xl border border-[#E7D8FF] px-3 py-2.5 text-sm"
                      />
                    </label>

                    <label className="block text-xs font-bold text-[#2A114B]">
                      Personality & expression
                      <textarea
                        required
                        rows={2}
                        value={personality}
                        onChange={(e) => setPersonality(e.target.value)}
                        placeholder="e.g. Confident but kind, playful smirk, relaxed shoulders…"
                        className="mt-1 w-full rounded-xl border border-[#E7D8FF] px-3 py-2.5 text-sm"
                      />
                    </label>

                    <CharacterReferenceUpload
                      images={referenceImages}
                      onChange={setReferenceImages}
                      maxImages={3}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block text-xs font-bold text-[#2A114B]">
                        Role
                        <select
                          value={role}
                          onChange={(e) =>
                            setRole(e.target.value as CharacterRole)
                          }
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
                        Art theme
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
                      Age range
                      <input
                        value={ageRange}
                        onChange={(e) => setAgeRange(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[#E7D8FF] px-3 py-2.5 text-sm"
                      />
                    </label>
                  </div>
                )}

                {step === 1 && (
                  <div className="mx-auto max-w-lg space-y-4">
                    <div>
                      <h3 className="font-heading text-xl font-extrabold text-[#2A114B]">
                        AI image prompt
                      </h3>
                      <p className="mt-1 text-sm text-[#667085]">
                        Review or tweak the full description before generating.{" "}
                        {formatCreditCost(STUDIO_CREDIT_COSTS.generateCharacter)}
                      </p>
                    </div>

                    <textarea
                      rows={14}
                      value={imagePrompt || autoPrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      className="w-full rounded-2xl border border-[#E7D8FF] bg-white px-3 py-3 font-mono text-xs leading-relaxed text-[#2A114B]"
                    />

                    {generateError ? (
                      <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                        {generateError}
                      </p>
                    ) : null}

                    {portraitUrl ? (
                      <p className="rounded-xl bg-[#E9F7E9] px-3 py-2 text-sm font-semibold text-[#107C10]">
                        ✓ Portrait ready — zoom the preview, then continue to save
                      </p>
                    ) : null}
                  </div>
                )}

                {step === 2 && (
                  <div className="mx-auto max-w-lg space-y-4">
                    <label className="block text-xs font-bold text-[#2A114B]">
                      Short description
                      <textarea
                        rows={2}
                        value={shortDescription}
                        onChange={(e) => setShortDescription(e.target.value)}
                        placeholder={lookDescription.slice(0, 80)}
                        className="mt-1 w-full rounded-xl border border-[#E7D8FF] px-3 py-2.5 text-sm"
                      />
                    </label>

                    <div className="rounded-2xl bg-[#F3ECFF] p-4">
                      <p className="text-xs font-bold text-[#2A114B]">
                        Visibility
                      </p>
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
                          Allow others to use this character
                        </label>
                      ) : null}
                    </div>

                    <div className="rounded-2xl border border-[#E7D8FF] bg-white p-4 text-xs text-[#667085]">
                      <p className="font-bold text-[#2A114B]">Saved as</p>
                      <p className="mt-2">
                        AI portrait image with transparent background — used on
                        character cards and in your story bible.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 border-t border-[#E7D8FF] bg-white px-5 py-4 sm:px-6">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="rounded-2xl border border-[#E7D8FF] px-5 py-3 text-sm font-bold text-[#667085]"
                >
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-2xl border border-[#E7D8FF] px-5 py-3 text-sm font-bold text-[#667085]"
                >
                  Cancel
                </button>
              )}

              {step === 0 && (
                <button
                  type="button"
                  disabled={!canContinueDescribe}
                  onClick={() => {
                    setImagePrompt(autoPrompt);
                    setStep(1);
                  }}
                  className="ml-auto rounded-2xl bg-[#5340FF] px-6 py-3 text-sm font-bold text-white disabled:opacity-40"
                >
                  Continue to generate
                </button>
              )}

              {step === 1 && (
                <div className="ml-auto flex gap-2">
                  {portraitUrl ? (
                    <>
                      <button
                        type="button"
                        disabled={generating}
                        onClick={() => {
                          setPortraitUrl(null);
                          void handleGeneratePortrait();
                        }}
                        className="rounded-2xl border border-[#E7D8FF] px-5 py-3 text-sm font-bold text-[#5340FF] disabled:opacity-60"
                      >
                        Regenerate
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="rounded-2xl bg-[#5340FF] px-6 py-3 text-sm font-bold text-white"
                      >
                        Continue
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      disabled={generating}
                      onClick={() => void handleGeneratePortrait()}
                      className="rounded-2xl bg-[#FF6847] px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
                    >
                      {generating
                        ? "Generating…"
                        : `Generate portrait (${formatCreditCost(STUDIO_CREDIT_COSTS.generateCharacter)})`}
                    </button>
                  )}
                </div>
              )}

              {step === 2 && (
                <button
                  type="button"
                  disabled={!portraitUrl || !name.trim()}
                  onClick={handleSave}
                  className="ml-auto rounded-2xl bg-[#FF6847] px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  Save character
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
