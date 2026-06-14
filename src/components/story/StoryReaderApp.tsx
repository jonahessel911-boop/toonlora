"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStoryStore } from "@/store/useStoryStore";
import { useCreditsStore } from "@/store/useCreditsStore";
import { apiFetch } from "@/lib/session";
import { isDatabaseEnabled } from "@/lib/config";
import type { Story } from "@/types/story";

interface StoryReaderAppProps {
  id: string;
  isPublic?: boolean;
}

export default function StoryReaderApp({ id, isPublic = false }: StoryReaderAppProps) {
  const router = useRouter();
  const { hydrate, fetchStoryById, addStory, hydrated } = useStoryStore();
  const { canGenerate, consumeGeneration, credits, hydrate: hydrateCredits } =
    useCreditsStore();
  const [story, setStory] = useState<Story | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    void hydrate();
    void hydrateCredits();
  }, [hydrate, hydrateCredits]);

  useEffect(() => {
    if (!hydrated) return;
    void fetchStoryById(id).then(setStory);
  }, [hydrated, id, fetchStoryById]);

  const handleShare = () => {
    const url = `${window.location.origin}/share/${id}`;
    navigator.clipboard?.writeText(url);
    alert("Share link copied!");
  };

  const handleNextEpisode = async () => {
    if (!story?.userInput || !story.continuityMemory) return;
    if (!canGenerate()) {
      alert("Not enough credits");
      return;
    }
    setGenerating(true);
    try {
      const res = await apiFetch("/api/pipeline/generate", {
        method: "POST",
        body: JSON.stringify({
          ...story.userInput,
          episode_number: (story.episodes?.length ?? 0) + 1,
          previous_summary: story.continuityMemory.last_episode_summary,
          episode_prompt: `Continue: ${story.continuityMemory.unresolved_threads[0] ?? ""}`,
          story_bible: story.storyBible,
          series_id: story.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (!isDatabaseEnabled()) await consumeGeneration();
      else await hydrateCredits();
      const updated = isDatabaseEnabled()
        ? (data.story as Story)
        : { ...story, ...data.story };
      await addStory(updated);
      setStory(updated);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setGenerating(false);
    }
  };

  if (!story) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-groen-mint border-t-groen-deep" />
      </div>
    );
  }

  const episode = story.episodes?.[0];
  const totalPages = episode?.script.panels.length ?? story.pages.length;

  return (
    <div className="mx-auto min-h-[100dvh] max-w-lg bg-white pb-8">
      <header className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <Link
          href={isPublic ? "/" : "/library"}
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600"
        >
          ←
        </Link>
        <div className="text-center">
          <h1 className="text-base font-black text-groen-deep">
            {story.title} 🌿
          </h1>
          {!isPublic && (
            <p className="text-[10px] font-semibold text-groen-primary">
              ✦ Step 6 of 6 • Story complete! ✦
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleShare}
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600"
        >
          ↗
        </button>
      </header>

      <div className="px-4 py-4">
        {episode ? (
          <div className="space-y-3">
            {episode.script.panels.map((panel) => (
              <div
                key={panel.panel_number}
                className={`overflow-hidden rounded-2xl border-2 border-white bg-gradient-to-br ${story.coverGradient} shadow-md`}
              >
                <div className="flex min-h-[160px] flex-col justify-end p-4">
                  {panel.dialogue.map((d) => (
                    <div
                      key={d.text}
                      className="mb-2 max-w-[85%] rounded-2xl border-2 border-gray-900 bg-white px-3 py-2"
                    >
                      <p className="text-xs font-bold text-gray-900">{d.text}</p>
                    </div>
                  ))}
                  {panel.narration && (
                    <p className="rounded-lg bg-black/20 px-3 py-1.5 text-xs italic text-white">
                      {panel.narration}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-groen-mint/30 p-6 text-center text-sm text-gray-600">
            No episode panels found.
          </div>
        )}
      </div>

      {!isPublic && (
        <>
          <div className="mx-4 mt-4 flex items-center gap-3 rounded-2xl bg-groen-mint/40 p-4">
            <div
              className={`h-12 w-10 flex-shrink-0 rounded-lg bg-gradient-to-br ${story.coverGradient}`}
            />
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800">Episode 1</p>
              <p className="text-xs text-gray-500">
                Page {totalPages} of {totalPages}
              </p>
              <div className="mt-2 flex gap-1">
                {Array.from({ length: Math.min(totalPages, 8) }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${
                      i === totalPages - 1
                        ? "bg-groen-primary ring-2 ring-groen-primary/30"
                        : "bg-groen-primary/40"
                    }`}
                  />
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={handleNextEpisode}
              disabled={generating}
              className="rounded-full bg-groen-primary px-4 py-2 text-xs font-bold text-white shadow-md disabled:opacity-50"
            >
              {generating ? "…" : "Next episode →"}
            </button>
          </div>

          <div className="mx-4 mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center justify-center gap-2 rounded-full border-2 border-groen-primary py-3.5 text-sm font-bold text-groen-deep"
            >
              ↗ Share
            </button>
            <button
              type="button"
              onClick={handleNextEpisode}
              disabled={generating}
              className="flex items-center justify-center gap-2 rounded-full bg-groen-primary py-3.5 text-sm font-bold text-white shadow-md disabled:opacity-50"
            >
              ✨ Generate next episode
            </button>
          </div>

          <div className="mx-4 mt-4 flex items-center justify-between rounded-2xl bg-groen-mint px-4 py-3">
            <p className="text-xs font-medium text-groen-deep">
              Amazing! You&apos;ve completed this story. Keep the adventure going
              with a new episode.
            </p>
            <span className="text-groen-primary">↗</span>
          </div>

          <p className="mt-3 text-center text-xs text-gray-400">
            {credits} credits remaining
          </p>
        </>
      )}

      {isPublic && (
        <div className="mx-4 mt-8 rounded-3xl bg-groen-mint p-6 text-center">
          <Link
            href="/signup"
            className="inline-block rounded-full bg-groen-primary px-8 py-3 text-sm font-bold text-white"
          >
            Create your own story for free
          </Link>
        </div>
      )}
    </div>
  );
}
