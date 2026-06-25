import { NextResponse } from "next/server";
import { isServerDatabaseConfigured } from "@/lib/config";
import { getPipelineLiveState } from "@/lib/services/content-pipeline-service";

interface RouteContext {
  params: Promise<{ seriesId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  if (!isServerDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured." },
      { status: 503 }
    );
  }

  try {
    const { seriesId } = await context.params;
    const live = await getPipelineLiveState(seriesId);
    if (!live) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }
    return NextResponse.json({ live });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to load pipeline live state",
      },
      { status: 500 }
    );
  }
}
