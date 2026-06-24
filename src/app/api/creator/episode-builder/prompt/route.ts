import { NextResponse } from "next/server";
import type { EpisodeScene, EpisodeStoryPlan, PromptTweakAction } from "@/types/episode-builder";
import { generateScenePrompt } from "@/lib/episode-builder/imageGenerationService";
import { applyPromptToAllScenes } from "@/lib/episode-builder/imagePromptService";

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const mode = body.mode as "single" | "all" | undefined;
    const plan = body.plan as EpisodeStoryPlan | undefined;

    if (!plan?.scenes?.length) {
      return NextResponse.json({ error: "Valid story plan required" }, { status: 400 });
    }

    if (mode === "all") {
      const updated = applyPromptToAllScenes(plan);
      return NextResponse.json({ plan: updated });
    }

    const scene = body.scene as EpisodeScene | undefined;
    if (!scene) {
      return NextResponse.json({ error: "Scene required" }, { status: 400 });
    }

    const tweaks = (body.tweaks as PromptTweakAction[] | undefined) ?? [];
    const useLlm = body.useLlm !== false;
    const imagePrompt = await generateScenePrompt(scene, plan, { tweaks, useLlm });

    const scenes = plan.scenes.map((s) =>
      s.id === scene.id
        ? {
            ...s,
            imagePrompt,
            status: s.status === "done" ? s.status : ("prompt_ready" as const),
          }
        : s
    );

    return NextResponse.json({
      plan: { ...plan, scenes, updatedAt: new Date().toISOString() },
      imagePrompt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Prompt generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
