import { NextResponse } from "next/server";
import { callOpenAICharacterPortrait } from "@/lib/engine/openai-client";
import { buildCharacterPortraitPrompt } from "@/lib/creator/characterImagePrompt";
import type { CharacterGender, CharacterRole } from "@/types/creator";

interface CharacterImageRequest {
  characterId?: string;
  prompt?: string;
  name?: string;
  gender?: CharacterGender;
  role?: CharacterRole;
  styleTheme?: string;
  ageRange?: string;
  lookDescription?: string;
  outfitDescription?: string;
  personality?: string;
  hasReferenceImage?: boolean;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CharacterImageRequest;
    const characterId = body.characterId?.trim() || `char-${Date.now()}`;

    const prompt =
      body.prompt?.trim() ||
      (body.name &&
        body.gender &&
        body.role &&
        body.styleTheme &&
        body.ageRange &&
        body.lookDescription &&
        body.outfitDescription &&
        body.personality
        ? buildCharacterPortraitPrompt({
            name: body.name,
            gender: body.gender,
            role: body.role,
            styleTheme: body.styleTheme,
            ageRange: body.ageRange,
            lookDescription: body.lookDescription,
            outfitDescription: body.outfitDescription,
            personality: body.personality,
            hasReferenceImage: Boolean(body.hasReferenceImage),
          })
        : "");

    if (!prompt) {
      return NextResponse.json(
        { error: "Missing prompt or character description fields" },
        { status: 400 }
      );
    }

    const portraitUrl = await callOpenAICharacterPortrait(prompt, characterId);

    return NextResponse.json({ portraitUrl, prompt, characterId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Portrait generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
