import { buildStoryJsonLd } from "@/lib/seo/story";
import type { CatalogSeries } from "@/types/catalog";

interface StoryJsonLdProps {
  story: CatalogSeries;
}

export default function StoryJsonLd({ story }: StoryJsonLdProps) {
  const jsonLd = buildStoryJsonLd(story);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
