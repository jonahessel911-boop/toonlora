import { NextResponse } from "next/server";
import { isServerDatabaseConfigured } from "@/lib/config";
import { createExtraPanel, createExtraPanels } from "@/lib/services/extra-panel-service";

interface RouteContext {
  params: Promise<{ episodeId: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  if (!isServerDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured." },
      { status: 503 }
    );
  }

  try {
    const { episodeId } = await context.params;
    const body = (await request.json().catch(() => ({}))) as {
      count?: number;
      direction?: string;
      generateImage?: boolean;
      autoReview?: boolean;
    };

    const count = Math.min(
      20,
      Math.max(1, Math.floor(Number(body.count) || 1))
    );

    if (count === 1) {
      const result = await createExtraPanel(episodeId, {
        direction: body.direction,
        generateImage: body.generateImage,
        autoReview: body.autoReview,
      });
      return NextResponse.json(result);
    }

    const result = await createExtraPanels(episodeId, {
      count,
      direction: body.direction,
      generateImage: body.generateImage,
      autoReview: body.autoReview,
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Extra panel creation failed",
      },
      { status: 500 }
    );
  }
}
