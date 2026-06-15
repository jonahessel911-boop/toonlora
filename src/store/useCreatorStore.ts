"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  COMMUNITY_CHARACTERS,
  INITIAL_CHARACTERS,
  INITIAL_STORIES,
  MOCK_ANALYTICS,
  MOCK_CREATOR_ID,
  createEmptyStory,
  generatePanelsForEpisode,
} from "@/lib/creator/mockData";
import type {
  StudioBubble,
  StudioCharacter,
  StudioPanel,
  StudioSection,
  StudioStory,
  StudioVisibility,
} from "@/types/creator";

const STORAGE_KEY = "toonlora-creator-studio";

interface CreatorStore {
  hydrated: boolean;
  activeSection: StudioSection;
  stories: StudioStory[];
  characters: StudioCharacter[];
  communityCharacters: StudioCharacter[];
  analytics: typeof MOCK_ANALYTICS;
  editorStoryId: string | null;
  editorEpisodeId: string | null;
  editorPanelId: string | null;
  selectedBubbleId: string | null;

  setSection: (section: StudioSection) => void;
  getStory: (id: string) => StudioStory | undefined;
  getCharacter: (id: string) => StudioCharacter | undefined;
  getMyCharacters: () => StudioCharacter[];
  getPublicCharacters: () => StudioCharacter[];

  addStory: (story: StudioStory) => void;
  updateStory: (id: string, patch: Partial<StudioStory>) => void;
  addCharacter: (character: StudioCharacter) => void;
  updateCharacter: (id: string, patch: Partial<StudioCharacter>) => void;
  duplicateCharacter: (id: string) => void;

  createStoryFromFlow: (data: {
    title: string;
    genre: string;
    description: string;
    audienceRating: string;
    visibility: StudioVisibility;
    characterIds: string[];
    episodePrompt: string;
    panelCount: number;
  }) => string;

  createCharacterFromForm: (
    data: Omit<
      StudioCharacter,
      | "id"
      | "creatorId"
      | "creatorName"
      | "referenceImages"
      | "usedInStories"
      | "portraitGradient"
    > & { portraitGradient?: string }
  ) => string;

  setEditorContext: (
    storyId: string,
    episodeId?: string,
    panelId?: string
  ) => void;
  setSelectedBubble: (id: string | null) => void;
  updatePanel: (
    storyId: string,
    episodeId: string,
    panelId: string,
    patch: Partial<StudioPanel>
  ) => void;
  addBubble: (
    storyId: string,
    episodeId: string,
    panelId: string,
    bubble: Omit<StudioBubble, "id" | "panelId">
  ) => void;
  updateBubble: (
    storyId: string,
    episodeId: string,
    panelId: string,
    bubbleId: string,
    patch: Partial<StudioBubble>
  ) => void;
  deleteBubble: (
    storyId: string,
    episodeId: string,
    panelId: string,
    bubbleId: string
  ) => void;
  publishStory: (storyId: string) => void;
  importCommunityCharacter: (characterId: string) => void;
}

const GRADIENTS = [
  "from-[#5340FF] via-[#7C3AED] to-[#FF4FA3]",
  "from-[#22D3EE] via-[#5340FF] to-[#2A114B]",
  "from-[#FF6847] via-[#FF4FA3] to-[#5340FF]",
];

