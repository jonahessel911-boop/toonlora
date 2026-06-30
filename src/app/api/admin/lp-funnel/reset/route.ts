import { NextResponse } from "next/server";
import { isServerDatabaseConfigured } from "@/lib/config";
import { resetLpFunnelAnalytics } from "@/lib/services/analytics-repository";

export async function POST(request: Request) {
  try {
    if (!isServerDatabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured." },
        { status: 503 }
      );
    }

    const body = (await request.json()) as { lpId?: string };
    const lpId = body.lpId?.trim();

    if (!lpId) {
      return NextResponse.json({ error: "lpId is required." }, { status: 400 });
    }

    const result = await resetLpFunnelAnalytics(lpId);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "LP funnel reset failed",
      },
      { status: 500 }
    );
  }
}
