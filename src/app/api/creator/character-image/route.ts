import { NextResponse } from "next/server";
import {
  callOpenAICharacterPortrait,
  callOpenAICharacterPortraitEdit,
} from "@/lib/engine/openai-client";
import {
  buildCharacterPortraitEditPrompt,
  buildCharacterPortraitPrompt,
} from "@/lib/creator/characterImagePrompt";
import type { CharacterGender, CharacterRole } from "@/types/creator";

interface CharacterImageRequest {
  characterId?: string;
  mode?: "generate" | "edit";
  editInstruction?: string;
  referencePortraitUrl?: string;
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

    if (
      body.mode === "edit" &&
      body.referencePortraitUrl?.trim() &&
      body.editInstruction?.trim()
    ) {
      const prompt = buildCharacterPortraitEditPrompt(body.editInstruction);
      const portraitUrl = await callOpenAICharacterPortraitEdit(
        prompt,
        body.referencePortraitUrl.trim(),
        characterId
      );

      return NextResponse.json({ portraitUrl, characterId, mode: "edit" });
    }

    if (
      !body.name ||
      !body.gender ||
      !body.role ||
      !body.styleTheme ||
      !body.ageRange ||
      !body.lookDescription ||
      !body.outfitDescription ||
      !body.personality
    ) {
      return NextResponse.json(
        { error: "Missing character description fields" },
        { status: 400 }
      );
    }

    const prompt = buildCharacterPortraitPrompt({
      name: body.name,
      gender: body.gender,
      role: body.role,
      styleTheme: body.styleTheme,
      ageRange: body.ageRange,
      lookDescription: body.lookDescription,
      outfitDescription: body.outfitDescription,
      personality: body.personality,
      hasReferenceImage: Boolean(body.hasReferenceImage),
    });

    const portraitUrl = await callOpenAICharacterPortrait(prompt, characterId);

    return NextResponse.json({ portraitUrl, characterId, mode: "generate" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Portrait generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
