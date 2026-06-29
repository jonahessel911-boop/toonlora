import { findMockStory } from "@/lib/mock/businessStoryCatalog";

const PLACEHOLDER_ID_PREFIXES = ["sample-", "cat-dra", "demo-", "draft-"];

export function isPlaceholderFollowingStory(seriesId: string): boolean {
  const id = seriesId.trim().toLowerCase();
  if (!id) return true;
  if (findMockStory(id)) return true;
  return PLACEHOLDER_ID_PREFIXES.some((prefix) => id.startsWith(prefix));
}
