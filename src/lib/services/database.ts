import type { Story } from "@/types/story";
import {
  getStories,
  saveStory,
  getStoryById,
  getCredits,
  setCredits,
  hasUsedFreeStory,
  markFreeStoryUsed,
} from "@/lib/storage";
import {
  saveStoryToDb,
  getStoryFromDb,
  listStoriesFromDb,
  getCreditsFromDb,
  consumeCreditInDb,
  addCreditsInDb,
} from "@/lib/services/story-repository";
import { isServerDatabaseConfigured } from "@/lib/config";

/** Unified repository — Supabase on server, localStorage on client fallback */

export const storyRepository = {
  /** Client: localStorage | Server: Supabase */
  getAllLocal: (): Story[] => getStories(),
  getByIdLocal: (id: string): Story | undefined => getStoryById(id),
  saveLocal: (story: Story): void => saveStory(story),

  /** Server-side Supabase */
  save: async (
    story: Story,
    sessionId: string,
    options?: import("@/lib/services/story-repository").SaveStoryOptions
  ): Promise<Story> => {
    if (isServerDatabaseConfigured()) {
      return saveStoryToDb(story, sessionId, options);
    }
    return story;
  },

  getById: async (id: string): Promise<Story | null> => {
    if (isServerDatabaseConfigured()) {
      return getStoryFromDb(id);
    }
    return getStoryById(id) ?? null;
  },

  list: async (sessionId: string): Promise<Story[]> => {
    if (isServerDatabaseConfigured()) {
      return listStoriesFromDb(sessionId);
    }
    return getStories();
  },
};

export const creditsRepository = {
  getLocal: () => ({
    credits: getCredits(),
    freeUsed: hasUsedFreeStory(),
  }),

  setLocalCredits: (credits: number) => setCredits(credits),
  markLocalFreeUsed: () => markFreeStoryUsed(),

  get: async (sessionId: string) => {
    if (isServerDatabaseConfigured()) {
      return getCreditsFromDb(sessionId);
    }
    return { credits: getCredits(), freeUsed: hasUsedFreeStory() };
  },

  consume: async (sessionId: string): Promise<boolean> => {
    if (isServerDatabaseConfigured()) {
      return consumeCreditInDb(sessionId);
    }
    if (!hasUsedFreeStory()) {
      markFreeStoryUsed();
      return true;
    }
    const credits = getCredits();
    if (credits <= 0) return false;
    setCredits(credits - 1);
    return true;
  },

  add: async (sessionId: string, amount: number): Promise<number> => {
    if (isServerDatabaseConfigured()) {
      return addCreditsInDb(sessionId, amount);
    }
    const next = getCredits() + amount;
    setCredits(next);
    return next;
  },
};
