import { NextResponse } from "next/server";
import { isServerDatabaseConfigured } from "@/lib/config";
import { saveHumanPanelFeedback } from "@/lib/services/panel-image-qa";

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
      rating?: "approve" | "reject";
      note?: string;
    };

    if (body.rating !== "approve" && body.rating !== "reject") {
      return NextResponse.json(
        { error: "rating must be approve or reject" },
        { status: 400 }
      );
    }

    const panel = await saveHumanPanelFeedback(panelId, {
      rating: body.rating,
      note: body.note,
    });

    return NextResponse.json({ panel });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save feedback" },
      { status: 500 }
    );
  }
}
