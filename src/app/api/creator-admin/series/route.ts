import { NextResponse } from "next/server";
import { isServerDatabaseConfigured } from "@/lib/config";
import { listPipelineSeriesAdmin } from "@/lib/services/pipeline-panels-repository";

export async function GET() {
  if (!isServerDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured." },
      { status: 503 }
    );
  }

  try {
    const series = await listPipelineSeriesAdmin();
    return NextResponse.json({ series });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list series" },
      { status: 500 }
    );
  }
}
