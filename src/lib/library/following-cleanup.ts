import {
  getFollowingStories,
  setFollowingStories,
  type FollowingStory,
} from "@/lib/library/preferences";
import { isPlaceholderFollowingStory } from "@/lib/library/following-ids";

/** Remove catalog placeholders from the saved My List. */
export function prunePlaceholderFollowingStories(): FollowingStory[] {
  const stories = getFollowingStories();
  const kept = stories.filter(
    (story) => !isPlaceholderFollowingStory(story.seriesId)
  );

  if (kept.length !== stories.length) {
    setFollowingStories(kept);
  }

  return kept;
}
