import { NextResponse } from "next/server";
import { isServerDatabaseConfigured } from "@/lib/config";
import {
  enqueuePipelineStory,
  getPipelineQueueStats,
  listPipelineQueueJobs,
} from "@/lib/services/pipeline-queue-service";

export async function GET() {
  if (!isServerDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured." },
      { status: 503 }
    );
  }

  try {
    const [jobs, stats] = await Promise.all([
      listPipelineQueueJobs(),
      getPipelineQueueStats(),
    ]);
    return NextResponse.json({ jobs, stats });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to load story queue",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!isServerDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured." },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as {
      topic?: string;
      category?: string;
      maxPanels?: number;
      seriesId?: string;
    };

    const topic = body.topic?.trim();
    if (!topic) {
      return NextResponse.json({ error: "topic is required" }, { status: 400 });
    }

    const job = await enqueuePipelineStory({
      topic,
      category: body.category,
      maxPanels: body.maxPanels,
      mode: "full",
      seriesId: body.seriesId,
    });

    return NextResponse.json({ job });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to enqueue story",
      },
      { status: 500 }
    );
  }
}
