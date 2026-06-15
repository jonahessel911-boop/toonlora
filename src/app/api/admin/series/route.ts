import { NextResponse } from "next/server";
import { runStoryToWebtoonPipeline } from "@/lib/engine/pipeline";
import { pipelineResultToStory } from "@/lib/story-builder";
import { getSessionFromRequest } from "@/lib/api/session";
import { isServerDatabaseConfigured } from "@/lib/config";
import { listAllSeriesAdmin } from "@/lib/services/catalog-repository";
import { saveStoryToDb } from "@/lib/services/story-repository";
import { getArtStylePipelineValue } from "@/lib/artStyles";
import { PANEL_COUNT_MAX, PANEL_COUNT_MIN } from "@/lib/panelCount";
import type { SeriesInput, StoryBible } from "@/types/pipeline";

interface AdminGenerateBody extends SeriesInput {
  synopsis?: string;
  creator_display_name?: string;
  featured_rank?: number;
  cover_gradient?: string;
  custom_title?: string;
  publish?: boolean;
  art_style_id?: string;
}

export async function GET() {
  if (!isServerDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured." },
      { status: 503 }
    );
  }

  try {
    const series = await listAllSeriesAdmin();
    return NextResponse.json({ series });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list series" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!isServerDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured." },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as AdminGenerateBody;
    const sessionId = getSessionFromRequest(request);

    if (
      !body.story_idea?.trim() ||
      !body.main_character?.trim() ||
      !body.love_interest?.trim()
    ) {
      return NextResponse.json(
        { error: "Story idea, main character, and love interest are required." },
        { status: 400 }
      );
    }

    if (
      body.panel_count !== undefined &&
      (body.panel_count < PANEL_COUNT_MIN || body.panel_count > PANEL_COUNT_MAX)
    ) {
      return NextResponse.json(
        {
          error: `Panel count must be between ${PANEL_COUNT_MIN} and ${PANEL_COUNT_MAX}.`,
        },
        { status: 400 }
      );
    }

    const seriesInput: SeriesInput = {
      ...body,
      style: body.art_style_id
        ? getArtStylePipelineValue(body.art_style_id)
        : body.style || "Cartoon Webtoon",
      tone: body.tone || "Cinematic",
      language: body.language || "English",
      episode_length: body.episode_length || "Normal",
      target_audience: body.target_audience || "Teens / Young Adults",
    };

    const pipelineResult = await runStoryToWebtoonPipeline(seriesInput, {
      episodeNumber: 1,
      previousEpisodeSummary: "",
      episodePrompt: body.story_idea,
      requireAI: true,
    });

    let story = pipelineResultToStory(pipelineResult);
    if (body.custom_title?.trim()) {
      story = { ...story, title: body.custom_title.trim() };
    }
    if (body.cover_gradient) {
      story = { ...story, coverGradient: body.cover_gradient };
    }

    const publish = body.publish !== false;

    story = await saveStoryToDb(story, sessionId, {
      source: "admin",
      status: publish ? "published" : "draft",
      isPublic: publish,
      synopsis: body.synopsis ?? body.story_idea,
      creatorDisplayName:
        body.creator_display_name ?? "Toonlora Official",
      featuredRank: body.featured_rank ?? null,
    });

    return NextResponse.json({ story, published: publish });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create series" },
      { status: 500 }
    );
  }
}
