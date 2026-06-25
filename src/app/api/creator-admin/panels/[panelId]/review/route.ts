import { NextResponse } from "next/server";
import { isServerDatabaseConfigured } from "@/lib/config";
import { runPanelImageQa } from "@/lib/services/panel-image-qa";

interface RouteContext {
  params: Promise<{ panelId: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
  if (!isServerDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured." },
      { status: 503 }
    );
  }

  try {
    const { panelId } = await context.params;
    const result = await runPanelImageQa(panelId);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Image QA failed" },
      { status: 500 }
    );
  }
}
