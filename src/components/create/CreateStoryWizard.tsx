"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import GenerationLoading from "@/components/create/GenerationLoading";
import PricingModal from "@/components/PricingModal";
import CoverArt from "@/components/ui/CoverArt";
import { CREDIT_COPY, getGenreColors } from "@/lib/brand";
import { apiFetch } from "@/lib/session";
import { isDatabaseEnabled } from "@/lib/config";
import { useStoryStore } from "@/store/useStoryStore";
import { useCreditsStore } from "@/store/useCreditsStore";
import type { SeriesInput } from "@/types/pipeline";
import type { Story } from "@/types/story";

const GENRE_TONES: Record<string, string> = {
  Romance: "Warm, emotional, and romantic",
  Anime: "Stylized, expressive, and dramatic",
  Fantasy: "Epic, magical, and adventurous",
  Comedy: "Light, playful, and funny",
  Drama: "Tense, emotional, and cinematic",
  Adventure: "Bold, exciting, and exploratory",
  "Slice of Life": "Gentle, cozy, and heartfelt",
};

const STEPS = ["Genre", "Style", "Story", "Characters", "Length"] as const;

const CTA_LABELS = [
  "Continue to style →",
  "Continue to story →",
  "Continue to characters →",
  "Continue to length →",
  "Generate my episode",
];

const GENRES = [
  {
    id: "Romance",
    icon: "💕",
    description: "Love, tension, drama",
    gradient: "from-[#FF4FA3] via-[#FF6847] to-[#FF8CC8]",
  },
  {
    id: "Anime",
    icon: "🌸",
    description: "Stylized emotional stories",
    gradient: "from-[#8B5CF6] via-[#A78BFA] to-[#DDD6FE]",
  },
  {
    id: "Fantasy",
    icon: "🧙",
    description: "Magic, worlds, quests",
    gradient: "from-[#5340FF] via-[#4330E8] to-[#2A114B]",
  },
  {
    id: "Comedy",
    icon: "😂",
    description: "Funny, light, chaotic",
    gradient: "from-[#FFE033] via-[#FF6847] to-[#FBBF24]",
  },
  {
    id: "Drama",
    icon: "🎭",
    description: "Secrets, conflict, emotion",
    gradient: "from-[#FB7185] via-[#F472B6] to-[#EC4899]",
  },
  {
    id: "Adventure",
    icon: "⚔️",
    description: "Journeys, action, discovery",
    gradient: "from-[#22D3EE] via-[#38BDF8] to-[#5340FF]",
  },
  {
    id: "Slice of Life",
    icon: "☕",
    description: "Cozy everyday moments",
    gradient: "from-[#34D399] via-[#4ADE80] to-[#86EFAC]",
  },
];

const STYLES = [
  { id: "Cartoon", icon: "🐱", tint: "from-[#F3ECFF] to-[#E7D8FF]" },
  { id: "Webtoon", icon: "📱", tint: "from-[#EEEBFF] to-[#DDD6FE]" },
  { id: "Cute", icon: "🎀", tint: "from-[#FFF0F6] to-[#FFE4EC]" },
  { id: "Cinematic", icon: "🎬", tint: "from-[#EDE9FE] to-[#2A114B]/20" },
  { id: "Funny", icon: "😂", tint: "from-[#FFF9DB] to-[#FFE033]/40" },
  { id: "Dreamy", icon: "🌙", tint: "from-[#E0E7FF] to-[#C7D2FE]" },
];

