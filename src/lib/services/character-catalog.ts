import {
  characterSlug,
  slugToDisplayName,
} from "@/lib/characters/characterSlug";
import {
  listPublishedCatalog,
  type CatalogQuery,
} from "@/lib/services/catalog-repository";
import type { CatalogSeries } from "@/types/catalog";
import type { SeriesRow } from "@/lib/supabase/types";
import type { StoryCharacter } from "@/types/pipeline";

export interface CharacterCatalogProfile {
  slug: string;
  name: string;
  role?: string;
  visualDescription?: string;
}

function collectCharacterNames(row: SeriesRow): CharacterCatalogProfile[] {
  const profiles: CharacterCatalogProfile[] = [];
  const seen = new Set<string>();

  const push = (name: string, partial?: Partial<CharacterCatalogProfile>) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const slug = characterSlug(trimmed);
    if (!slug || seen.has(slug)) return;
    seen.add(slug);
    profiles.push({
      slug,
      name: trimmed,
      role: partial?.role,
      visualDescription: partial?.visualDescription,
    });
  };

  if (row.main_character) {
    push(row.main_character, { role: "Main character" });
  }
  if (row.love_interest) {
    push(row.love_interest, { role: "Love interest" });
  }

  const bibleCharacters =
    (row.story_bible as { main_characters?: StoryCharacter[] } | null)
      ?.main_characters ?? [];

  for (const character of bibleCharacters) {
    push(character.name, {
      role: character.role,
      visualDescription: character.visual_design,
    });
  }

  return profiles;
}

function seriesIncludesCharacter(row: SeriesRow, slug: string): boolean {
  return collectCharacterNames(row).some((profile) => profile.slug === slug);
}

function profileForSlug(
  row: SeriesRow,
  slug: string
): CharacterCatalogProfile | undefined {
  return collectCharacterNames(row).find((profile) => profile.slug === slug);
}

async function loadPublishedSeriesRows(): Promise<SeriesRow[]> {
  const supabase = (await import("@/lib/supabase/admin")).getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("series")
    .select("*")
    .eq("status", "published")
    .eq("is_public", true)
    .order("published_at", { ascending: false })
    .limit(120);

  if (error || !data) return [];
  return data as SeriesRow[];
}

export async function getCharacterCatalogProfile(
  slug: string
): Promise<CharacterCatalogProfile | null> {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return null;

  const rows = await loadPublishedSeriesRows();
  for (const row of rows) {
    const profile = profileForSlug(row, normalized);
    if (profile) return profile;
  }

  return {
    slug: normalized,
    name: slugToDisplayName(normalized),
  };
}

export async function listStoriesForCharacterSlug(
  slug: string,
  query: Pick<CatalogQuery, "limit"> = {}
): Promise<CatalogSeries[]> {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return [];

  const catalog = await listPublishedCatalog({
    sort: "popular",
    limit: query.limit ?? 48,
  });

  const rows = await loadPublishedSeriesRows();
  const matchingIds = new Set(
    rows
      .filter((row) => seriesIncludesCharacter(row, normalized))
      .map((row) => row.id)
  );

  if (matchingIds.size === 0) return [];

  return catalog.filter((story) => matchingIds.has(story.id));
}
