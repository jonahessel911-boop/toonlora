"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GENRES,
  VISUAL_STYLES,
  TONE_OPTIONS,
  TARGET_AUDIENCES,
  LANGUAGES,
  EPISODE_LENGTHS,
} from "@/lib/constants";
import { PIPELINE_STEP_LABELS, PIPELINE_MODELS } from "@/lib/prompts";
import { useStoryStore } from "@/store/useStoryStore";
import { useCreditsStore } from "@/store/useCreditsStore";
import type { PipelineStepStatus, SeriesInput } from "@/types/pipeline";
import type { Story } from "@/types/story";
import { apiFetch } from "@/lib/session";
import { isDatabaseEnabled } from "@/lib/config";
import PricingModal from "@/components/PricingModal";
import PipelineProgress from "@/components/PipelineProgress";

const INITIAL_STEPS: PipelineStepStatus[] = (
  Object.keys(PIPELINE_MODELS) as Array<keyof typeof PIPELINE_MODELS>
).map((id) => ({
  id,
  label: PIPELINE_STEP_LABELS[id],
  model: PIPELINE_MODELS[id],
  status: "pending",
}));

export default function CreateStoryForm() {
  const router = useRouter();
  const addStory = useStoryStore((s) => s.addStory);
  const { freeUsed, canGenerate, consumeGeneration, hydrate } =
    useCreditsStore();
  const [loading, setLoading] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [steps, setSteps] = useState<PipelineStepStatus[]>(INITIAL_STEPS);

  const [form, setForm] = useState<SeriesInput>({
    story_idea:
      "A shy girl discovers her classmate is secretly a demon prince.",
    genre: "Fantasy Romance",
    style: "Cartoon Webtoon",
    tone: "Dramatic and emotional",
    main_character: "",
    love_interest: "",
    language: "English",
    episode_length: "Short",
    target_audience: "Teens / Young Adults",
  });

  const update = <K extends keyof SeriesInput>(
    key: K,
    value: SeriesInput[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await hydrate();

    if (
      !form.main_character.trim() ||
      !form.love_interest.trim() ||
      !form.story_idea.trim()
    ) {
      return;
    }

    if (!canGenerate()) {
      setPricingOpen(true);
      return;
    }

    setLoading(true);
    setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: "pending" })));

    try {
      const response = await apiFetch("/api/pipeline/generate", {
        method: "POST",
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Generation failed");
      }

      if (data.pipeline?.steps) {
        setSteps(data.pipeline.steps);
      }

      if (!isDatabaseEnabled()) {
        await consumeGeneration();
      } else {
        await hydrate();
      }

      await addStory(data.story as Story);
      router.push(`/story/${data.story.id}`);
    } catch (err) {
      setLoading(false);
      alert(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (loading) {
    return (
      <PipelineProgress
        steps={steps}
        currentMessage="Your webtoon chapter is being created…"
      />
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-border sm:p-8"
      >
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-groen-mint to-surface-soft px-5 py-4">
          <p className="text-sm font-bold text-groen-deep">
            {freeUsed ? "✨ Each chapter uses 1 credit" : "🎉 First story is free"}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Story-to-Webtoon Engine: Bible → Script → Panels → Art → Bubbles
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Story idea
            </label>
            <textarea
              required
              rows={3}
              value={form.story_idea}
              onChange={(e) => update("story_idea", e.target.value)}
              placeholder="A shy girl discovers her classmate is secretly a demon prince."
              className="w-full resize-none rounded-xl border-2 border-border bg-groen-mint/30 px-4 py-3 text-sm font-medium outline-none transition focus:border-groen-primary focus:bg-white"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Genre
              </label>
              <select
                value={form.genre}
                onChange={(e) => update("genre", e.target.value)}
                className="w-full rounded-xl border-2 border-border bg-groen-mint/30 px-4 py-3 text-sm font-medium outline-none transition focus:border-groen-primary focus:bg-white"
              >
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Visual style
              </label>
              <select
                value={form.style}
                onChange={(e) => update("style", e.target.value)}
                className="w-full rounded-xl border-2 border-border bg-groen-mint/30 px-4 py-3 text-sm font-medium outline-none transition focus:border-groen-primary focus:bg-white"
              >
                {VISUAL_STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-bold text-gray-700">
              Tone
            </label>
            <div className="flex flex-wrap gap-2">
              {TONE_OPTIONS.map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => update("tone", tone)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                    form.tone === tone
                      ? "bg-groen-deep text-white shadow-md"
                      : "bg-groen-mint text-groen-deep hover:bg-primary-soft"
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Main character
              </label>
              <input
                type="text"
                required
                value={form.main_character}
                onChange={(e) => update("main_character", e.target.value)}
                placeholder="Luna"
                className="w-full rounded-xl border-2 border-border bg-groen-mint/30 px-4 py-3 text-sm font-medium outline-none transition focus:border-groen-primary focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Love interest
              </label>
              <input
                type="text"
                required
                value={form.love_interest}
                onChange={(e) => update("love_interest", e.target.value)}
                placeholder="Kai"
                className="w-full rounded-xl border-2 border-border bg-groen-mint/30 px-4 py-3 text-sm font-medium outline-none transition focus:border-groen-primary focus:bg-white"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Language
              </label>
              <select
                value={form.language}
                onChange={(e) => update("language", e.target.value)}
                className="w-full rounded-xl border-2 border-border bg-groen-mint/30 px-4 py-3 text-sm font-medium outline-none transition focus:border-groen-primary focus:bg-white"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Chapter length
              </label>
              <select
                value={form.episode_length}
                onChange={(e) =>
                  update(
                    "episode_length",
                    e.target.value as SeriesInput["episode_length"]
                  )
                }
                className="w-full rounded-xl border-2 border-border bg-groen-mint/30 px-4 py-3 text-sm font-medium outline-none transition focus:border-groen-primary focus:bg-white"
              >
                {EPISODE_LENGTHS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Target audience
              </label>
              <select
                value={form.target_audience}
                onChange={(e) => update("target_audience", e.target.value)}
                className="w-full rounded-xl border-2 border-border bg-groen-mint/30 px-4 py-3 text-sm font-medium outline-none transition focus:border-groen-primary focus:bg-white"
              >
                {TARGET_AUDIENCES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="mt-8 w-full rounded-full bg-groen-deep py-4 text-base font-black text-white shadow-xl shadow-primary/20 transition hover:scale-[1.01] hover:opacity-90"
        >
          Generate Chapter 1
        </button>
      </form>

      <PricingModal open={pricingOpen} onClose={() => setPricingOpen(false)} />
    </>
  );
}