const LENGTHS = [
  { id: "Short" as const, label: "Short", sub: "~1 min" },
  { id: "Normal" as const, label: "Medium", sub: "~3 min" },
  { id: "Long" as const, label: "Long", sub: "~5–7 min" },
];

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

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const genreMeta = GENRES.find((g) => g.id === genre) ?? GENRES[2];
  const genreColors = getGenreColors(genre);

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
      tone: GENRE_TONES[genre] ?? "Dramatic and emotional",
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

  const progressPct = ((step + 1) / STEPS.length) * 100;

  return (
    <>
      <div className="mx-auto flex h-full w-full max-w-[1280px] flex-col overflow-hidden px-4 py-3 md:px-6 md:py-4">
        {/* Compact header */}
        <header className="mb-3 flex shrink-0 items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate font-heading text-xl font-bold text-[#101828] md:text-2xl">
              Create your story
            </h1>
            <p className="hidden truncate text-xs text-[#667085] sm:block md:text-sm">
              In-depth business stories in a cartoon — describe yours and we&apos;ll draw it.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            {!freeUsed && (
              <span className="hidden rounded-full bg-primary-soft px-2.5 py-1 text-[10px] font-bold text-lp-purple sm:inline-flex">
                First story free
              </span>
            )}
            <span className="inline-flex rounded-full border border-[#E7D8FF] bg-white px-2.5 py-1 text-[10px] font-bold text-[#5340FF] sm:text-xs">
              {credits} credits ✦
            </span>
          </div>
        </header>

        {/* Main grid — fills remaining viewport */}
        <div className="grid min-h-0 flex-1 gap-3 overflow-hidden md:grid-cols-[1fr_300px] md:gap-5 lg:grid-cols-[1fr_320px]">
          {/* Wizard card */}
          <div className="flex min-h-0 flex-col overflow-hidden rounded-[24px] border border-[#E7D8FF] bg-white shadow-[0_8px_32px_rgba(42,17,75,0.08)] md:rounded-[28px]">
            {/* Progress */}
            <div className="shrink-0 border-b border-[#E7D8FF]/80 bg-[#F3ECFF]/40 px-4 py-3 md:px-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-[#5340FF] md:text-sm">
                  Step {step + 1} of {STEPS.length}
                </p>
                <p className="text-[11px] font-semibold text-[#667085]">{STEPS[step]}</p>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E7D8FF]/60">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#5340FF] to-[#6D4CFF]"
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              </div>
              <div className="mt-2 hidden gap-0.5 sm:flex">
                {STEPS.map((label, i) => {
                  const done = i < step;
                  const active = i === step;
                  return (
                    <div key={label} className="flex flex-1 flex-col items-center gap-1">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold ${
                          done
                            ? "bg-[#5340FF] text-white"
                            : active
                              ? "bg-[#5340FF] text-white ring-2 ring-[#5340FF]/25"
                              : "bg-[#E7D8FF] text-[#667085]"
                        }`}
                      >
                        {done ? "✓" : i + 1}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wide ${
                          active ? "text-[#5340FF]" : done ? "text-[#2A114B]" : "text-[#667085]"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step content — fills middle */}
            <div className="min-h-0 flex-1 overflow-hidden px-4 py-3 md:px-5 md:py-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.18 }}
                  className="flex h-full flex-col"
                >
                  {step === 0 && (
                    <>
                      <StepHeading
                        title="Pick a genre"
                        subtitle="What kind of cartoon story are you building?"
                      />
                      <div className="mt-3 grid min-h-0 flex-1 grid-cols-2 gap-2 content-start sm:grid-cols-3 md:grid-cols-4 md:gap-2.5">
                        {GENRES.map((g) => (
                          <GenreCard
                            key={g.id}
                            genre={g}
                            selected={genre === g.id}
                            onClick={() => setGenre(g.id)}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <StepHeading
                        title="Pick a style"
                        subtitle="How should your episode look and feel?"
                      />
                      <div className="mt-3 grid flex-1 grid-cols-3 gap-2 content-start sm:grid-cols-3 md:gap-2.5">
                        {STYLES.map((s) => (
                          <StyleCard
                            key={s.id}
                            style={s}
                            selected={style === s.id}
                            onClick={() => setStyle(s.id)}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <StepHeading
                        title="Describe your story"
                        subtitle="One idea — we'll turn it into panels and dialogue."
                      />
                      <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border-2 border-[#E7D8FF] bg-[#F3ECFF]/50 p-3 focus-within:border-[#5340FF] focus-within:ring-2 focus-within:ring-[#5340FF]/10">
                        <textarea
                          value={storyIdea}
                          onChange={(e) => setStoryIdea(e.target.value)}
                          maxLength={500}
                          placeholder="A shy girl discovers her best friend is secretly a prince from another world…"
                          className="min-h-0 flex-1 resize-none bg-transparent text-sm leading-relaxed text-[#101828] outline-none placeholder:text-[#667085]/70 md:text-base"
                        />
                        <p className="shrink-0 pt-1 text-right text-[10px] font-medium text-[#667085]">
                          {storyIdea.length} / 500
                        </p>
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <StepHeading title="Add your characters" subtitle="Who stars in this episode?" />
                      <div className="mt-3 grid flex-1 grid-cols-1 gap-2 content-start sm:grid-cols-2">
                        <CharacterCard
                          label="Main character"
                          value={mainCharacter}
                          onChange={setMainCharacter}
                          emoji="👩‍🎨"
                          gradient="from-[#5340FF] to-[#2A114B]"
                        />
                        <CharacterCard
                          label="Side character"
                          value={sideCharacter}
                          onChange={setSideCharacter}
                          emoji="🐱"
                          gradient="from-[#FF6847] to-[#FFE033]"
                          optional
                        />
                      </div>
                    </>
                  )}

                  {step === 4 && (
                    <>
                      <StepHeading title="Episode length" subtitle="How long should this episode be?" />
                      <div className="mt-3 grid flex-1 grid-cols-3 gap-2 content-start">
                        {LENGTHS.map((l) => (
                          <button
                            key={l.id}
                            type="button"
                            onClick={() => setLength(l.id)}
                            className={`rounded-xl border-2 px-2 py-3 text-center transition md:py-4 ${
                              length === l.id
                                ? "border-[#5340FF] bg-[#F3ECFF] shadow-[0_4px_16px_rgba(83,64,255,0.12)]"
                                : "border-[#E7D8FF] bg-white hover:border-[#5340FF]/40"
                            }`}
                          >
                            <p className="font-heading text-sm font-bold text-[#101828]">{l.label}</p>
                            <p className="mt-0.5 text-[10px] font-medium text-[#667085]">{l.sub}</p>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer — always visible */}
            <div className="flex shrink-0 gap-2 border-t border-[#E7D8FF]/80 bg-[#FCFAFF]/80 px-4 py-3 md:px-5">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="rounded-full border-2 border-[#E7D8FF] px-4 py-2.5 text-xs font-bold text-[#667085] md:px-5 md:text-sm"
                >
                  Back
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  disabled={!canNext()}
                  onClick={() => setStep(step + 1)}
                  className="btn-coral min-h-[48px] flex-1 rounded-full text-sm font-extrabold disabled:opacity-40 md:min-h-[52px] md:text-base"
                >
                  {CTA_LABELS[step]}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="btn-coral min-h-[48px] flex-1 rounded-full text-sm font-extrabold shadow-[0_8px_20px_rgba(83,64,255,0.25)] md:min-h-[52px] md:text-base"
                >
                  {CTA_LABELS[step]}
                </button>
              )}
            </div>
          </div>

          {/* Preview — desktop only, compact */}
          <aside className="hidden min-h-0 flex-col overflow-hidden md:flex">
            <EpisodePreview
              genre={genre}
              genreMeta={genreMeta}
              genreColors={genreColors}
              style={style}
              length={length}
              credits={credits}
              freeUsed={freeUsed}
              mainCharacter={mainCharacter}
              storyIdea={storyIdea}
              step={step}
            />
          </aside>
        </div>
      </div>

      <PricingModal open={pricingOpen} onClose={() => setPricingOpen(false)} />
    </>
  );
}

function StepHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="shrink-0">
      <h2 className="font-heading text-base font-bold text-[#101828] md:text-lg">{title}</h2>
      <p className="mt-0.5 text-xs text-[#667085] md:text-sm">{subtitle}</p>
    </div>
  );
}

function GenreCard({
  genre,
  selected,
  onClick,
}: {
  genre: (typeof GENRES)[number];
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl text-left transition ${
        selected
          ? "scale-[1.02] shadow-[0_8px_20px_rgba(83,64,255,0.22)] ring-2 ring-[#5340FF]"
          : "shadow-sm ring-1 ring-[#E7D8FF] hover:shadow-md"
      }`}
    >
      <div className={`relative flex h-12 items-center bg-gradient-to-br ${genre.gradient} px-2.5 md:h-14`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_50%)]" />
        <span className="relative text-lg md:text-xl">{genre.icon}</span>
        {selected && (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[8px] font-bold uppercase text-[#5340FF]">
            ✓
          </span>
        )}
      </div>
      <div className="bg-white px-2 py-1.5 md:px-2.5">
        <p className="truncate font-heading text-[11px] font-bold text-[#101828] md:text-xs">
          {genre.id}
        </p>
        <p className="hidden truncate text-[10px] text-[#667085] sm:block">{genre.description}</p>
      </div>
    </button>
  );
}

function StyleCard({
  style,
  selected,
  onClick,
}: {
  style: (typeof STYLES)[number];
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-2.5 transition md:py-3 ${
        selected
          ? "border-[#5340FF] bg-[#F3ECFF] shadow-sm"
          : "border-[#E7D8FF] bg-white hover:border-[#5340FF]/30"
      }`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${style.tint} text-lg md:h-10 md:w-10 md:text-xl`}
      >
        {style.icon}
      </div>
      <span className="font-heading text-[11px] font-bold text-[#101828] md:text-xs">{style.id}</span>
    </button>
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
    <div className="rounded-xl border-2 border-[#E7D8FF] bg-[#F3ECFF]/30 p-3 focus-within:border-[#5340FF] focus-within:ring-2 focus-within:ring-[#5340FF]/10">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#667085]">
        {label}
        {optional && " (optional)"}
      </p>
      <div className="mt-2 flex items-center gap-2.5">
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-lg shadow-sm md:h-11 md:w-11`}
        >
          {emoji}
        </div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Name"
          className="w-full bg-transparent text-sm font-bold text-[#101828] outline-none placeholder:font-normal placeholder:text-[#667085]/50"
        />
      </div>
    </div>
  );
}

function EpisodePreview({
  genre,
  genreMeta,
  genreColors,
  style,
  length,
  credits,
  freeUsed,
  mainCharacter,
  storyIdea,
  step,
}: {
  genre: string;
  genreMeta: (typeof GENRES)[number];
  genreColors: ReturnType<typeof getGenreColors>;
  style: string;
  length: SeriesInput["episode_length"];
  credits: number;
  freeUsed: boolean;
  mainCharacter: string;
  storyIdea: string;
  step: number;
}) {
  const previewTitle =
    mainCharacter.trim() || storyIdea.trim().slice(0, 36) || "Your Story";
  const lengthLabel = LENGTHS.find((l) => l.id === length)?.label ?? "Medium";
  const genreIcon = GENRES.find((g) => g.id === genre)?.icon ?? "✨";

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] border border-[#E7D8FF] bg-white shadow-[0_12px_40px_rgba(83,64,255,0.1)]">
      {/* Header */}
      <div className="shrink-0 border-b border-[#E7D8FF]/60 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#5340FF]">
          Episode preview
        </p>
        <p className="mt-0.5 text-xs text-[#667085]">Live preview of your episode</p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4">
        {/* Hero cover card */}
        <div className="relative mx-auto w-full max-w-[220px] shrink-0">
          <div className="overflow-hidden rounded-[20px] shadow-[0_16px_40px_rgba(42,17,75,0.22)] ring-1 ring-[#E7D8FF]">
            <CoverArt
              gradient={genreColors.gradient}
              genre={genre}
              title={previewTitle}
              seed={genre.length * 7 + previewTitle.length}
              className="aspect-[3/4] w-full"
            />
          </div>
          {/* Floating style badge */}
          <span className="absolute -right-2 top-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#5340FF] shadow-md ring-1 ring-[#E7D8FF]">
            {style}
          </span>
        </div>

        {/* Meta */}
        <div className="shrink-0 text-center">
          <p className="font-heading truncate text-base font-bold text-[#101828]">
            {previewTitle}
          </p>
          <p className="mt-0.5 text-[11px] text-[#667085]">Episode 1 · Draft</p>
        </div>

        {/* Chips */}
        <div className="flex shrink-0 flex-wrap justify-center gap-1.5">
          <PreviewChip label={genre} icon={genreIcon} accent />
          <PreviewChip label={style} />
          {step >= 4 && <PreviewChip label={lengthLabel} />}
          <PreviewChip label={`${credits} ✦`} muted />
        </div>

        {/* Panel strip */}
        <div className="min-h-0 flex-1">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[#667085]">
            Story panels
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="overflow-hidden rounded-xl ring-1 ring-[#E7D8FF]"
              >
                <div
                  className={`relative aspect-[4/5] bg-gradient-to-br ${genreMeta.gradient}`}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.25),transparent_60%)]" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 to-transparent px-1.5 pb-1.5 pt-4">
                    <span className="text-[9px] font-bold text-white/90">Panel {n}</span>
                  </div>
                  {n === 1 && (
                    <span className="absolute left-1.5 top-1.5 rounded-md bg-[#5340FF] px-1 py-0.5 text-[8px] font-bold text-white">
                      Start
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="shrink-0 rounded-xl bg-[#F3ECFF] px-3 py-2.5 text-center">
          <p className="text-[11px] font-semibold text-[#2A114B]">
            {freeUsed ? CREDIT_COPY : "🎉 Your first story is free"}
          </p>
        </div>
      </div>
    </div>
  );
}

function PreviewChip({
  label,
  icon,
  accent,
  muted,
}: {
  label: string;
  icon?: string;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
        accent
          ? "bg-[#5340FF] text-white"
          : muted
            ? "border border-[#E7D8FF] bg-white text-[#667085]"
            : "bg-[#F3ECFF] text-[#2A114B]"
      }`}
    >
      {icon && <span>{icon}</span>}
      {label}
    </span>
  );
}
