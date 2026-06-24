import { NextResponse } from "next/server";
import type { EpisodeBuilderInput, EpisodeStoryPlan } from "@/types/episode-builder";
import { improveStoryPlan } from "@/lib/episode-builder/storyQualityService";
import { normalizeEpisodePlan } from "@/lib/episode-builder/imagePromptService";
import { normalizeEpisodeInput } from "@/lib/episode-builder/storyPlannerService";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      plan?: EpisodeStoryPlan;
      input?: Partial<EpisodeBuilderInput>;
      weakAreas?: string[];
    };

    if (!body.plan?.scenes?.length) {
      return NextResponse.json({ error: "Plan is required" }, { status: 400 });
    }

    const input = normalizeEpisodeInput({
      description: body.input?.description ?? body.plan.input.description,
      episodeLength: body.input?.episodeLength ?? body.plan.input.episodeLength,
    });

    const weakAreas = body.weakAreas?.length
      ? body.weakAreas
      : ["Improve concrete events, text specificity, and cliffhanger"];

    const plan = await improveStoryPlan(
      normalizeEpisodePlan(body.plan),
      input,
      weakAreas
    );

    return NextResponse.json({ plan });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Story improvement failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
