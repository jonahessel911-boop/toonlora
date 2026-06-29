import { NextResponse } from "next/server";
import { isServerDatabaseConfigured } from "@/lib/config";
import { resetLpFunnelAnalytics } from "@/lib/services/analytics-repository";

export async function POST() {
  try {
    if (!isServerDatabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured." },
        { status: 503 }
      );
    }

    const result = await resetLpFunnelAnalytics();
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
