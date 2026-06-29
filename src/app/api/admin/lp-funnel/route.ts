import { NextResponse } from "next/server";
import { isServerDatabaseConfigured } from "@/lib/config";
import { getLpFunnelReports } from "@/lib/services/analytics-repository";

export async function GET(request: Request) {
  try {
    if (!isServerDatabaseConfigured()) {
      return NextResponse.json(
        {
          error:
            "Database not configured. Set Supabase env vars and run migrations.",
        },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get("days");
    const days =
      daysParam === "all" || daysParam === "0"
        ? null
        : Math.max(1, Number(daysParam) || 30);

    const data = await getLpFunnelReports(days);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "LP funnel reporting failed" },
      { status: 500 }
    );
  }
}
