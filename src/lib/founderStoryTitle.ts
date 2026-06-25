import { COMPANY_NAME_BY_ID, FOUNDER_NAME_BY_ID, parseSagaTitle } from "@/lib/mock/sagaMeta";

const FOUNDER_ROLE_PATTERN =
  /founder|co-founder|entrepreneur|protagonist|visionary/i;

export function isFounderStoryCategory(genre: string): boolean {
  const raw = genre.toLowerCase().replace(/[\s-]+/g, "_");
  return (
    raw === "founder_stories" ||
    raw === "founder_story" ||
    raw === "founder_saga"
  );
}

function looksLikePersonName(name: string): boolean {
  const words = name.trim().split(/\s+/);
  return words.length >= 2;
}

function resolveStoryTagline(title: string, subtitle?: string): string {
  if (subtitle?.trim()) return subtitle.trim();
  return parseSagaTitle(title).subtitle.trim();
}

export function resolveFounderName(params: {
  storyId?: string;
  title?: string;
  mainCharacter?: string | null;
  researchCharacters?: Array<{ name: string; role: string }>;
}): string | undefined {
  if (params.storyId && FOUNDER_NAME_BY_ID[params.storyId]) {
    return FOUNDER_NAME_BY_ID[params.storyId];
  }

  if (params.mainCharacter?.trim()) {
    return params.mainCharacter.trim();
  }

  for (const character of params.researchCharacters ?? []) {
    if (FOUNDER_ROLE_PATTERN.test(character.role)) {
      return character.name.trim();
    }
  }

  const lead = params.researchCharacters?.[0]?.name?.trim();
  if (lead) return lead;

  const { name } = parseSagaTitle(params.title ?? "");
  if (looksLikePersonName(name)) return name;

  return undefined;
}

/** Founder stories: "[First Last] — [story title]" (never company-only subject). */
export function formatFounderStoryTitle(params: {
  storyId?: string;
  title: string;
  subtitle?: string;
  mainCharacter?: string | null;
  researchCharacters?: Array<{ name: string; role: string }>;
}): string {
  const tagline = resolveStoryTagline(params.title, params.subtitle);
  const founder = resolveFounderName(params);

  if (founder && tagline) {
    return `${founder} — ${tagline}`;
  }
  if (founder) {
    return founder;
  }

  return params.title;
}

function toTitleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function slugBaseLabel(slug?: string): string | undefined {
  if (!slug?.trim()) return undefined;
  const withoutUuid = slug.replace(/-[a-f0-9]{8}$/i, "");
  const base = withoutUuid.replace(/-/g, " ").trim();
  if (!base) return undefined;
  return toTitleCase(base);
}

/** Company / brand name — never the founder's personal name on founder stories. */
export function resolveCompanyName(params: {
  storyId?: string;
  title?: string;
  topic?: string;
  slug?: string;
  category?: string;
  mainCharacter?: string | null;
  researchTopic?: string;
  researchCharacters?: Array<{ name: string; role: string }>;
}): string {
  if (params.storyId && COMPANY_NAME_BY_ID[params.storyId]) {
    return COMPANY_NAME_BY_ID[params.storyId];
  }

  const founder = resolveFounderName(params);
  const topic = (params.researchTopic ?? params.topic ?? "").trim();

  if (topic) {
    if (!looksLikePersonName(topic)) {
      return topic;
    }
    if (founder && topic.toLowerCase() !== founder.toLowerCase()) {
      const withoutFounder = topic
        .replace(new RegExp(founder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), "")
        .replace(/^[\s—–-]+|[\s—–-]+$/g, "")
        .trim();
      if (withoutFounder && !looksLikePersonName(withoutFounder)) {
        return withoutFounder;
      }
      const lastName = founder.split(/\s+/).pop();
      if (lastName && topic.toLowerCase().includes(lastName.toLowerCase())) {
        return toTitleCase(lastName);
      }
    }
  }

  const fromSlug = slugBaseLabel(params.slug);
  if (fromSlug && (!founder || fromSlug.toLowerCase() !== founder.toLowerCase())) {
    if (!looksLikePersonName(fromSlug) || !params.slug?.includes("-")) {
      return fromSlug;
    }
  }

  for (const [key, company] of Object.entries(COMPANY_NAME_BY_ID)) {
    const keyLabel = key.replace(/-/g, " ");
    if (
      params.slug?.startsWith(`${key}-`) ||
      topic.toLowerCase() === keyLabel ||
      topic.toLowerCase() === company.toLowerCase()
    ) {
      return company;
    }
  }

  const { name } = parseSagaTitle(params.title ?? "");
  if (isFounderStoryCategory(params.category ?? "")) {
    if (topic && topic.toLowerCase() !== name.toLowerCase()) {
      return topic;
    }
    if (looksLikePersonName(name)) {
      const lastName = name.split(/\s+/).pop();
      if (lastName) return toTitleCase(lastName);
    }
  }

  if (!looksLikePersonName(name)) {
    return name;
  }

  return topic || fromSlug || name;
}
