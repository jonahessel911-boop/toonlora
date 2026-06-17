import { NextResponse } from "next/server";
import { slugToDisplayName } from "@/lib/characters/characterSlug";
import { catalogToCard } from "@/types/catalog";
import {
  getCharacterCatalogProfile,
  listStoriesForCharacterSlug,
} from "@/lib/services/character-catalog";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { slug } = await params;
  const normalized = decodeURIComponent(slug).trim().toLowerCase();

  if (!normalized) {
    return NextResponse.json({ error: "Character not found" }, { status: 404 });
  }

  try {
    const [profile, stories] = await Promise.all([
      getCharacterCatalogProfile(normalized),
      listStoriesForCharacterSlug(normalized, { limit: 24 }),
    ]);

    return NextResponse.json({
      character: profile ?? {
        slug: normalized,
        name: slugToDisplayName(normalized),
      },
      stories: stories.map((story) => catalogToCard(story)),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load character";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
