import CharacterPageClient from "@/components/character/CharacterPageClient";
import { slugToDisplayName } from "@/lib/characters/characterSlug";

interface CharacterPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CharacterPageProps) {
  const { slug } = await params;
  const name = slugToDisplayName(decodeURIComponent(slug));

  return {
    title: `${name} — Characters | Toonlora`,
    description: `See stories featuring ${name} on Toonlora.`,
  };
}

export default async function CharacterPage({ params }: CharacterPageProps) {
  const { slug } = await params;
  return <CharacterPageClient slug={decodeURIComponent(slug)} />;
}
