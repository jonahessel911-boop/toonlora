import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/api/session";
import { isServerDatabaseConfigured } from "@/lib/config";
import { getUserReadingEngagement } from "@/lib/services/user-reading-engagement";

export async function GET(request: Request) {
  try {
    if (!isServerDatabaseConfigured()) {
      return NextResponse.json({
        recentReads: [],
        genreAffinity: [],
        topEngagedStories: [],
        skipped: true,
      });
    }

    const sessionId = getSessionFromRequest(request);
    if (sessionId === "anonymous") {
      return NextResponse.json({ error: "Session required" }, { status: 401 });
    }

    const engagement = await getUserReadingEngagement(sessionId);
    return NextResponse.json(
      engagement ?? {
        recentReads: [],
        genreAffinity: [],
        topEngagedStories: [],
      }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load engagement" },
      { status: 500 }
    );
  }
}
