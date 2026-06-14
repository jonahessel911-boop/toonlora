"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CoverArt, { getCoverPreset } from "@/components/ui/CoverArt";
import { useStoryStore } from "@/store/useStoryStore";
import { useCreditsStore } from "@/store/useCreditsStore";
import type { Story } from "@/types/story";

export default function EpisodePreviewClient({ id }: { id: string }) {
  const router = useRouter();
  const { fetchStoryById, hydrated, hydrate } = useStoryStore();
  const { freeUsed, hydrate: hydrateCredits } = useCreditsStore();
  const [story, setStory] = useState<Story | null>(null);

  useEffect(() => {
    void hydrate();
    void hydrateCredits();
  }, [hydrate, hydrateCredits]);

  useEffect(() => {
    if (!hydrated) return;
    void fetchStoryById(id).then(setStory);
  }, [hydrated, id, fetchStoryById]);

  if (!story) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-groen-mint border-t-groen-deep" />
      </div>
    );
  }

  const episode = story.episodes?.[0];
  const panelCount = episode?.script.panels.length ?? story.pages.length;
  const preset = getCoverPreset(String(story.genre));
  const fallbackChars: { name: string; personality: string }[] = [];
  if (story.mainCharacter) {
    fallbackChars.push({ name: story.mainCharacter, personality: "Main" });
  }
  if (story.loveInterest) {
    fallbackChars.push({
      name: story.loveInterest,
      personality: "Supporting",
    });
  }
  const characters = story.storyBible?.main_characters ?? fallbackChars;

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-groen-mint/30 to-white pb-28">
      <div className="mx-auto max-w-lg">
        {/* Cover hero */}
        <div className="relative overflow-hidden shadow-xl">
          <CoverArt
            gradient={story.coverGradient || preset.gradient}
            emoji={preset.emoji}
            className="aspect-[4/5] w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

          {!freeUsed && (
            <span className="absolute left-4 top-4 rounded-full bg-groen-primary px-3 py-1 text-xs font-bold text-white shadow-lg">
              First story free
            </span>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-5">
            <span className="inline-block rounded-lg bg-white/95 px-2.5 py-1 text-[11px] font-bold text-groen-deep">
              {story.genre}
            </span>
            <h1 className="mt-2 text-3xl font-black leading-tight text-white drop-shadow-lg">
              {episode?.title ?? story.title}
            </h1>
            <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-white/90">
              <span>📚 {story.episodes?.length ?? 1} episode</span>
              <span>📑 {panelCount} panels</span>
              <span>🕐 ~{Math.ceil(panelCount * 0.7)} min</span>
            </div>
          </div>
        </div>

        <div className="space-y-8 px-4 pt-8">
          {/* Summary */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-wide text-gray-400">
              Summary
            </h2>
            <p className="mt-3 rounded-2xl bg-white p-5 text-sm leading-relaxed text-gray-700 shadow-sm ring-1 ring-border">
              {story.storyBible?.logline ??
                episode?.script.episode_summary ??
                story.prompt}
            </p>
          </section>

          {/* Characters */}
          {characters.length > 0 && (
            <section>
              <h2 className="text-sm font-black uppercase tracking-wide text-gray-400">
                Characters
              </h2>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {characters.slice(0, 4).map((c, i) => (
                  <span
                    key={c.name}
                    className="flex-shrink-0 rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-800 shadow-sm ring-1 ring-border"
                  >
                    {i === 0 ? "⭐ " : ""}
                    {c.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Panel preview */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-wide text-gray-400">
              Preview panels
            </h2>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {(episode?.script.panels ?? story.pages.slice(0, 3)).map(
                (panel, i) => (
                  <div
                    key={"panel_number" in panel ? panel.panel_number : i}
                    className="min-w-[130px] flex-shrink-0 overflow-hidden rounded-2xl shadow-md ring-1 ring-border"
                  >
                    <CoverArt
                      gradient={
                        i % 2 === 0
                          ? story.coverGradient
                          : "from-primary to-violet-500"
                      }
                      emoji={preset.emoji}
                      className="aspect-[3/4]"
                    />
                    <p className="line-clamp-2 bg-white px-2 py-2 text-[10px] font-medium text-gray-600">
                      {"dialogue" in panel
                        ? panel.dialogue[0]?.text ??
                          panel.narration?.slice(0, 50)
                        : panel.text?.slice(0, 50)}
                    </p>
                  </div>
                )
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Sticky CTAs */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-white/95 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-lg flex-col gap-2">
          <button
            type="button"
            onClick={() => router.push(`/story/${id}/read`)}
            className="w-full rounded-full bg-groen-deep py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20"
          >
            Read now
          </button>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/create"
              className="rounded-full border-2 border-groen-primary py-3 text-center text-sm font-bold text-groen-deep"
            >
              Edit story
            </Link>
            <button
              type="button"
              onClick={() => router.push("/create")}
              className="rounded-full border-2 border-gray-200 py-3 text-sm font-bold text-gray-500"
            >
              Regenerate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
