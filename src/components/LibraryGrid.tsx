"use client";

import { useEffect } from "react";
import StoryCard from "@/components/StoryCard";
import EmptyState from "@/components/EmptyState";
import CreditsBadge from "@/components/CreditsBadge";
import { useStoryStore } from "@/store/useStoryStore";

export default function LibraryGrid() {
  const { stories, hydrate, hydrated } = useStoryStore();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const handleShare = (id: string) => {
    const url = `${window.location.origin}/share/${id}`;
    navigator.clipboard?.writeText(url);
    alert("Share link copied to clipboard!");
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-groen-mint border-t-groen-deep" />
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <EmptyState
        title="Your library is empty"
        description="Generate your first AI romantic story and it will appear here, ready to read as a flipbook."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {stories.map((story) => (
        <StoryCard
          key={story.id}
          id={story.id}
          title={story.title}
          genre={String(story.genre)}
          coverGradient={story.coverGradient}
          date={story.createdAt}
          showActions
          onShare={() => handleShare(story.id)}
        />
      ))}
    </div>
  );
}

export function LibraryHeader() {
  return (
    <div className="mb-8 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900 sm:text-4xl">
          My Library
        </h1>
        <p className="mt-2 text-gray-500">
          All your generated stories, saved on this device.
        </p>
      </div>
      <CreditsBadge />
    </div>
  );
}
