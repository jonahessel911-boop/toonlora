"use client";

import LPStoryCard from "@/components/lp/StoryCard";
import type { SampleStory } from "@/lib/sampleStories";

interface StoryGridProps {
  stories: SampleStory[];
}

export default function StoryGrid({ stories }: StoryGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {stories.map((story) => (
        <LPStoryCard key={story.id} story={story} />
      ))}
    </div>
  );
}
