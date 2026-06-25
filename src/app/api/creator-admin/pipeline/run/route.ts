import { NextResponse } from "next/server";
import { isServerDatabaseConfigured } from "@/lib/config";
import {
  clearStalePipelineRuns,
  createPipelineSeries,
  getSeriesBasics,
  spawnContentPipeline,
} from "@/lib/services/content-pipeline-service";

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
      seriesId?: string;
      resume?: boolean;
    };

    if (body.resume && body.seriesId) {
      const series = await getSeriesBasics(body.seriesId);
      if (!series) {
        return NextResponse.json({ error: "Series not found" }, { status: 404 });
      }

      await clearStalePipelineRuns(series.id);
      spawnContentPipeline({
        seriesId: series.id,
        topic: series.title,
        category: series.category ?? "business",
      });

      return NextResponse.json({
        seriesId: series.id,
        started: true,
        resumed: true,
      });
    }

    const topic = body.topic?.trim();
    if (!topic) {
      return NextResponse.json({ error: "topic is required" }, { status: 400 });
    }

    const category = body.category?.trim() || "business";
    const { seriesId } = await createPipelineSeries(topic, category);

    await clearStalePipelineRuns(seriesId);
    spawnContentPipeline({ seriesId, topic, category });

    return NextResponse.json({ seriesId, started: true, resumed: false });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to start pipeline",
      },
      { status: 500 }
    );
  }
}
