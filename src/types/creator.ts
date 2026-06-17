export type StudioVisibility = "private" | "public" | "unlisted";
export type StoryStatus = "draft" | "published" | "private";
export type CharacterVisibility = "private" | "public";
export type CharacterGender = "woman" | "man";

export type BodyType = "slim" | "athletic" | "curvy" | "broad";

export type CharacterRole =
  | "main character"
  | "love interest"
  | "villain"
  | "friend"
  | "side character"
  | "mentor";
export type BubbleType = "speech" | "thought" | "narration" | "sfx";
export type BubbleTail =
  | "left"
  | "right"
  | "bottom-left"
  | "bottom-right"
  | "none";
export type BubbleStyle = "default" | "soft" | "dramatic" | "whisper";

export interface StudioBubble {
  id: string;
  panelId: string;
  type: BubbleType;
  characterId?: string;
  text: string;
  x: number;
  y: number;
  width: number;
  tail: BubbleTail;
  style: BubbleStyle;
}

export interface StudioPanel {
  id: string;
  episodeId: string;
  imageUrl?: string;
  gradient: string;
  prompt: string;
  characterIds: string[];
  overlays: StudioBubble[];
  order: number;
  status: "draft" | "ready" | "generating";
}

export interface StudioEpisode {
  id: string;
  storyId: string;
  title: string;
  panels: StudioPanel[];
  status: "draft" | "published";
}

export interface StudioStory {
  id: string;
  title: string;
  description: string;
  genre: string;
  coverUrl?: string;
  coverGradient: string;
  status: StoryStatus;
  visibility: StudioVisibility;
  audienceRating: string;
  episodes: StudioEpisode[];
  characterIds: string[];
  allowInspiredVersions: boolean;
  allowPublicCharacterUse: boolean;
  requireAttribution: boolean;
  allowComments: boolean;
  createdAt: string;
  updatedAt: string;
  reads: number;
  likes: number;
}

import type { CharacterAppearance } from "@/lib/creator/characterAppearance";

export interface StudioCharacter {
  id: string;
  name: string;
  creatorId: string;
  creatorName: string;
  visibility: CharacterVisibility;
  gender: CharacterGender;
  appearance: CharacterAppearance;
  role: CharacterRole;
  personality: string;
  visualDescription: string;
  outfit: string;
  colorPalette: string[];
  styleTheme: string;
  consistencyPrompt: string;
  referenceImages: string[];
  portraitUrl?: string;
  usedInStories: string[];
  allowOthersToUse: boolean;
  attributionRequired: boolean;
  shortDescription: string;
  ageRange: string;
  portraitGradient: string;
  /** Public listing id — separate from owner copy so edits do not collide. */
  publishedCharacterId?: string;
  /** Frozen public snapshot — hidden from the creator's working character list. */
  archivedPublicSnapshot?: boolean;
}

export interface CreatorAnalytics {
  reads: number;
  likes: number;
  followers: number;
  remixes: number;
  completionRate: number;
  comments: number;
  inspiredVersions: number;
  characterUses: number;
}

export type StudioSection =
  | "overview"
  | "stories"
  | "characters"
  | "settings";

export interface PublishSettings {
  visibility: StudioVisibility;
  allowInspiredVersions: boolean;
  allowPublicCharacterUse: boolean;
  requireAttribution: boolean;
  allowComments: boolean;
}

export type ComicGenerationStatus = "running" | "completed" | "failed";

export interface ComicGenerationJob {
  id: string;
  storyId: string;
  episodeId: string;
  title: string;
  status: ComicGenerationStatus;
  progress: number;
  message: string;
  panelCount: number;
  completedPanels: number;
  notifyEmail: string;
  error?: string;
  createdAt: string;
  payload: ComicGenerationPayload;
}

export interface ComicGenerationPayload {
  storyId: string;
  episodeId: string;
  title: string;
  genre: string;
  description?: string;
  episodePrompt: string;
  panelCount: number;
  characters: import("@/lib/creator/studioPanelPrompt").CreatorCharacterInput[];
  characterIds: string[];
  existingPanels: Array<{ id: string; order: number }>;
}
