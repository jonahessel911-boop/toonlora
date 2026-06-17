export function buildCharacterShortDescription(
  visualDescription: string,
  personality: string,
  outfit?: string
): string {
  const look = visualDescription.trim();
  const vibe = personality.trim().replace(/[,.]\s*$/, "");
  const wear = outfit?.trim();

  if (!look && !vibe) return "";

  const lookSentence =
    look.length > 0
      ? `${look.charAt(0).toUpperCase()}${look.slice(1)}${look.endsWith(".") ? "" : "."}`
      : "";

  const personalitySentence = vibe
    ? `${vibe.charAt(0).toUpperCase()}${vibe.slice(1)}${vibe.endsWith(".") ? "" : "."}`
    : "";

  if (lookSentence && personalitySentence && wear) {
    return `${lookSentence} ${personalitySentence} Wears ${wear.charAt(0).toLowerCase()}${wear.slice(1)}${wear.endsWith(".") ? "" : "."}`;
  }

  if (lookSentence && personalitySentence) {
    return `${lookSentence} ${personalitySentence}`;
  }

  return lookSentence || personalitySentence;
}
