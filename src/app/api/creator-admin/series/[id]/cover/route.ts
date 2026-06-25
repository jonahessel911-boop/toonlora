import { NextResponse } from "next/server";
import { isServerDatabaseConfigured } from "@/lib/config";
import { generateSeriesCover } from "@/lib/services/series-cover-service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
  if (!isServerDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured." },
      { status: 503 }
    );
  }

  try {
    const { id } = await context.params;
    const result = await generateSeriesCover(id);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Cover generation failed",
      },
      { status: 500 }
    );
  }
}
