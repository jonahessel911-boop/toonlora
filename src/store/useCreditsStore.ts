import { create } from "zustand";
import {
  getCredits,
  setCredits,
  hasUsedFreeStory,
  markFreeStoryUsed,
} from "@/lib/storage";
import { apiFetch } from "@/lib/session";
import { isDatabaseEnabled } from "@/lib/config";

interface CreditsStore {
  credits: number;
  freeUsed: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  canGenerate: () => boolean;
  consumeGeneration: () => Promise<boolean>;
  addCredits: (amount: number) => Promise<void>;
}

export const useCreditsStore = create<CreditsStore>((set, get) => ({
  credits: 10,
  freeUsed: false,
  hydrated: false,

  hydrate: async () => {
    if (isDatabaseEnabled()) {
      try {
        const res = await apiFetch("/api/credits");
        const data = await res.json();
        set({
          credits: data.credits ?? 10,
          freeUsed: data.freeUsed ?? false,
          hydrated: true,
        });
        return;
      } catch {
        // fall through
      }
    }

    set({
      credits: getCredits(),
      freeUsed: hasUsedFreeStory(),
      hydrated: true,
    });
  },

  canGenerate: () => {
    const { freeUsed, credits } = get();
    return !freeUsed || credits > 0;
  },

  consumeGeneration: async () => {
    if (isDatabaseEnabled()) {
      try {
        const res = await apiFetch("/api/credits", {
          method: "POST",
          body: JSON.stringify({ action: "consume" }),
        });
        const data = await res.json();
        if (data.success) {
          set({ credits: data.credits, freeUsed: data.freeUsed });
          return true;
        }
        return false;
      } catch {
        // fall through
      }
    }

    const { freeUsed, credits } = get();
    if (!freeUsed) {
      markFreeStoryUsed();
      set({ freeUsed: true });
      return true;
    }
    if (credits > 0) {
      const next = credits - 1;
      setCredits(next);
      set({ credits: next });
      return true;
    }
    return false;
  },

  addCredits: async (amount) => {
    if (isDatabaseEnabled()) {
      try {
        const res = await apiFetch("/api/credits", {
          method: "POST",
          body: JSON.stringify({ action: "add", amount }),
        });
        const data = await res.json();
        set({ credits: data.credits });
        setCredits(data.credits);
        return;
      } catch {
        // fall through
      }
    }

    const next = get().credits + amount;
    setCredits(next);
    set({ credits: next });
  },
}));
