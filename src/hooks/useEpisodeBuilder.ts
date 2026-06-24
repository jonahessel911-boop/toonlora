"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  EpisodeBuilderInput,
  EpisodePipelinePhase,
  EpisodeScene,
  EpisodeStoryPlan,
} from "@/types/episode-builder";
import {
  isSceneComplete,
  normalizeSceneStatus,
} from "@/types/episode-builder";
import {
  DEFAULT_EPISODE_LENGTH,
  EPISODE_BUILDER_STORAGE_KEY,
  EPISODE_CONTINUE_ON_ERROR,
  EPISODE_IMAGE_FETCH_TIMEOUT_MS,
  EPISODE_IN_DEPTH_FETCH_TIMEOUT_MS,
  EPISODE_PLAN_FETCH_TIMEOUT_MS,
  EPISODE_PROMPT_FETCH_TIMEOUT_MS,
} from "@/lib/episode-builder/constants";
import { fetchJsonWithTimeout } from "@/lib/episode-builder/fetchWithTimeout";
import { saveEpisodeBuilderDraft } from "@/lib/episode-builder/draftStorage";
import { attachReferenceUrls } from "@/lib/episode-builder/continuity";
import { normalizeEpisodePlan } from "@/lib/episode-builder/imagePromptService";
import {
  storyFromEpisodePlan,
} from "@/lib/episode-builder/pushToEditor";
import { useCreatorStore } from "@/store/useCreatorStore";

const DEFAULT_INPUT: EpisodeBuilderInput = {
  description: "",
  episodeLength: DEFAULT_EPISODE_LENGTH,
  addTextInImage: false,
};

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

