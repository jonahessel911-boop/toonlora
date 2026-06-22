"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  COMMUNITY_CHARACTERS,
  INITIAL_CHARACTERS,
  MOCK_ANALYTICS,
  MOCK_CREATOR_ID,
  createEmptyStory,
  filterUserStories,
  generatePanelsForEpisode,
  ensureCharacter,
} from "@/lib/creator/mockData";
import type {
  StudioBubble,
  StudioCharacter,
  StudioPanel,
  StudioSection,
  StudioStory,
  StudioVisibility,
  ComicGenerationJob,
  ComicGenerationPayload,
} from "@/types/creator";

const STORAGE_KEY = "toonlora-creator-studio-v2";

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
  generationJobs: ComicGenerationJob[];

  setSection: (section: StudioSection) => void;
  getStory: (id: string) => StudioStory | undefined;
  getCharacter: (id: string) => StudioCharacter | undefined;
  getMyCharacters: () => StudioCharacter[];
  getMyStories: () => StudioStory[];
  getPublicCharacters: () => StudioCharacter[];

  addStory: (story: StudioStory) => void;
  updateStory: (id: string, patch: Partial<StudioStory>) => void;
  addCharacter: (character: StudioCharacter) => void;
  updateCharacter: (id: string, patch: Partial<StudioCharacter>) => void;
  saveCharacterEdits: (
    id: string,
    patch: Partial<StudioCharacter>
  ) => string;
  duplicateCharacter: (id: string) => void;
  deleteCharacter: (id: string) => void;

  setEpisodePanels: (
    storyId: string,
    episodeId: string,
    panels: StudioPanel[]
  ) => void;
  addPanelToEpisode: (
    storyId: string,
    episodeId: string,
    panel: StudioPanel
  ) => void;
  duplicatePanel: (storyId: string, episodeId: string, panelId: string) => void;
  deletePanel: (storyId: string, episodeId: string, panelId: string) => void;

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
      | "usedInStories"
      | "portraitGradient"
    >
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

  addGenerationJob: (job: ComicGenerationJob) => void;
  updateGenerationJob: (
    jobId: string,
    patch: Partial<ComicGenerationJob>
  ) => void;
  dismissGenerationJob: (jobId: string) => void;
  getActiveGenerationJobs: () => ComicGenerationJob[];
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
      stories: [],
      characters: INITIAL_CHARACTERS,
      communityCharacters: COMMUNITY_CHARACTERS,
      analytics: MOCK_ANALYTICS,
      editorStoryId: null,
      editorEpisodeId: null,
      editorPanelId: null,
      selectedBubbleId: null,
      generationJobs: [],

      setSection: (section) => set({ activeSection: section }),

      getStory: (id) => get().stories.find((s) => s.id === id),
      getCharacter: (id) =>
        get().characters.find((c) => c.id === id) ??
        get().communityCharacters.find((c) => c.id === id),

      getMyCharacters: () =>
        get().characters.filter(
          (c) => c.creatorId === MOCK_CREATOR_ID && !c.archivedPublicSnapshot
        ),

      getMyStories: () => filterUserStories(get().stories),

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

      saveCharacterEdits: (id, patch) => {
        const current = get().getCharacter(id);
        if (!current) return id;

        const nextVisibility = patch.visibility ?? current.visibility;
        const becomingPublic =
          nextVisibility === "public" && current.visibility !== "public";
        const editingPublicSnapshot = current.visibility === "public";

        const remapStories = (fromId: string, toId: string) => {
          set((s) => ({
            stories: s.stories.map((story) => ({
              ...story,
              characterIds: story.characterIds.map((characterId) =>
                characterId === fromId ? toId : characterId
              ),
            })),
          }));
        };

        if (editingPublicSnapshot) {
          const newId = `char-${Date.now()}`;
          const forked = ensureCharacter({
            ...current,
            ...patch,
            id: newId,
            visibility: nextVisibility === "public" ? "private" : nextVisibility,
            publishedCharacterId: current.publishedCharacterId ?? `pub-${Date.now()}`,
            usedInStories: [...current.usedInStories],
            archivedPublicSnapshot: false,
          });
          get().updateCharacter(id, { archivedPublicSnapshot: true });
          get().addCharacter(forked);
          remapStories(id, newId);
          return newId;
        }

        const publishedCharacterId = becomingPublic
          ? `pub-${Date.now()}`
          : patch.publishedCharacterId ?? current.publishedCharacterId;

        get().updateCharacter(id, {
          ...patch,
          visibility: nextVisibility,
          ...(publishedCharacterId ? { publishedCharacterId } : {}),
          allowOthersToUse:
            patch.allowOthersToUse ??
            (nextVisibility === "public" ? current.allowOthersToUse : false),
        });

        return id;
      },

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

      deleteCharacter: (id) => {
        const owned = get().characters.find((c) => c.id === id);
        if (!owned || owned.creatorId !== MOCK_CREATOR_ID) return;
        set((s) => ({
          characters: s.characters.filter((c) => c.id !== id),
          stories: s.stories.map((story) => ({
            ...story,
            characterIds: story.characterIds.filter((cid) => cid !== id),
          })),
        }));
      },

      setEpisodePanels: (storyId, episodeId, panels) =>
        set((s) => ({
          stories: s.stories.map((story) => {
            if (story.id !== storyId) return story;
            return {
              ...story,
              updatedAt: new Date().toISOString(),
              episodes: story.episodes.map((ep) =>
                ep.id === episodeId ? { ...ep, panels } : ep
              ),
            };
          }),
        })),

      addPanelToEpisode: (storyId, episodeId, panel) =>
        set((s) => ({
          stories: s.stories.map((story) => {
            if (story.id !== storyId) return story;
            return {
              ...story,
              updatedAt: new Date().toISOString(),
              episodes: story.episodes.map((ep) =>
                ep.id === episodeId
                  ? { ...ep, panels: [...ep.panels, panel] }
                  : ep
              ),
            };
          }),
        })),

      duplicatePanel: (storyId, episodeId, panelId) => {
        const story = get().getStory(storyId);
        const ep = story?.episodes.find((e) => e.id === episodeId);
        const original = ep?.panels.find((p) => p.id === panelId);
        if (!original || !ep) return;
        const newId = `${episodeId}-panel-${Date.now()}`;
        const copy: StudioPanel = {
          ...original,
          id: newId,
          order: ep.panels.length + 1,
          overlays: original.overlays.map((b) => ({
            ...b,
            id: `bubble-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            panelId: newId,
          })),
        };
        get().addPanelToEpisode(storyId, episodeId, copy);
        get().setEditorContext(storyId, episodeId, copy.id);
      },

      deletePanel: (storyId, episodeId, panelId) => {
        const story = get().getStory(storyId);
        const ep = story?.episodes.find((e) => e.id === episodeId);
        if (!ep || ep.panels.length <= 1) return;
        const remaining = ep.panels
          .filter((p) => p.id !== panelId)
          .map((p, i) => ({ ...p, order: i + 1 }));
        get().setEpisodePanels(storyId, episodeId, remaining);
        const next = remaining[0];
        if (next) get().setEditorContext(storyId, episodeId, next.id);
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
        const publishedCharacterId =
          data.visibility === "public" ? `pub-${Date.now()}` : undefined;
        const character: StudioCharacter = ensureCharacter({
          ...data,
          id,
          creatorId: MOCK_CREATOR_ID,
          creatorName: "You",
          referenceImages: data.referenceImages ?? [],
          usedInStories: [],
          portraitGradient: GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)],
          publishedCharacterId,
          allowOthersToUse:
            data.visibility === "public" ? data.allowOthersToUse : false,
        });
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

      addGenerationJob: (job) =>
        set((s) => ({ generationJobs: [job, ...s.generationJobs] })),

      updateGenerationJob: (jobId, patch) =>
        set((s) => ({
          generationJobs: s.generationJobs.map((job) =>
            job.id === jobId ? { ...job, ...patch } : job
          ),
        })),

      dismissGenerationJob: (jobId) =>
        set((s) => ({
          generationJobs: s.generationJobs.filter((job) => job.id !== jobId),
        })),

      getActiveGenerationJobs: () =>
        get().generationJobs.filter(
          (job) => job.status === "running" || job.status === "completed"
        ),
    }),
    {
      name: STORAGE_KEY,
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.hydrated = true;
        state.characters = state.characters.map(ensureCharacter);
        state.stories = filterUserStories(state.stories);
        const sections = ["overview", "stories", "characters", "settings"];
        if ((state.activeSection as string) === "coins") {
          state.activeSection = "settings";
        } else if (!sections.includes(state.activeSection)) {
          state.activeSection = "overview";
        }
        state.generationJobs = (state.generationJobs ?? []).map((job) =>
          job.status === "running"
            ? { ...job, status: "failed" as const, error: "Generation was interrupted. Please try again." }
            : job
        );
      },
      partialize: (state) => ({
        stories: filterUserStories(state.stories),
        characters: state.characters,
        analytics: state.analytics,
        generationJobs: state.generationJobs.filter(
          (j) => j.status === "running" || j.status === "completed"
        ),
      }),
    }
  )
);
