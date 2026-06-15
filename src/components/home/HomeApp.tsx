"use client";

import HorizontalCarousel from "@/components/home/HorizontalCarousel";
import { useCatalog } from "@/hooks/useCatalog";

/** Legacy home layout — uses live catalog */
export default function HomeApp() {
  const { series } = useCatalog({ sort: "featured", limit: 4 });

  return (
    <div className="pb-16">
      <HorizontalCarousel
        title="Featured series"
        stories={series}
        variant="vertical"
      />
    </div>
  );
}
