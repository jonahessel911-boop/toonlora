/** Story DNA per pipeline category — injected into research + bible prompts. */

const HEISTS_AND_FRAUDS_BRIEF = `CATEGORY: Heists & Frauds

THE FEELING: True crime but with suits and spreadsheets. The reader knows it's going wrong but can't stop reading. Each chapter reveals a new layer of deception.

EVERY HEISTS & FRAUDS STORY MUST INCLUDE:
- A brilliant protagonist the reader admires despite everything
- A system that failed to stop them
- A moment when everything could still have been saved but nobody intervened
- The fall — always faster and harder than expected
- The aftermath — what was actually lost`;

const EMPIRES_BRIEF = `CATEGORY: Empires

THE FEELING: Aspirational but not naive. Not the sanitized LinkedIn story but the real version — dirty deals, betrayed partners, moments when it nearly failed. The reader identifies with the founder and thinks "I would have done that too."

EVERY EMPIRE STORY MUST INCLUDE:
- An obsession everyone around them saw as weakness
- A moment of total despair that reveals true character
- An enemy — always a big player trying to destroy them
- The breakthrough — one decision that changed everything
- The empire at its peak — and the first signs it's fragile`;

const CATEGORY_BRIEFS: Record<string, string> = {
  heists_and_frauds: HEISTS_AND_FRAUDS_BRIEF,
  heists: HEISTS_AND_FRAUDS_BRIEF,
  empires: EMPIRES_BRIEF,
};

export function normalizeCategorySlug(
  raw: string | null | undefined
): string {
  if (!raw?.trim()) return "business";
  const normalized = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (normalized === "heist" || normalized === "heists_and_fraud") {
    return "heists_and_frauds";
  }
  return normalized;
}

export function getCategoryStoryBrief(
  raw: string | null | undefined
): string | null {
  const slug = normalizeCategorySlug(raw);
  return CATEGORY_BRIEFS[slug] ?? null;
}

export function formatCategoryBriefForPrompt(
  raw: string | null | undefined
): string {
  const brief = getCategoryStoryBrief(raw);
  if (!brief) return "";
  return `\n\n---\n${brief}\n---\n`;
}
