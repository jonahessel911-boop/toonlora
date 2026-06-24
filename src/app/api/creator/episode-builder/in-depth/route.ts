import { NextResponse } from "next/server";
import {
  formatInDepthScriptForEpisodeBuilder,
  generateInDepthEpisodeScript,
} from "@/lib/episode-builder/claudeInDepthService";
import { hasAnthropicKey } from "@/lib/engine/anthropic-client";
import { clampEpisodeLength } from "@/lib/episode-builder/storyStructure";

export const maxDuration = 300;

interface InDepthRequestBody {
  topic?: string;
  description?: string;
  episode?: number;
  episodeTitle?: string;
  episodeNumber?: number;
  panels?: number;
  tone?: string;
  episodeLength?: number;
}

export async function POST(request: Request) {
  if (!hasAnthropicKey()) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY is not configured. Add it to .env.local and restart the dev server.",
      },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as InDepthRequestBody;
    const topic = String(body.topic ?? body.description ?? "").trim();

    if (!topic) {
      return NextResponse.json(
        { error: "Topic or story description is required" },
        { status: 400 }
      );
    }

    const episode = Math.max(1, Number(body.episode ?? body.episodeNumber) || 1);
    const episodeTitle =
      String(body.episodeTitle ?? "").trim() ||
      `Episode ${episode}`;

    const panels = body.panels
      ? Math.min(60, Math.max(5, Math.round(body.panels)))
      : Math.max(clampEpisodeLength(body.episodeLength ?? 10), 10);

    const result = await generateInDepthEpisodeScript({
      topic,
      episode,
      episodeTitle,
      panels,
      tone: body.tone,
    });

    const description = formatInDepthScriptForEpisodeBuilder(result);

    return NextResponse.json({
      ...result,
      description,
      research_sources: result.researchSources,
      panel_count: result.panelCount,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "In-depth script generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
