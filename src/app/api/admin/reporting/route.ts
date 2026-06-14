import { NextResponse } from "next/server";
import { isServerDatabaseConfigured } from "@/lib/config";
import { getAdminReportingMetrics } from "@/lib/services/analytics-repository";

export async function GET() {
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

    const metrics = await getAdminReportingMetrics();
    return NextResponse.json({ metrics });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Reporting failed" },
      { status: 500 }
    );
  }
}
