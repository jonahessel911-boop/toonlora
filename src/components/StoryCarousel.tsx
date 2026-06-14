import StoryCard from "@/components/StoryCard";
import type { SampleStory } from "@/lib/sampleStories";

interface StoryCarouselProps {
  title: string;
  subtitle?: string;
  stories: SampleStory[];
  showRank?: boolean;
  id?: string;
}

export default function StoryCarousel({
  title,
  subtitle,
  stories,
  showRank = false,
  id,
}: StoryCarouselProps) {
  return (
    <section id={id} className="py-8 sm:py-12">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900 sm:text-2xl">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {stories.map((story) => (
          <StoryCard
            key={story.id}
            id={story.id}
            title={story.title}
            genre={String(story.genre)}
            coverGradient={story.coverGradient}
            coverEmoji={story.coverEmoji}
            rank={showRank ? story.rank : undefined}
            episodes={story.episodes}
            readers={story.readers}
            likes={story.likes}
            creator={story.creator}
            isNew={story.isNew}
            href={story.href ?? "/create"}
            compact
          />
        ))}
      </div>
    </section>
  );
}
