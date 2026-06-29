import { NextResponse } from "next/server";
import { isServerDatabaseConfigured } from "@/lib/config";
import { listSimilarCatalogStories } from "@/lib/services/catalog-repository";
import { catalogToCard } from "@/types/catalog";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  if (!isServerDatabaseConfigured()) {
    return NextResponse.json({ series: [] });
  }

  try {
    const { id } = await params;
    const series = await listSimilarCatalogStories(id, 8);

    return NextResponse.json(
      {
        series: series.map((story) => catalogToCard(story)),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to load similar stories",
      },
      { status: 500 }
    );
  }
}
