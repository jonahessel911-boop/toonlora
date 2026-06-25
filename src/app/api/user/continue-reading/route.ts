import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/api/session";
import { isServerDatabaseConfigured } from "@/lib/config";
import { getContinueReadingForSession } from "@/lib/services/continue-reading";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      20,
      Math.max(1, Number(searchParams.get("limit") ?? 10) || 10)
    );

    if (!isServerDatabaseConfigured()) {
      return NextResponse.json({ items: [], skipped: true });
    }

    const sessionId = getSessionFromRequest(request);
    if (sessionId === "anonymous") {
      return NextResponse.json({ error: "Session required" }, { status: 401 });
    }

    const items = await getContinueReadingForSession(sessionId, limit);
    return NextResponse.json({ items });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to load continue reading",
      },
      { status: 500 }
    );
  }
}
