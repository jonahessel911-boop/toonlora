import { NextResponse } from "next/server";
import { isServerDatabaseConfigured } from "@/lib/config";
import { getPipelineSeriesDetail } from "@/lib/services/pipeline-panels-repository";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  if (!isServerDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured." },
      { status: 503 }
    );
  }

  try {
    const { id } = await context.params;
    const series = await getPipelineSeriesDetail(id);
    if (!series) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }
    return NextResponse.json({ series });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load series" },
      { status: 500 }
    );
  }
}