export function useEpisodeBuilder() {
  const addStory = useCreatorStore((s) => s.addStory);

  const [input, setInput] = useState<EpisodeBuilderInput>(DEFAULT_INPUT);
  const [plan, setPlan] = useState<EpisodeStoryPlan | null>(null);
  const [pipelinePhase, setPipelinePhase] = useState<EpisodePipelinePhase>("idle");
  const [pipelineStep, setPipelineStep] = useState("");
  const [error, setError] = useState("");
  const [draftId, setDraftId] = useState<string | null>(null);
  const [creatingDraft, setCreatingDraft] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [creatingInDepth, setCreatingInDepth] = useState(false);
  const generationCancelRef = useRef(false);
  const imageAbortRef = useRef<AbortController | null>(null);

  const pipelineRunning =
    pipelinePhase === "planning" ||
    pipelinePhase === "creating_prompts" ||
    pipelinePhase === "generating_images";

  useEffect(() => {
    try {
      const raw = localStorage.getItem(EPISODE_BUILDER_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        input?: EpisodeBuilderInput;
        plan?: EpisodeStoryPlan | null;
        draftId?: string | null;
      };
      if (parsed.input) setInput(parsed.input);
      if (parsed.plan) {
        const normalized = normalizePlan(parsed.plan);
        setPlan(normalized);
        const allDone = normalized.scenes.every((s) => isSceneComplete(s.status));
        setPipelinePhase(allDone ? "ready" : "idle");
      }
      if (parsed.draftId) setDraftId(parsed.draftId);
    } catch {
      /* ignore corrupt draft */
    }
  }, []);

  const progress = useMemo(() => {
    if (!plan) return { completed: 0, total: 0, failed: 0 };
    const total = plan.scenes.length;
    const completed = plan.scenes.filter((s) => isSceneComplete(s.status)).length;
    const failed = plan.scenes.filter((s) => s.status === "failed").length;
    return { completed, total, failed };
  }, [plan]);

  const updateInput = useCallback((patch: Partial<EpisodeBuilderInput>) => {
    setInput((prev) => ({ ...prev, ...patch }));
  }, []);

  const applyPlan = useCallback((next: EpisodeStoryPlan) => {
    setPlan(normalizePlan(next));
  }, []);

  const generateImageForScene = useCallback(
    async (
      working: EpisodeStoryPlan,
      sceneId: string,
      cancelled?: { current: boolean }
    ): Promise<EpisodeStoryPlan> => {
      const scene = working.scenes.find((s) => s.id === sceneId);
      if (!scene) return working;
      if (cancelled?.current) return working;

      const generating: EpisodeStoryPlan = {
        ...working,
        scenes: working.scenes.map((s) =>
          s.id === sceneId
            ? { ...s, status: "generating" as const, errorMessage: undefined }
            : s
        ),
      };
      setPlan(normalizePlan(generating));

      imageAbortRef.current = new AbortController();
      const imageTimer = setTimeout(
        () => imageAbortRef.current?.abort(),
        EPISODE_IMAGE_FETCH_TIMEOUT_MS
      );

      try {
        const res = await fetch("/api/creator/episode-builder/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: generating, scene }),
          signal: imageAbortRef.current.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Image generation failed");
        return normalizePlan(data.plan as EpisodeStoryPlan);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          const userStopped = generationCancelRef.current;
          const stopped: EpisodeStoryPlan = {
            ...generating,
            scenes: generating.scenes.map((s) =>
              s.id === sceneId
                ? {
                    ...s,
                    status: userStopped ? ("prompt_ready" as const) : ("failed" as const),
                    errorMessage: userStopped
                      ? undefined
                      : "Image generation timed out",
                  }
                : s
            ),
          };
          setPlan(normalizePlan(stopped));
          return stopped;
        }
        const message = err instanceof Error ? err.message : "Image generation failed";
        const failed: EpisodeStoryPlan = {
          ...generating,
          scenes: generating.scenes.map((s) =>
            s.id === sceneId
              ? { ...s, status: "failed" as const, errorMessage: message }
              : s
          ),
        };
        setPlan(normalizePlan(failed));
        if (!EPISODE_CONTINUE_ON_ERROR) throw err;
        return failed;
      } finally {
        clearTimeout(imageTimer);
        imageAbortRef.current = null;
      }
    },
    []
  );

  const generateImagesSequentially = useCallback(
    async (startingPlan: EpisodeStoryPlan): Promise<EpisodeStoryPlan> => {
      let working = startingPlan;
      for (const scene of working.scenes) {
        if (generationCancelRef.current) break;
        if (isSceneComplete(scene.status) && scene.imageUrl) continue;
        setPipelineStep(`Generating image ${scene.sceneNumber}…`);
        working = await generateImageForScene(
          working,
          scene.id,
          generationCancelRef
        );
        if (generationCancelRef.current) break;
      }
      return working;
    },
    [generateImageForScene]
  );

  const endGeneration = useCallback(() => {
    if (pipelinePhase !== "generating_images") return;

    generationCancelRef.current = true;
    imageAbortRef.current?.abort();

    setPlan((current) => {
      if (!current) return current;
      return normalizePlan({
        ...current,
        scenes: current.scenes.map((s) =>
          s.status === "generating"
            ? { ...s, status: "prompt_ready" as const }
            : s
        ),
      });
    });
    setPipelinePhase("ready");
    setPipelineStep("Generation stopped — partial episode ready");
  }, [pipelinePhase]);

  const generateEpisode = useCallback(async () => {
    if (!input.description.trim() || pipelineRunning) return;

    setError("");
    setPlan(null);
    setDraftId(null);
    generationCancelRef.current = false;
    imageAbortRef.current?.abort();
    setPipelinePhase("planning");
    setPipelineStep("Planning story…");

    try {
      const planRes = await fetchJsonWithTimeout<{ plan?: EpisodeStoryPlan; error?: string }>(
        "/api/creator/episode-builder/plan",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
        EPISODE_PLAN_FETCH_TIMEOUT_MS
      );
      if (!planRes.ok) throw new Error(planRes.data.error ?? "Failed to generate plan");

      let working = normalizePlan(planRes.data.plan as EpisodeStoryPlan);
      working = {
        ...working,
        scenes: working.scenes.map((s) => ({ ...s, status: "planning" as const })),
      };
      setPlan(working);

      setPipelinePhase("creating_prompts");
      setPipelineStep("Creating image prompts…");

      const promptRes = await fetchJsonWithTimeout<{ plan?: EpisodeStoryPlan; error?: string }>(
        "/api/creator/episode-builder/prompt",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: working, mode: "all" }),
        },
        EPISODE_PROMPT_FETCH_TIMEOUT_MS
      );
      if (!promptRes.ok) {
        throw new Error(promptRes.data.error ?? "Failed to create image prompts");
      }
      working = normalizePlan(promptRes.data.plan as EpisodeStoryPlan);
      setPlan(working);

      setPipelinePhase("generating_images");
      working = await generateImagesSequentially(working);
      applyPlan(working);

      const stopped = generationCancelRef.current;
      const allDone = working.scenes.every((s) => isSceneComplete(s.status));
      const anyFailed = working.scenes.some((s) => s.status === "failed");
      if (!stopped) {
        setPipelinePhase("ready");
        setPipelineStep(
          allDone
            ? "Episode ready"
            : anyFailed
              ? "Episode complete with errors"
              : "Episode ready"
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Episode generation failed");
      setPipelinePhase("error");
      setPipelineStep("");
    }
  }, [applyPlan, generateImagesSequentially, input, pipelineRunning]);

  const regenerateImage = useCallback(
    async (sceneId: string) => {
      if (!plan || pipelineRunning) return;
      setPipelinePhase("generating_images");
      setError("");
      const working = await generateImageForScene(plan, sceneId);
      applyPlan(working);
      setPipelinePhase(
        working.scenes.every((s) => isSceneComplete(s.status) || s.status === "failed")
          ? "ready"
          : "idle"
      );
      setPipelineStep("Episode ready");
    },
    [applyPlan, generateImageForScene, plan, pipelineRunning]
  );

  const createDraft = useCallback(async () => {
    if (!plan || creatingDraft) return;
    setCreatingDraft(true);
    setError("");
    try {
      const id = saveEpisodeBuilderDraft(plan, input);
      const story = storyFromEpisodePlan(plan, { storyId: id });
      addStory(story);
      localStorage.setItem(
        EPISODE_BUILDER_STORAGE_KEY,
        JSON.stringify({ input, plan, draftId: id })
      );
      setDraftId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create draft");
    } finally {
      setCreatingDraft(false);
    }
  }, [addStory, creatingDraft, input, plan]);

  const loadPreset = useCallback((description: string) => {
    setInput((prev) => ({ ...prev, description }));
    setPlan(null);
    setDraftId(null);
    setPipelinePhase("idle");
    setPipelineStep("");
  }, []);

  const enhanceDescription = useCallback(async () => {
    if (!input.description.trim() || enhancing || pipelineRunning) return;

    setEnhancing(true);
    setError("");
    try {
      const res = await fetch("/api/creator/episode-builder/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to enhance description");
      }
      setInput((prev) => ({
        ...prev,
        description: String(data.enhancedDescription ?? prev.description),
      }));
      setPlan(null);
      setDraftId(null);
      setPipelinePhase("idle");
      setPipelineStep("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enhancement failed");
    } finally {
      setEnhancing(false);
    }
  }, [enhancing, input, pipelineRunning]);

  const createInDepth = useCallback(async () => {
    const topic = (input.seriesTopic ?? input.description).trim();
    if (!topic || creatingInDepth || pipelineRunning || enhancing) return;

    setCreatingInDepth(true);
    setError("");
    setPipelineStep("Researching and writing in-depth script…");
    try {
      const res = await fetchJsonWithTimeout<{
        description?: string;
        error?: string;
        research_sources?: string[];
      }>(
        "/api/creator/episode-builder/in-depth",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic,
            description: input.description,
            episode: input.episodeNumber ?? 1,
            episodeTitle: input.episodeTitle?.trim() || undefined,
            episodeLength: input.episodeLength,
          }),
        },
        EPISODE_IN_DEPTH_FETCH_TIMEOUT_MS
      );
      if (!res.ok) {
        throw new Error(res.data.error ?? "In-depth script generation failed");
      }
      setInput((prev) => ({
        ...prev,
        description: String(res.data.description ?? prev.description),
        seriesTopic: topic,
      }));
      setPlan(null);
      setDraftId(null);
      setPipelinePhase("idle");
      setPipelineStep("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "In-depth script failed");
      setPipelineStep("");
    } finally {
      setCreatingInDepth(false);
    }
  }, [creatingInDepth, enhancing, input, pipelineRunning]);

  return {
    input,
    updateInput,
    plan,
    pipelinePhase,
    pipelineStep,
    pipelineRunning,
    error,
    progress,
    draftId,
    creatingDraft,
    generateEpisode,
    regenerateImage,
    createDraft,
    loadPreset,
    enhanceDescription,
    enhancing,
    createInDepth,
    creatingInDepth,
    endGeneration,
  };
}
