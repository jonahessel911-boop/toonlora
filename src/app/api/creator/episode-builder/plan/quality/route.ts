import { NextResponse } from "next/server";
import type { EpisodeBuilderInput, EpisodeStoryPlan } from "@/types/episode-builder";
import { evaluateStoryQuality } from "@/lib/episode-builder/storyQualityService";
import { normalizeEpisodePlan } from "@/lib/episode-builder/imagePromptService";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      plan?: EpisodeStoryPlan;
    };

    if (!body.plan?.scenes?.length) {
      return NextResponse.json({ error: "Plan is required" }, { status: 400 });
    }

    const plan = normalizeEpisodePlan(body.plan);
    const quality = await evaluateStoryQuality(plan);

    return NextResponse.json({
      quality,
      plan: { ...plan, qualityScores: quality.scores },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Quality check failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
