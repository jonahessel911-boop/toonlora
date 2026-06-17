import type { CharacterGender, CharacterRole } from "@/types/creator";

export interface CharacterPortraitInput {
  name: string;
  gender: CharacterGender;
  role: CharacterRole;
  styleTheme: string;
  ageRange: string;
  lookDescription: string;
  outfitDescription: string;
  personality: string;
  hasReferenceImage: boolean;
}

export function buildCharacterPortraitPrompt(
  input: CharacterPortraitInput
): string {
  const genderLabel = input.gender === "woman" ? "woman" : "man";

  return `Create a polished original cartoon/webtoon character illustration — a reusable character asset.

CHARACTER: ${input.name}
Gender: ${genderLabel}
Age: ${input.ageRange}
Role: ${input.role}
Art style: ${input.styleTheme} webtoon / cartoon illustration

POSE & CAMERA (critical):
- Standing in a natural relaxed pose
- Three-quarter view: body turned about 35–45° to the side, face looking toward the camera (half schuin / semi-profile)
- Full body visible from head to feet
- Character centered with comfortable padding around the figure

BACKGROUND (critical):
- Fully transparent background (alpha channel)
- NO scenery, NO floor, NO shadow blob, NO gradient backdrop
- Isolated character cutout only, like a game or comic studio asset

FACE & BODY:
${input.lookDescription}

OUTFIT & ACCESSORIES:
${input.outfitDescription}

EXPRESSION & VIBE:
${input.personality}

QUALITY:
- Clean bold outlines, expressive face, vibrant colors
- Consistent lighting on the character only
- Professional character design sheet quality
- Original character — do not copy existing IP, celebrities, or branded characters
${input.hasReferenceImage ? "\nUse the creator's reference image as style and outfit guidance while keeping an original design." : ""}`;
}

export function buildCharacterPortraitEditPrompt(editInstruction: string): string {
  return `Modify this existing cartoon/webtoon character illustration.

CHANGE REQUEST:
${editInstruction.trim()}

RULES:
- Keep the same character identity unless the change request says otherwise
- Keep full-body three-quarter standing pose unless the change request says otherwise
- Keep transparent background with no scenery, floor, or shadow blob
- Apply only the requested modifications
- Professional webtoon character asset quality with clean bold outlines`;
}
