import type { EpisodeBuilderInput, EpisodeStoryPlan } from "@/types/episode-builder";
import { attachReferenceUrls } from "@/lib/episode-builder/continuity";
import { normalizeEpisodePlan } from "@/lib/episode-builder/imagePromptService";
import { normalizeSceneStatus } from "@/types/episode-builder";

export const EPISODE_BUILDER_DRAFTS_KEY = "toonlora-episode-builder-drafts";

export interface EpisodeBuilderDraftRecord {
  draftId: string;
  plan: EpisodeStoryPlan;
  input: EpisodeBuilderInput;
  createdAt: string;
}

type DraftIndex = Record<string, EpisodeBuilderDraftRecord>;

function normalizePlan(plan: EpisodeStoryPlan): EpisodeStoryPlan {
  return normalizeEpisodePlan({
    ...plan,
    scenes: attachReferenceUrls(
      plan.scenes.map((s) => ({
        ...s,
        status: normalizeSceneStatus(s.status),
      }))
    ),
  });
}

export function saveEpisodeBuilderDraft(
  plan: EpisodeStoryPlan,
  input: EpisodeBuilderInput
): string {
  if (typeof window === "undefined") return plan.id;

  const draftId = plan.id;
  const record: EpisodeBuilderDraftRecord = {
    draftId,
    plan: normalizePlan(plan),
    input,
    createdAt: new Date().toISOString(),
  };

  const raw = localStorage.getItem(EPISODE_BUILDER_DRAFTS_KEY);
  const index: DraftIndex = raw ? (JSON.parse(raw) as DraftIndex) : {};
  index[draftId] = record;
  localStorage.setItem(EPISODE_BUILDER_DRAFTS_KEY, JSON.stringify(index));
  return draftId;
}

export function getEpisodeBuilderDraft(
  draftId: string
): EpisodeBuilderDraftRecord | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(EPISODE_BUILDER_DRAFTS_KEY);
    if (!raw) return null;
    const index = JSON.parse(raw) as DraftIndex;
    const record = index[draftId];
    if (!record) return null;
    return {
      ...record,
      plan: normalizePlan(record.plan),
    };
  } catch {
    return null;
  }
}

export function episodeDraftReaderPath(draftId: string): string {
  return `/creator/episode-builder/draft/${draftId}`;
}