export const useCreatorStore = create<CreatorStore>()(
  persist(
    (set, get) => ({
      hydrated: false,
      activeSection: "overview",
      stories: INITIAL_STORIES,
      characters: INITIAL_CHARACTERS,
      communityCharacters: COMMUNITY_CHARACTERS,
      analytics: MOCK_ANALYTICS,
      editorStoryId: null,
      editorEpisodeId: null,
      editorPanelId: null,
      selectedBubbleId: null,

      setSection: (section) => set({ activeSection: section }),

      getStory: (id) => get().stories.find((s) => s.id === id),
      getCharacter: (id) =>
        get().characters.find((c) => c.id === id) ??
        get().communityCharacters.find((c) => c.id === id),

      getMyCharacters: () =>
        get().characters.filter((c) => c.creatorId === MOCK_CREATOR_ID),

      getPublicCharacters: () =>
        get().characters.filter(
          (c) => c.visibility === "public" && c.creatorId === MOCK_CREATOR_ID
        ),

      addStory: (story) =>
        set((s) => ({ stories: [story, ...s.stories] })),

      updateStory: (id, patch) =>
        set((s) => ({
          stories: s.stories.map((story) =>
            story.id === id
              ? { ...story, ...patch, updatedAt: new Date().toISOString() }
              : story
          ),
        })),

      addCharacter: (character) =>
        set((s) => ({ characters: [character, ...s.characters] })),

      updateCharacter: (id, patch) =>
        set((s) => ({
          characters: s.characters.map((c) =>
            c.id === id ? { ...c, ...patch } : c
          ),
        })),

      duplicateCharacter: (id) => {
        const original = get().getCharacter(id);
        if (!original) return;
        const copy: StudioCharacter = {
          ...original,
          id: `char-${Date.now()}`,
          name: `${original.name} (copy)`,
          visibility: "private",
          allowOthersToUse: false,
          usedInStories: [],
        };
        get().addCharacter(copy);
      },

      createStoryFromFlow: (data) => {
        const story = createEmptyStory({
          title: data.title,
          description: data.description,
          genre: data.genre,
          visibility: data.visibility,
          audienceRating: data.audienceRating,
          characterIds: data.characterIds,
        });
        const episode = story.episodes[0];
        episode.panels = generatePanelsForEpisode(
          episode.id,
          data.panelCount,
          data.characterIds,
          data.episodePrompt
        );
        episode.title = "Episode 1";
        get().addStory(story);
        data.characterIds.forEach((charId) => {
          const ch = get().getCharacter(charId);
          if (ch && ch.creatorId === MOCK_CREATOR_ID) {
            get().updateCharacter(charId, {
              usedInStories: [...new Set([...ch.usedInStories, story.id])],
            });
          }
        });
        return story.id;
      },

      createCharacterFromForm: (data) => {
        const id = `char-${Date.now()}`;
        const character: StudioCharacter = {
          ...data,
          id,
          creatorId: MOCK_CREATOR_ID,
          creatorName: "You",
          referenceImages: [
            `placeholder-portrait-${id}`,
            `placeholder-fullbody-${id}`,
            `placeholder-expressions-${id}`,
          ],
          usedInStories: [],
          portraitGradient:
            data.portraitGradient ??
            GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)],
        };
        get().addCharacter(character);
        return id;
      },

      setEditorContext: (storyId, episodeId, panelId) => {
        const story = get().getStory(storyId);
        const epId = episodeId ?? story?.episodes[0]?.id ?? null;
        const panel =
          story?.episodes
            .find((e) => e.id === epId)
            ?.panels.find((p) => p.id === panelId) ??
          story?.episodes.find((e) => e.id === epId)?.panels[0];
        set({
          editorStoryId: storyId,
          editorEpisodeId: epId,
          editorPanelId: panel?.id ?? null,
          selectedBubbleId: null,
        });
      },

      setSelectedBubble: (id) => set({ selectedBubbleId: id }),

      updatePanel: (storyId, episodeId, panelId, patch) =>
        set((s) => ({
          stories: s.stories.map((story) => {
            if (story.id !== storyId) return story;
            return {
              ...story,
              updatedAt: new Date().toISOString(),
              episodes: story.episodes.map((ep) => {
                if (ep.id !== episodeId) return ep;
                return {
                  ...ep,
                  panels: ep.panels.map((p) =>
                    p.id === panelId ? { ...p, ...patch } : p
                  ),
                };
              }),
            };
          }),
        })),

      addBubble: (storyId, episodeId, panelId, bubble) => {
        const id = `bubble-${Date.now()}`;
        const newBubble: StudioBubble = { ...bubble, id, panelId };
        set((s) => ({
          stories: s.stories.map((story) => {
            if (story.id !== storyId) return story;
            return {
              ...story,
              episodes: story.episodes.map((ep) => {
                if (ep.id !== episodeId) return ep;
                return {
                  ...ep,
                  panels: ep.panels.map((p) =>
                    p.id === panelId
                      ? { ...p, overlays: [...p.overlays, newBubble] }
                      : p
                  ),
                };
              }),
            };
          }),
          selectedBubbleId: id,
        }));
      },

      updateBubble: (storyId, episodeId, panelId, bubbleId, patch) =>
        set((s) => ({
          stories: s.stories.map((story) => {
            if (story.id !== storyId) return story;
            return {
              ...story,
              episodes: story.episodes.map((ep) => {
                if (ep.id !== episodeId) return ep;
                return {
                  ...ep,
                  panels: ep.panels.map((p) =>
                    p.id === panelId
                      ? {
                          ...p,
                          overlays: p.overlays.map((b) =>
                            b.id === bubbleId ? { ...b, ...patch } : b
                          ),
                        }
                      : p
                  ),
                };
              }),
            };
          }),
        })),

      deleteBubble: (storyId, episodeId, panelId, bubbleId) =>
        set((s) => ({
          stories: s.stories.map((story) => {
            if (story.id !== storyId) return story;
            return {
              ...story,
              episodes: story.episodes.map((ep) => {
                if (ep.id !== episodeId) return ep;
                return {
                  ...ep,
                  panels: ep.panels.map((p) =>
                    p.id === panelId
                      ? {
                          ...p,
                          overlays: p.overlays.filter((b) => b.id !== bubbleId),
                        }
                      : p
                  ),
                };
              }),
            };
          }),
          selectedBubbleId:
            s.selectedBubbleId === bubbleId ? null : s.selectedBubbleId,
        })),

      publishStory: (storyId) =>
        get().updateStory(storyId, {
          status: "published",
          visibility: "public",
        }),

      importCommunityCharacter: (characterId) => {
        const comm = get().communityCharacters.find((c) => c.id === characterId);
        if (!comm) return;
        const imported: StudioCharacter = {
          ...comm,
          id: `imported-${characterId}-${Date.now()}`,
          visibility: "private",
          allowOthersToUse: false,
          attributionRequired: true,
          usedInStories: [],
        };
        get().addCharacter(imported);
      },
    }),
    {
      name: STORAGE_KEY,
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
      partialize: (state) => ({
        stories: state.stories,
        characters: state.characters,
        analytics: state.analytics,
      }),
    }
  )
);
