import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/api/session";
import { isServerDatabaseConfigured } from "@/lib/config";
import { recordReadingProgress } from "@/lib/services/analytics-repository";

export async function POST(request: Request) {
  try {
    if (!isServerDatabaseConfigured()) {
      return NextResponse.json({ ok: false, skipped: true });
    }

    const body = await request.json();
    const seriesId = String(body.seriesId ?? "").trim();
    const episodeNumber = Number(body.episodeNumber ?? 1);
    const panelIndex = Number(body.panelIndex ?? 0);
    const totalPanels = Number(body.totalPanels ?? 10);

    if (!seriesId) {
      return NextResponse.json({ error: "seriesId required" }, { status: 400 });
    }

    const sessionId = getSessionFromRequest(request);
    const progress = await recordReadingProgress(sessionId, {
      seriesId,
      episodeNumber,
      panelIndex,
      totalPanels,
    });

    return NextResponse.json({ ok: true, progress });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Tracking failed" },
      { status: 500 }
    );
  }
}
