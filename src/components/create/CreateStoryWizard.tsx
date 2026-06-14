"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import GenerationLoading from "@/components/create/GenerationLoading";
import PricingModal from "@/components/PricingModal";
import { apiFetch } from "@/lib/session";
import { isDatabaseEnabled } from "@/lib/config";
import { useStoryStore } from "@/store/useStoryStore";
import { useCreditsStore } from "@/store/useCreditsStore";
import type { SeriesInput } from "@/types/pipeline";
import type { Story } from "@/types/story";

const GENRES = [
  { id: "Romance", icon: "💕" },
  { id: "Anime", icon: "🌸" },
  { id: "Fantasy", icon: "🧙" },
  { id: "Comedy", icon: "😂" },
  { id: "Drama", icon: "🎭" },
  { id: "Adventure", icon: "⚔️" },
  { id: "Slice of Life", icon: "☕" },
];

const STYLES = [
  { id: "Cartoon", icon: "🐱" },
  { id: "Webtoon", icon: "📱" },
  { id: "Cute", icon: "🎀" },
  { id: "Cinematic", icon: "🎬" },
  { id: "Funny", icon: "😂" },
  { id: "Dreamy", icon: "🌙" },
];

const LENGTHS = [
  { id: "Short" as const, label: "Short", sub: "~1 min" },
  { id: "Normal" as const, label: "Medium", sub: "~3 min" },
  { id: "Long" as const, label: "Long", sub: "~5-7 min" },
];

const STEPS = ["Genre", "Style", "Story", "Characters", "Length"];

