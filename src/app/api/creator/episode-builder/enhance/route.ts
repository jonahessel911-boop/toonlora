import { NextResponse } from "next/server";
import type { EpisodeBuilderInput } from "@/types/episode-builder";
import { enhanceStoryDescription } from "@/lib/episode-builder/storyEnhanceService";
import { normalizeEpisodeInput } from "@/lib/episode-builder/storyPlannerService";

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

    const result = await enhanceStoryDescription(input);
    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Story enhancement failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
