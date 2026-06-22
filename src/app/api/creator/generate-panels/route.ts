import { NextResponse } from "next/server";
import {
  callOpenAIChat,
  callOpenAIStudioPanel,
  hasOpenAIKey,
} from "@/lib/engine/openai-client";
import {
  buildAddPanelPrompt,
  buildCreatorEpisodeBreakdownPrompt,
  buildStoryCharactersPrompt,
  buildStudioPanelImagePrompt,
  type CreatorCharacterInput,
  type CreatorPanelBreakdown,
  type CreatorPanelScript,
  type GeneratedStoryCharacters,
} from "@/lib/creator/studioPanelPrompt";
import { scriptToStudioPanel } from "@/lib/creator/studioPanelBuilder";
import type { StudioPanel } from "@/types/creator";

interface PanelSlot {
  id: string;
  order: number;
}

interface GeneratePanelsRequest {
  mode?: "batch" | "breakdown" | "panel" | "add" | "single" | "characters";
  storyId: string;
  episodeId: string;
  title: string;
  genre: string;
  description?: string;
  episodePrompt: string;
  panelCount?: number;
  characters: CreatorCharacterInput[];
  characterIds: string[];
  existingPanels?: PanelSlot[];
  panelId?: string;
  panelPrompt?: string;
  panelOrder?: number;
  panelScript?: CreatorPanelScript;
  previousPanelsSummary?: string;
}

function parseJSON<T>(raw: string): T {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("AI returned invalid JSON");
  }
  return JSON.parse(trimmed.slice(start, end + 1)) as T;
}

function characterNameMap(
  characters: CreatorCharacterInput[],
  characterIds: string[]
): Map<string, string> {
  const map = new Map<string, string>();
  characters.forEach((c, i) => {
    map.set(c.name.toLowerCase(), characterIds[i] ?? characterIds[0]);
  });
  return map;
}

async function generatePanelImage(
  params: {
    title: string;
    genre: string;
    storyId: string;
    panelId: string;
    script: CreatorPanelScript;
    characters: CreatorCharacterInput[];
    panelNumber: number;
    totalPanels: number;
  }
): Promise<string> {
  const prompt = buildStudioPanelImagePrompt({
    title: params.title,
    genre: params.genre,
    visual: params.script.visual,
    emotion: params.script.emotion,
    characters: params.characters,
    panelNumber: params.panelNumber,
    totalPanels: params.totalPanels,
  });
  return callOpenAIStudioPanel(prompt, params.storyId, params.panelId);
}

