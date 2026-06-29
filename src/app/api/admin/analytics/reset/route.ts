import { NextResponse } from "next/server";
import { isServerDatabaseConfigured } from "@/lib/config";
import { resetAllAnalytics } from "@/lib/services/analytics-repository";

export async function POST() {
  try {
    if (!isServerDatabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured." },
        { status: 503 }
      );
    }

    const result = await resetAllAnalytics();
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Analytics reset failed" },
      { status: 500 }
    );
  }
}
