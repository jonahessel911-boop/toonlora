import { STORAGE_KEYS } from "@/lib/constants";
import type { Story } from "@/types/story";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getStories(): Story[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.stories);
    if (!raw) return [];
    return JSON.parse(raw) as Story[];
  } catch {
    return [];
  }
}

export function saveStory(story: Story): void {
  if (!isBrowser()) return;
  const stories = getStories();
  const index = stories.findIndex((s) => s.id === story.id);
  if (index >= 0) {
    stories[index] = story;
  } else {
    stories.unshift(story);
  }
  localStorage.setItem(STORAGE_KEYS.stories, JSON.stringify(stories));
}

export function getStoryById(id: string): Story | undefined {
  return getStories().find((s) => s.id === id);
}

export function getCredits(): number {
  if (!isBrowser()) return 10;
  const raw = localStorage.getItem(STORAGE_KEYS.credits);
  if (raw === null) return 10;
  return Number(raw);
}

export function setCredits(credits: number): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.credits, String(credits));
}

export function hasUsedFreeStory(): boolean {
  if (!isBrowser()) return false;
  return localStorage.getItem(STORAGE_KEYS.freeUsed) === "true";
}

export function markFreeStoryUsed(): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.freeUsed, "true");
}
