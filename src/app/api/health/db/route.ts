import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/services/db-health";

/** GET /api/health/db — test Supabase connection and migrations */
export async function GET() {
  try {
    const report = await checkDatabaseHealth();
    return NextResponse.json(report, { status: report.ok ? 200 : 503 });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Health check failed",
      },
      { status: 500 }
    );
  }
}
