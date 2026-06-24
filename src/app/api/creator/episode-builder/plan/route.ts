import { NextResponse } from "next/server";
import type { EpisodeBuilderInput } from "@/types/episode-builder";
import {
  generateInitialStoryPlan,
  normalizeEpisodeInput,
} from "@/lib/episode-builder/storyPlannerService";
import { evaluateStoryQuality } from "@/lib/episode-builder/storyQualityService";

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<EpisodeBuilderInput>;
    const description = String(body.description ?? "").trim();

    if (!description) {
      return NextResponse.json(
        { error: "Story description is required" },
        { status: 400 }
      );
    }

    const input = normalizeEpisodeInput({
      description,
      episodeLength: Number(body.episodeLength),
    });

    const plan = await generateInitialStoryPlan(input);
    const quality = await evaluateStoryQuality(plan);

    return NextResponse.json({
      plan: { ...plan, qualityScores: quality.scores },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Story plan generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
