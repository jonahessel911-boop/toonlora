import { NextResponse } from "next/server";
import { runStoryToWebtoonPipeline } from "@/lib/engine/pipeline";
import { pipelineResultToStory } from "@/lib/story-builder";
import { getSessionFromRequest } from "@/lib/api/session";
import { storyRepository, creditsRepository } from "@/lib/services/database";
import { isServerDatabaseConfigured } from "@/lib/config";
import type { SeriesInput, StoryBible } from "@/types/pipeline";

interface GenerateRequest extends SeriesInput {
  episode_number?: number;
  previous_summary?: string;
  episode_prompt?: string;
  story_bible?: StoryBible;
  series_id?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequest;
    const sessionId = getSessionFromRequest(request);

    if (
      !body.story_idea?.trim() ||
      !body.main_character?.trim() ||
      !body.love_interest?.trim()
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const isNewSeries = !body.episode_number || body.episode_number === 1;
    if (isServerDatabaseConfigured()) {
      const { credits, freeUsed } = await creditsRepository.get(sessionId);
      const canGenerate = !freeUsed || credits > 0;
      if (!canGenerate) {
        return NextResponse.json({ error: "Not enough credits" }, { status: 402 });
      }
    }

    const pipelineResult = await runStoryToWebtoonPipeline(body, {
      episodeNumber: body.episode_number ?? 1,
      previousEpisodeSummary: body.previous_summary ?? "",
      episodePrompt: body.episode_prompt ?? body.story_idea,
      existingStoryBible: body.story_bible,
      requireAI: true,
    });

    let story = pipelineResultToStory(pipelineResult);

    if (isServerDatabaseConfigured()) {
      await creditsRepository.consume(sessionId);

      if (body.series_id && !isNewSeries) {
        const existing = await storyRepository.getById(body.series_id);
        if (existing) {
          story = {
            ...existing,
            episodes: [...(existing.episodes ?? []), ...(story.episodes ?? [])],
            continuityMemory: story.continuityMemory,
            pages: [...existing.pages, ...story.pages],
          };
        }
        story.id = body.series_id;
      }

      story = await storyRepository.save(story, sessionId, {
        source: "creator",
        status: "draft",
        isPublic: false,
      });
    }

    return NextResponse.json({
      story,
      pipeline: pipelineResult,
      source: isServerDatabaseConfigured() ? "supabase" : "local",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Pipeline failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
