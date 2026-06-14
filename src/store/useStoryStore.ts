import { create } from "zustand";
import {
  getStories,
  saveStory as persistStoryLocal,
  getStoryById as loadStoryByIdLocal,
} from "@/lib/storage";
import { apiFetch } from "@/lib/session";
import { isDatabaseEnabled } from "@/lib/config";
import type { Story } from "@/types/story";

interface StoryStore {
  stories: Story[];
  hydrated: boolean;
  source: "local" | "supabase";
  hydrate: () => Promise<void>;
  addStory: (story: Story) => Promise<void>;
  getStoryById: (id: string) => Story | undefined;
  fetchStoryById: (id: string) => Promise<Story | null>;
}

export const useStoryStore = create<StoryStore>((set, get) => ({
  stories: [],
  hydrated: false,
  source: "local",

  hydrate: async () => {
    if (isDatabaseEnabled()) {
      try {
        const res = await apiFetch("/api/stories");
        const data = await res.json();
        if (data.stories) {
          set({
            stories: data.stories,
            hydrated: true,
            source: data.source ?? "supabase",
          });
          return;
        }
      } catch {
        // fall through to localStorage
      }
    }

    set({ stories: getStories(), hydrated: true, source: "local" });
  },

  addStory: async (story) => {
    if (isDatabaseEnabled()) {
      try {
        const res = await apiFetch(`/api/stories/${story.id}`, {
          method: "PUT",
          body: JSON.stringify(story),
        });
        const data = await res.json();
        if (data.story) {
          const stories = get().stories.filter((s) => s.id !== data.story.id);
          set({ stories: [data.story, ...stories] });
          persistStoryLocal(data.story);
          return;
        }
      } catch {
        // fall through
      }
    }

    persistStoryLocal(story);
    set({ stories: getStories() });
  },

  getStoryById: (id) => {
    const cached = get().stories.find((s) => s.id === id);
    return cached ?? loadStoryByIdLocal(id);
  },

  fetchStoryById: async (id) => {
    const cached = get().getStoryById(id);
    if (cached) return cached;

    if (isDatabaseEnabled()) {
      try {
        const res = await apiFetch(`/api/stories/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.story) {
            persistStoryLocal(data.story);
            return data.story as Story;
          }
        }
      } catch {
        // fall through
      }
    }

    return loadStoryByIdLocal(id) ?? null;
  },
}));
