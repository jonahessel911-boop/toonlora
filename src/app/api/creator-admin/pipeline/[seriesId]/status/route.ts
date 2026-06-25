import { NextResponse } from "next/server";
import { isServerDatabaseConfigured } from "@/lib/config";
import { getPipelineRunStatus } from "@/lib/services/content-pipeline-service";

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
    const status = await getPipelineRunStatus(seriesId);
    return NextResponse.json({ status });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to load pipeline status",
      },
      { status: 500 }
    );
  }
}
