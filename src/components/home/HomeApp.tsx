"use client";

import Link from "next/link";
import { AppHeader } from "@/components/layout/AppChrome";
import StoryCarousel from "@/components/StoryCarousel";
import { TRENDING_STORIES } from "@/lib/sampleStories";

export default function HomeApp() {
  return (
    <>
      <AppHeader />
      <div className="mx-auto max-w-lg px-4 pb-28 pt-2">
        <div className="rounded-3xl bg-gradient-to-br from-groen-mint via-white to-surface-soft p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-groen-primary">
            Welcome back 👋
          </p>
          <h2 className="mt-2 text-2xl font-black text-groen-deep">
            Ready for a new adventure?
          </h2>
          <Link
            href="/create"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-groen-primary px-6 py-3 text-sm font-bold text-white shadow-lg"
          >
            ✨ Create story
          </Link>
        </div>

        <div className="mt-8">
          <StoryCarousel
            title="Trending now"
            subtitle="Popular this week"
            stories={TRENDING_STORIES.slice(0, 4)}
            showRank
          />
        </div>

        <div className="mt-6 rounded-2xl border-2 border-dashed border-border bg-groen-mint/30 p-6 text-center">
          <p className="text-sm font-bold text-groen-deep">
            First story is free 🎉
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Start your 6-step journey today
          </p>
          <Link
            href="/signup"
            className="mt-4 inline-block text-sm font-bold text-groen-primary"
          >
            New here? Get started →
          </Link>
        </div>
      </div>
    </>
  );
}