export async function POST(request: Request) {
  try {
    if (!hasOpenAIKey()) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY is not configured. Add your key to .env.local and restart the dev server.",
        },
        { status: 503 }
      );
    }

    const body = (await request.json()) as GeneratePanelsRequest;
    const mode = body.mode ?? "batch";
    const {
      storyId,
      episodeId,
      title,
      genre,
      description = "",
      episodePrompt,
      characters = [],
      characterIds = [],
    } = body;

    if (
      !storyId?.trim() ||
      !episodeId?.trim() ||
      !title?.trim() ||
      !episodePrompt?.trim() ||
      (mode !== "characters" && !characters.length)
    ) {
      return NextResponse.json(
        { error: "Missing required fields for panel generation" },
        { status: 400 }
      );
    }

    const nameToId = characterNameMap(characters, characterIds);

    if (mode === "characters") {
      const raw = await callOpenAIChat({
        prompt: buildStoryCharactersPrompt({
          title,
          genre,
          description,
          episodePrompt,
        }),
        json: true,
      });
      const generated = parseJSON<GeneratedStoryCharacters>(raw);
      return NextResponse.json({
        characters: generated.characters.slice(0, 3),
      });
    }

    if (mode === "breakdown") {
      const panelCount = body.panelCount ?? body.existingPanels?.length ?? 8;
      const slots =
        body.existingPanels ??
        Array.from({ length: panelCount }, (_, i) => ({
          id: `${episodeId}-panel-${Date.now()}-${i}`,
          order: i + 1,
        }));

      const breakdownRaw = await callOpenAIChat({
        prompt: buildCreatorEpisodeBreakdownPrompt({
          title,
          genre,
          description,
          episodePrompt,
          panelCount: slots.length,
          characters,
        }),
        json: true,
      });
      const breakdown = parseJSON<CreatorPanelBreakdown>(breakdownRaw);
      const scripts = breakdown.panels.slice(0, slots.length);

      return NextResponse.json({ scripts, slots, panelCount: slots.length });
    }

    if (mode === "panel" && body.panelId) {
      const order = body.panelOrder ?? 1;
      const totalPanels = body.panelCount ?? 1;
      const script: CreatorPanelScript = body.panelScript ?? {
        panel_number: order,
        visual: body.panelPrompt ?? `${episodePrompt} — panel ${order}`,
        emotion: "story moment",
      };

      const imageUrl = await generatePanelImage({
        title,
        genre,
        storyId,
        panelId: body.panelId,
        script,
        characters,
        panelNumber: order,
        totalPanels,
      });

      const panel = scriptToStudioPanel({
        episodeId,
        panelId: body.panelId,
        script,
        characterIds,
        characterNameToId: nameToId,
        imageUrl,
        order,
      });

      return NextResponse.json({ panel });
    }

    if (mode === "single" && body.panelId && body.panelPrompt) {
      const order = body.panelOrder ?? 1;
      const script: CreatorPanelScript = {
        panel_number: order,
        visual: body.panelPrompt,
        emotion: "matching the scene",
      };
      const imageUrl = await generatePanelImage({
        title,
        genre,
        storyId,
        panelId: body.panelId,
        script,
        characters,
        panelNumber: order,
        totalPanels: order,
      });
      return NextResponse.json({
        panel: scriptToStudioPanel({
          episodeId,
          panelId: body.panelId,
          script,
          characterIds,
          characterNameToId: nameToId,
          imageUrl,
          order,
        }),
      });
    }

    if (mode === "add") {
      const panelId = body.panelId ?? `${episodeId}-panel-${Date.now()}`;
      const order =
        body.panelOrder ??
        (body.existingPanels?.length ? body.existingPanels.length + 1 : 1);
      const previousSummary =
        body.previousPanelsSummary ??
        body.existingPanels
          ?.map((p) => `Panel ${p.order}`)
          .join(", ") ??
        "";

      const raw = await callOpenAIChat({
        prompt: buildAddPanelPrompt({
          title,
          genre,
          episodePrompt,
          previousPanelsSummary: previousSummary,
          characters,
        }),
        json: true,
      });
      const { panel: script } = parseJSON<{ panel: CreatorPanelScript }>(raw);
      script.panel_number = order;

      const imageUrl = await generatePanelImage({
        title,
        genre,
        storyId,
        panelId,
        script,
        characters,
        panelNumber: order,
        totalPanels: order,
      });

      const panel = scriptToStudioPanel({
        episodeId,
        panelId,
        script,
        characterIds,
        characterNameToId: nameToId,
        imageUrl,
        order,
      });

      return NextResponse.json({ panel });
    }

    const panelCount = body.panelCount ?? body.existingPanels?.length ?? 8;
    const slots = body.existingPanels ?? Array.from({ length: panelCount }, (_, i) => ({
      id: `${episodeId}-panel-${Date.now()}-${i}`,
      order: i + 1,
    }));

    const breakdownRaw = await callOpenAIChat({
      prompt: buildCreatorEpisodeBreakdownPrompt({
        title,
        genre,
        description,
        episodePrompt,
        panelCount: slots.length,
        characters,
      }),
      json: true,
    });
    const breakdown = parseJSON<CreatorPanelBreakdown>(breakdownRaw);
    const scripts = breakdown.panels.slice(0, slots.length);

    const panels: StudioPanel[] = [];

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const script = scripts[i] ?? {
        panel_number: slot.order,
        visual: `${episodePrompt} — panel ${slot.order}`,
        emotion: "story moment",
      };

      const imageUrl = await generatePanelImage({
        title,
        genre,
        storyId,
        panelId: slot.id,
        script,
        characters,
        panelNumber: slot.order,
        totalPanels: slots.length,
      });

      panels.push(
        scriptToStudioPanel({
          episodeId,
          panelId: slot.id,
          script,
          characterIds,
          characterNameToId: nameToId,
          imageUrl,
          order: slot.order,
        })
      );
    }

    return NextResponse.json({ panels });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Panel generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
