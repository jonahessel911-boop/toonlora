import { NextResponse } from "next/server";
import { isServerDatabaseConfigured } from "@/lib/config";
import { listPublishedCatalog } from "@/lib/services/catalog-repository";
import { catalogToCard } from "@/types/catalog";

export async function GET(request: Request) {
  if (!isServerDatabaseConfigured()) {
    return NextResponse.json({ series: [], source: "none" });
  }

  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get("genre") ?? undefined;
    const source = searchParams.get("source") as "admin" | "creator" | null;
    const sort = (searchParams.get("sort") ?? "featured") as
      | "featured"
      | "newest"
      | "popular";
    const limit = Number(searchParams.get("limit") ?? 48);

    const series = await listPublishedCatalog({
      genre: genre || undefined,
      source: source ?? undefined,
      sort,
      limit,
    });

    return NextResponse.json({
      series: series.map((s) => catalogToCard(s)),
      source: "supabase",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Catalog failed" },
      { status: 500 }
    );
  }
}
