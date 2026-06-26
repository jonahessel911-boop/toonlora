import { NextResponse } from "next/server";
import { isServerDatabaseConfigured } from "@/lib/config";
import { deletePipelineQueueJob } from "@/lib/services/pipeline-queue-service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!isServerDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured." },
      { status: 503 }
    );
  }

  try {
    const { id } = await context.params;
    await deletePipelineQueueJob(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to delete queue job",
      },
      { status: 500 }
    );
  }
}
