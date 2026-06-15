import type { StudioPanel } from "@/types/creator";
import type {
  ComicGenerationPayload,
  ComicGenerationJob,
} from "@/types/creator";
import type { CreatorCharacterInput } from "@/lib/creator/studioPanelPrompt";
import type { CreatorPanelScript } from "@/lib/creator/studioPanelPrompt";
import { useCreatorStore } from "@/store/useCreatorStore";

export type GeneratePanelsPayload = ComicGenerationPayload;

const runningJobs = new Set<string>();

async function postJson<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/creator/generate-panels", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? "Request failed");
  }
  return data;
}

export async function requestPanelBreakdown(payload: ComicGenerationPayload) {
  return postJson<{
    scripts: CreatorPanelScript[];
    slots: Array<{ id: string; order: number }>;
    panelCount: number;
  }>({ mode: "breakdown", ...payload });
}

export async function requestGeneratePanelFromScript(
  payload: ComicGenerationPayload & {
    panelId: string;
    panelOrder: number;
    panelScript: CreatorPanelScript;
    panelCount?: number;
  }
): Promise<StudioPanel> {
  const data = await postJson<{ panel: StudioPanel }>({
    mode: "panel",
    ...payload,
    panelCount: payload.panelCount ?? payload.panelOrder,
  });
  return data.panel;
}

export async function notifyComicReady(
  email: string,
  storyId: string,
  storyTitle: string
): Promise<void> {
  if (!email.trim()) return;
  await fetch("/api/creator/notify-ready", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, storyId, storyTitle }),
  });
}

function progressForStep(
  completedPanels: number,
  totalPanels: number,
  phase: "breakdown" | "panel"
): number {
  if (phase === "breakdown") return 8;
  const panelShare = 92 / totalPanels;
  return Math.min(99, Math.round(8 + completedPanels * panelShare));
}

export function runComicGeneration(jobId: string): void {
  if (runningJobs.has(jobId)) return;
  runningJobs.add(jobId);

  void (async () => {
    const store = useCreatorStore.getState();
    const job = store.generationJobs.find((j) => j.id === jobId);
    if (!job || job.status !== "running") {
      runningJobs.delete(jobId);
      return;
    }

    const update = (patch: Partial<ComicGenerationJob>) => {
      useCreatorStore.getState().updateGenerationJob(jobId, patch);
    };

    try {
      update({
        progress: 3,
        message: "Creating your Lora…",
        completedPanels: 0,
      });

      const { scripts, slots } = await requestPanelBreakdown(job.payload);
      const total = slots.length;

      update({
        progress: progressForStep(0, total, "breakdown"),
        message: `Writing script for ${total} panels…`,
      });

      const completed: StudioPanel[] = [];

      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        const script = scripts[i] ?? {
          panel_number: slot.order,
          visual: `${job.payload.episodePrompt} — panel ${slot.order}`,
          emotion: "story moment",
        };

        update({
          progress: progressForStep(i, total, "panel"),
          message: `Painting panel ${i + 1} of ${total}…`,
          completedPanels: i,
        });

        const panel = await requestGeneratePanelFromScript({
          ...job.payload,
          panelId: slot.id,
          panelOrder: slot.order,
          panelScript: script,
          panelCount: total,
        });

        completed.push(panel);
        useCreatorStore
          .getState()
          .setEpisodePanels(job.storyId, job.episodeId, [...completed]);
      }

      await notifyComicReady(job.notifyEmail, job.storyId, job.title);

      update({
        status: "completed",
        progress: 100,
        message: "Your Lora is ready!",
        completedPanels: total,
      });
    } catch (err) {
      update({
        status: "failed",
        error: err instanceof Error ? err.message : "Generation failed",
        message: "Generation failed",
      });
    } finally {
      runningJobs.delete(jobId);
    }
  })();
}

export function resumeRunningGenerations(): void {
  const jobs = useCreatorStore
    .getState()
    .generationJobs.filter((j) => j.status === "running");
  for (const job of jobs) {
    runComicGeneration(job.id);
  }
}

export async function requestGeneratePanels(
  payload: ComicGenerationPayload
): Promise<StudioPanel[]> {
  const { scripts, slots } = await requestPanelBreakdown(payload);
  const panels: StudioPanel[] = [];
  for (let i = 0; i < slots.length; i++) {
    const panel = await requestGeneratePanelFromScript({
      ...payload,
      panelId: slots[i].id,
      panelOrder: slots[i].order,
      panelScript: scripts[i],
    });
    panels.push(panel);
  }
  return panels;
}

export async function requestRegeneratePanel(payload: {
  storyId: string;
  episodeId: string;
  title: string;
  genre: string;
  episodePrompt: string;
  panelId: string;
  panelPrompt: string;
  panelOrder: number;
  characters: CreatorCharacterInput[];
  characterIds: string[];
}): Promise<StudioPanel> {
  const res = await fetch("/api/creator/generate-panels", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "single", ...payload }),
  });
  const data = (await res.json()) as { panel?: StudioPanel; error?: string };
  if (!res.ok || !data.panel) {
    throw new Error(data.error ?? "Panel regeneration failed");
  }
  return data.panel;
}

export async function requestAddPanel(payload: {
  storyId: string;
  episodeId: string;
  title: string;
  genre: string;
  episodePrompt: string;
  panelId: string;
  panelOrder: number;
  characters: CreatorCharacterInput[];
  characterIds: string[];
  previousPanelsSummary: string;
  existingPanels: Array<{ id: string; order: number }>;
}): Promise<StudioPanel> {
  const res = await fetch("/api/creator/generate-panels", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "add", ...payload }),
  });
  const data = (await res.json()) as { panel?: StudioPanel; error?: string };
  if (!res.ok || !data.panel) {
    throw new Error(data.error ?? "Failed to add panel");
  }
  return data.panel;
}

export function charactersToApiInput(
  characterIds: string[],
  getCharacter: (id: string) =>
    | {
        name: string;
        visualDescription: string;
        outfit: string;
        role: string;
      }
    | undefined
): CreatorCharacterInput[] {
  return characterIds
    .map((id) => getCharacter(id))
    .filter(Boolean)
    .map((c) => ({
      name: c!.name,
      visualDescription: c!.visualDescription,
      outfit: c!.outfit,
      role: c!.role,
    }));
}