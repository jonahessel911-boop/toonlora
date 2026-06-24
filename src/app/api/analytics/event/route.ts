import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/api/session";
import { isServerDatabaseConfigured } from "@/lib/config";
import { recordAnalyticsEventToDb } from "@/lib/services/analytics-repository";

export async function POST(request: Request) {
  try {
    if (!isServerDatabaseConfigured()) {
      return NextResponse.json({ ok: false, skipped: true }, { status: 503 });
    }

    const body = await request.json();
    const eventType = String(body.eventType ?? "").trim();
    if (!eventType) {
      return NextResponse.json({ error: "eventType required" }, { status: 400 });
    }

    const sessionId = getSessionFromRequest(request);
    await recordAnalyticsEventToDb(sessionId, {
      eventType,
      seriesId: body.seriesId ? String(body.seriesId) : undefined,
      episodeNumber: body.episodeNumber ? Number(body.episodeNumber) : undefined,
      planId: body.planId ? String(body.planId) : undefined,
      properties:
        body.properties && typeof body.properties === "object"
          ? (body.properties as Record<string, string | number | boolean>)
          : undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Event tracking failed" },
      { status: 500 }
    );
  }
}
