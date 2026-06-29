import { NextResponse } from "next/server";
import { isServerDatabaseConfigured } from "@/lib/config";
import { stopPipelineCreation } from "@/lib/services/content-pipeline-service";

export async function POST(request: Request) {
  if (!isServerDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured." },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      seriesId?: string;
      stopAll?: boolean;
    };

    const result = await stopPipelineCreation({
      seriesId: body.seriesId?.trim() || undefined,
      stopAll: body.stopAll === true || !body.seriesId?.trim(),
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to stop pipeline",
      },
      { status: 500 }
    );
  }
}
