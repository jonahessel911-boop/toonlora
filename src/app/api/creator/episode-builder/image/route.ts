import { NextResponse } from "next/server";
import type { EpisodeScene, EpisodeStoryPlan } from "@/types/episode-builder";
import { attachReferenceUrls } from "@/lib/episode-builder/continuity";
import { generateSingleImage } from "@/lib/episode-builder/imageGenerationService";

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const plan = body.plan as EpisodeStoryPlan | undefined;
    const scene = body.scene as EpisodeScene | undefined;

    if (!plan?.scenes?.length || !scene) {
      return NextResponse.json(
        { error: "Valid plan and scene required" },
        { status: 400 }
      );
    }

    const current = plan.scenes.find((s) => s.id === scene.id);
    if (!current) {
      return NextResponse.json({ error: "Scene not found in plan" }, { status: 404 });
    }

    const prompt = body.imagePrompt
      ? String(body.imagePrompt)
      : current.imagePrompt;

    const sceneWithPrompt = { ...current, imagePrompt: prompt };
    const { imageUrl, referenceImageUrls } = await generateSingleImage(
      sceneWithPrompt,
      plan
    );

    const scenes = attachReferenceUrls(
      plan.scenes.map((s) =>
        s.id === scene.id
          ? {
              ...s,
              imagePrompt: prompt,
              imageUrl,
              referenceImageUrls,
              status: "done" as const,
              errorMessage: undefined,
            }
          : s
      )
    );

    return NextResponse.json({
      plan: { ...plan, scenes, updatedAt: new Date().toISOString() },
      imageUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Image generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
