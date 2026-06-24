import type {
  EpisodeScene,
  EpisodeStoryPlan,
  PromptTweakAction,
} from "@/types/episode-builder";
import {
  applyTweakToPrompt,
  buildImagePromptFromScene,
  buildScenePromptRegeneratorPrompt,
  planAddsTextInImage,
} from "@/lib/episode-builder/imagePromptService";
import { finalizeEpisodeImagePrompt } from "@/lib/episode-builder/prompts";
import {
  attachReferenceUrls,
  getPrimaryReferenceUrl,
  getReferenceImageUrls,
} from "@/lib/episode-builder/continuity";
import {
  callOpenAIEpisodeBuilderScene,
  callOpenAIChat,
  hasOpenAIKey,
} from "@/lib/engine/openai-client";

function parsePromptJson(raw: string): string {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1) return trimmed;
  const parsed = JSON.parse(trimmed.slice(start, end + 1)) as {
    imagePrompt?: string;
  };
  return parsed.imagePrompt?.trim() || trimmed;
}

export async function generateScenePrompt(
  scene: EpisodeScene,
  plan: EpisodeStoryPlan,
  options?: { tweaks?: PromptTweakAction[]; useLlm?: boolean }
): Promise<string> {
  const linked = attachReferenceUrls(plan.scenes).find((s) => s.id === scene.id)!;
  const tweaks = options?.tweaks ?? [];

  let prompt = linked.promptLocked
    ? linked.imagePrompt
    : buildImagePromptFromScene(linked, plan);

  for (const tweak of tweaks) {
    prompt = applyTweakToPrompt(prompt, tweak);
  }

  const wantsLlm =
    options?.useLlm !== false &&
    hasOpenAIKey() &&
    (tweaks.some((t) => t !== "lock-prompt" && t !== "lock-character") ||
      !linked.promptLocked);

  if (wantsLlm && hasOpenAIKey()) {
    const regenPrompt = buildScenePromptRegeneratorPrompt({
      scene: linked,
      plan,
      tweaks,
      previousPrompt: prompt,
    });
    const raw = await callOpenAIChat({ prompt: regenPrompt, json: true });
    prompt = finalizeEpisodeImagePrompt(
      parsePromptJson(raw),
      planAddsTextInImage(plan)
    );
  }

  return finalizeEpisodeImagePrompt(prompt, planAddsTextInImage(plan));
}

export async function generateAllScenePrompts(
  plan: EpisodeStoryPlan
): Promise<EpisodeStoryPlan> {
  const scenes: EpisodeScene[] = [];

  for (const scene of plan.scenes) {
    if (scene.promptLocked) {
      scenes.push(scene);
      continue;
    }
    const imagePrompt = await generateScenePrompt(scene, {
      ...plan,
      scenes: attachReferenceUrls([...scenes, ...plan.scenes.slice(scenes.length)]),
    }, { useLlm: false });
    scenes.push({
      ...scene,
      imagePrompt,
      status: scene.status === "done" ? "done" : "prompt_ready",
    });
  }

  return {
    ...plan,
    scenes: attachReferenceUrls(scenes),
    updatedAt: new Date().toISOString(),
  };
}

export async function generateSingleImage(
  scene: EpisodeScene,
  plan: EpisodeStoryPlan
): Promise<{ imageUrl: string; referenceImageUrls: string[] }> {
  const refs = getReferenceImageUrls(scene.sceneNumber, plan.scenes);
  const primaryRef = getPrimaryReferenceUrl(scene.sceneNumber, plan.scenes);

  if (!hasOpenAIKey()) {
    // Placeholder gradient panel for local dev without API key
    const hue = (scene.sceneNumber * 37) % 360;
    return {
      imageUrl: `data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="640" viewBox="0 0 400 640">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="hsl(${hue},70%,45%)"/>
              <stop offset="100%" stop-color="hsl(${(hue + 40) % 360},60%,30%)"/>
            </linearGradient>
          </defs>
          <rect width="400" height="640" fill="url(#g)"/>
          <text x="200" y="300" fill="white" font-size="18" font-family="sans-serif" text-anchor="middle">Scene ${scene.sceneNumber}</text>
          <text x="200" y="330" fill="rgba(255,255,255,0.8)" font-size="12" font-family="sans-serif" text-anchor="middle">Mock — add OPENAI_API_KEY</text>
        </svg>`
      )}`,
      referenceImageUrls: refs,
    };
  }

  const addTextInImage = planAddsTextInImage(plan);
  const imagePrompt = finalizeEpisodeImagePrompt(
    scene.promptLocked && scene.imagePrompt.trim()
      ? scene.imagePrompt
      : buildImagePromptFromScene(scene, plan),
    addTextInImage
  );

  const imageUrl = await callOpenAIEpisodeBuilderScene(
    imagePrompt,
    plan.id,
    scene.id,
    primaryRef,
    undefined,
    addTextInImage
  );

  return { imageUrl, referenceImageUrls: refs };
}

export async function generateAllImages(
  plan: EpisodeStoryPlan,
  onProgress?: (sceneNumber: number, total: number) => void
): Promise<EpisodeStoryPlan> {
  let working = { ...plan, scenes: [...plan.scenes] };

  for (let i = 0; i < working.scenes.length; i++) {
    const scene = working.scenes[i];
    if (scene.imageUrl && scene.status === "done") continue;

    onProgress?.(scene.sceneNumber, working.scenes.length);

    working = {
      ...working,
      scenes: working.scenes.map((s) =>
        s.id === scene.id ? { ...s, status: "generating" as const, errorMessage: undefined } : s
      ),
    };

    try {
      const { imageUrl } = await generateSingleImage(scene, working);
      working = {
        ...working,
        scenes: attachReferenceUrls(
          working.scenes.map((s) =>
            s.id === scene.id
              ? {
                  ...s,
                  imageUrl,
                  status: "done" as const,
                  referenceImageUrls: getReferenceImageUrls(
                    s.sceneNumber,
                    working.scenes.map((x) =>
                      x.id === s.id ? { ...x, imageUrl } : x
                    )
                  ),
                }
              : s
          )
        ),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Image generation failed";
      working = {
        ...working,
        scenes: working.scenes.map((s) =>
          s.id === scene.id
            ? { ...s, status: "failed" as const, errorMessage: message }
            : s
        ),
      };
    }
  }

  return { ...working, updatedAt: new Date().toISOString() };
}
