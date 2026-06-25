import { NextResponse } from "next/server";
import { isServerDatabaseConfigured } from "@/lib/config";
import { regeneratePanelImage } from "@/lib/services/panel-image-qa";

interface RouteContext {
  params: Promise<{ panelId: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  if (!isServerDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured." },
      { status: 503 }
    );
  }

  try {
    const { panelId } = await context.params;
    const body = (await request.json()) as {
      prompt?: string;
      applyAiFix?: boolean;
      autoReview?: boolean;
    };

    const result = await regeneratePanelImage(panelId, {
      prompt: body.prompt,
      applyAiFix: body.applyAiFix ?? true,
      autoReview: body.autoReview ?? true,
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Image regeneration failed",
      },
      { status: 500 }
    );
  }
}
