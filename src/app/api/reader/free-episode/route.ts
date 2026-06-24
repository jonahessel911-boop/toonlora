import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/api/session";
import { isServerDatabaseConfigured } from "@/lib/config";
import { resolveFreeEpisodeAccess } from "@/lib/services/free-read-repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seriesId = searchParams.get("seriesId")?.trim() ?? "";
  const episodeNumber = Math.max(
    1,
    Number(searchParams.get("episodeNumber") ?? 1) || 1
  );

  if (!seriesId) {
    return NextResponse.json({ error: "seriesId required" }, { status: 400 });
  }

  if (!isServerDatabaseConfigured()) {
    return NextResponse.json({ allowed: true, claimedSeriesId: null });
  }

  try {
    const sessionId = getSessionFromRequest(request);
    const result = await resolveFreeEpisodeAccess(
      sessionId,
      seriesId,
      episodeNumber
    );
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Access check failed" },
      { status: 500 }
    );
  }
}
