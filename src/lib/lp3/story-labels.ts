import { resolveCompanyName } from "@/lib/founderStoryTitle";
import {
  COMPANY_NAME_BY_ID,
  FOUNDER_NAME_BY_ID,
} from "@/lib/mock/sagaMeta";

function looksLikePersonName(name: string): boolean {
  return name.trim().split(/\s+/).length >= 2;
}

function primaryCompanyLabel(company: string): string {
  return company.split(" · ")[0]?.trim() || company;
}

function resolveKnownStoryId(id: string, title: string): string {
  if (COMPANY_NAME_BY_ID[id]) return id;

  const normalizedTitle = title.toLowerCase();
  for (const [key, founder] of Object.entries(FOUNDER_NAME_BY_ID)) {
    if (normalizedTitle.startsWith(founder.toLowerCase())) return key;
  }

  for (const key of Object.keys(COMPANY_NAME_BY_ID)) {
    const label = key.replace(/-/g, " ");
    if (normalizedTitle.startsWith(label)) return key;
  }

  return id;
}

export function formatLp3StoryGridLabel(params: {
  id: string;
  title: string;
  fullTitle?: string;
  genre?: string;
  sagaSubtitle?: string;
}): string {
  const displayTitle = params.title.trim();
  const storyId = resolveKnownStoryId(params.id, displayTitle);
  const company = resolveCompanyName({
    storyId,
    title: params.fullTitle ?? displayTitle,
    category: params.genre,
    topic: params.sagaSubtitle,
  });
  const primary = primaryCompanyLabel(company);

  if (!primary || displayTitle.toLowerCase() === primary.toLowerCase()) {
    return displayTitle;
  }

  const lastName = displayTitle.split(/\s+/).pop()?.toLowerCase();
  if (lastName && primary.toLowerCase() === lastName) {
    return displayTitle;
  }

  if (displayTitle.toLowerCase().includes(primary.toLowerCase())) {
    return displayTitle;
  }

  if (looksLikePersonName(displayTitle)) {
    return `${displayTitle} · ${primary}`;
  }

  return displayTitle;
}