export default function CreateStoryWizard() {
  const router = useRouter();
  const addStory = useStoryStore((s) => s.addStory);
  const { freeUsed, credits, canGenerate, consumeGeneration, hydrate } =
    useCreditsStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);

  const [genre, setGenre] = useState("Fantasy");
  const [style, setStyle] = useState("Webtoon");
  const [storyIdea, setStoryIdea] = useState("");
  const [mainCharacter, setMainCharacter] = useState("");
  const [sideCharacter, setSideCharacter] = useState("");
  const [length, setLength] = useState<SeriesInput["episode_length"]>("Normal");

  const canNext = () => {
    if (step === 2) return storyIdea.trim().length >= 10;
    if (step === 3) return mainCharacter.trim().length > 0;
    return true;
  };

  const handleGenerate = async () => {
    await hydrate();
    if (!canGenerate()) {
      setPricingOpen(true);
      return;
    }
    setLoading(true);

    const payload: SeriesInput = {
      story_idea: storyIdea,
      genre,
      style: style === "Webtoon" ? "Cartoon Webtoon" : style,
      tone: "Dramatic and emotional",
      main_character: mainCharacter,
      love_interest: sideCharacter || "Milo",
      language: "English",
      episode_length: length,
      target_audience: "Teens / Young Adults",
    };

    try {
      const res = await apiFetch("/api/pipeline/generate", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (!isDatabaseEnabled()) await consumeGeneration();
      else await hydrate();
      await addStory(data.story as Story);
      router.push(`/story/${data.story.id}/preview`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Generation failed");
      setLoading(false);
    }
  };

  if (loading) {
    return <GenerationLoading />;
  }

  return (
    <>
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-border">
        {/* Credit bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 bg-gradient-to-r from-groen-mint/80 to-white px-5 py-4 sm:px-6">
          <div>
            <p className="text-sm font-bold text-groen-deep">
              {freeUsed ? "Creating uses credits" : "🎉 First story is free"}
            </p>
            <p className="text-xs text-gray-500">
              Turn your idea into a cartoon episode
            </p>
          </div>
          <span className="rounded-full bg-white px-4 py-1.5 text-sm font-bold text-groen-deep shadow-sm ring-1 ring-border">
            🍃 {credits} credits
          </span>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1 px-5 pt-5 sm:px-6">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1">
              <div
                className={`h-1.5 rounded-full transition ${
                  i <= step ? "bg-groen-primary" : "bg-gray-100"
                }`}
              />
              <p
                className={`mt-1 hidden text-[10px] font-bold sm:block ${
                  i === step ? "text-groen-deep" : "text-gray-400"
                }`}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        <div className="min-h-[320px] p-5 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              {step === 0 && (
                <>
                  <h2 className="text-lg font-black text-gray-900">
                    Pick a genre
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    What kind of story are you telling?
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {GENRES.map((g) => (
                      <PickCard
                        key={g.id}
                        icon={g.icon}
                        label={g.id}
                        selected={genre === g.id}
                        onClick={() => setGenre(g.id)}
                      />
                    ))}
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <h2 className="text-lg font-black text-gray-900">
                    Pick a style
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    How should your episode look?
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {STYLES.map((s) => (
                      <PickCard
                        key={s.id}
                        icon={s.icon}
                        label={s.id}
                        selected={style === s.id}
                        onClick={() => setStyle(s.id)}
                      />
                    ))}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="text-lg font-black text-gray-900">
                    Describe your story
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    One prompt — we&apos;ll handle the rest
                  </p>
                  <div className="relative mt-5 overflow-hidden rounded-2xl border-2 border-border bg-groen-mint/20 p-4 focus-within:border-groen-primary">
                    <textarea
                      value={storyIdea}
                      onChange={(e) => setStoryIdea(e.target.value)}
                      maxLength={500}
                      rows={5}
                      placeholder="A shy girl discovers her best friend is secretly a prince from another world."
                      className="w-full resize-none bg-transparent text-sm leading-relaxed text-gray-800 outline-none placeholder:text-gray-400"
                    />
                    <p className="mt-2 text-right text-xs text-gray-400">
                      {storyIdea.length} / 500
                    </p>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h2 className="text-lg font-black text-gray-900">
                    Add your characters
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Who stars in this episode?
                  </p>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <CharacterCard
                      label="Main character"
                      value={mainCharacter}
                      onChange={setMainCharacter}
                      emoji="👩‍🎨"
                      gradient="from-violet-400 to-purple-600"
                    />
                    <CharacterCard
                      label="Side character"
                      value={sideCharacter}
                      onChange={setSideCharacter}
                      emoji="🐱"
                      gradient="from-lime-400 to-green-500"
                      optional
                    />
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <h2 className="text-lg font-black text-gray-900">
                    Episode length
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    How long should this episode be?
                  </p>
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    {LENGTHS.map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setLength(l.id)}
                        className={`rounded-2xl border-2 px-3 py-4 text-center transition ${
                          length === l.id
                            ? "border-groen-primary bg-groen-mint shadow-sm"
                            : "border-gray-100 hover:border-border"
                        }`}
                      >
                        <p className="text-sm font-black text-gray-900">
                          {l.label}
                        </p>
                        <p className="mt-0.5 text-[11px] text-gray-500">
                          {l.sub}
                        </p>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sticky footer */}
        <div className="sticky bottom-0 flex gap-3 border-t border-border/50 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="rounded-full border-2 border-gray-200 px-5 py-3 text-sm font-bold text-gray-600"
            >
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              disabled={!canNext()}
              onClick={() => setStep(step + 1)}
              className="flex-1 rounded-full bg-groen-deep py-3.5 text-sm font-bold text-white shadow-lg disabled:opacity-40"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              className="flex-1 rounded-full bg-groen-deep py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:opacity-90"
            >
              ✨ Generate story
            </button>
          )}
        </div>
      </div>

      <PricingModal open={pricingOpen} onClose={() => setPricingOpen(false)} />
    </>
  );
}

function PickCard({
  icon,
  label,
  selected,
  onClick,
}: {
  icon: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-3 py-4 transition ${
        selected
          ? "border-groen-primary bg-groen-mint shadow-sm"
          : "border-gray-100 hover:border-border"
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-bold text-gray-800">{label}</span>
    </motion.button>
  );
}

function CharacterCard({
  label,
  value,
  onChange,
  emoji,
  gradient,
  optional,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  emoji: string;
  gradient: string;
  optional?: boolean;
}) {
  return (
    <div className="rounded-2xl border-2 border-border bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
        {label}
        {optional && " (optional)"}
      </p>
      <div className="mt-3 flex items-center gap-3">
        <div
          className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-2xl shadow-md`}
        >
          {emoji}
        </div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Name"
          className="w-full bg-transparent text-base font-bold text-gray-900 outline-none placeholder:font-normal placeholder:text-gray-300"
        />
      </div>
    </div>
  );
}
