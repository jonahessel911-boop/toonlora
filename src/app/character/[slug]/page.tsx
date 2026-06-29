import CharacterPageClient from "@/components/character/CharacterPageClient";
import { slugToDisplayName } from "@/lib/characters/characterSlug";
import { pageTitle } from "@/lib/seo/site";

interface CharacterPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CharacterPageProps) {
  const { slug } = await params;
  const name = slugToDisplayName(decodeURIComponent(slug));

  return {
    title: pageTitle(`${name} — Business Stories`),
    description: `Read illustrated business stories about ${name} on Toonlora. Founder stories, company breakdowns, and cinematic business history.`,
  };
}

export default async function CharacterPage({ params }: CharacterPageProps) {
  const { slug } = await params;
  return <CharacterPageClient slug={decodeURIComponent(slug)} />;
}
