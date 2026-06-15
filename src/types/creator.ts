export type StudioVisibility = "private" | "public" | "unlisted";
export type StoryStatus = "draft" | "published" | "private";
export type CharacterVisibility = "private" | "public";
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

export interface StudioCharacter {
  id: string;
  name: string;
  creatorId: string;
  creatorName: string;
  visibility: CharacterVisibility;
  role: CharacterRole;
  personality: string;
  visualDescription: string;
  outfit: string;
  colorPalette: string[];
  styleTheme: string;
  consistencyPrompt: string;
  referenceImages: string[];
  usedInStories: string[];
  allowOthersToUse: boolean;
  attributionRequired: boolean;
  shortDescription: string;
  ageRange: string;
  portraitGradient: string;
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
  | "editor"
  | "covers"
  | "published"
  | "community"
  | "analytics"
  | "settings";

export interface PublishSettings {
  visibility: StudioVisibility;
  allowInspiredVersions: boolean;
  allowPublicCharacterUse: boolean;
  requireAttribution: boolean;
  allowComments: boolean;
}
