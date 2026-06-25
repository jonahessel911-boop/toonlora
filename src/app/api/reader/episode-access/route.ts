import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/api/session";
import { isServerDatabaseConfigured } from "@/lib/config";
import {
  claimWeeklyFreeEpisode,
  resolveEpisodeAccess,
} from "@/lib/services/free-weekly-repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seriesId = searchParams.get("seriesId")?.trim() ?? "";
  const episodeNumber = Math.max(
    1,
    Number(searchParams.get("episodeNumber") ?? 1) || 1
  );
  const publishedAt = searchParams.get("publishedAt");

  if (!seriesId) {
    return NextResponse.json({ error: "seriesId required" }, { status: 400 });
  }

  if (!isServerDatabaseConfigured()) {
    return NextResponse.json({
      allowed: true,
      tier: "free",
      weeklyFreeRemaining: 1,
      claimedThisWeek: null,
    });
  }

  try {
    const sessionId = getSessionFromRequest(request);
    const result = await resolveEpisodeAccess(
      sessionId,
      seriesId,
      episodeNumber,
      publishedAt
    );
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Access check failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!isServerDatabaseConfigured()) {
    return NextResponse.json({ ok: true });
  }

  try {
    const body = (await request.json()) as {
      seriesId?: string;
      episodeNumber?: number;
    };
    const seriesId = String(body.seriesId ?? "").trim();
    const episodeNumber = Math.max(1, Number(body.episodeNumber) || 1);

    if (!seriesId) {
      return NextResponse.json({ error: "seriesId required" }, { status: 400 });
    }

    const sessionId = getSessionFromRequest(request);
    const access = await resolveEpisodeAccess(sessionId, seriesId, episodeNumber);

    if (!access.allowed) {
      return NextResponse.json(
        { error: "Chapter not available on your plan", reason: access.reason },
        { status: 403 }
      );
    }

    if (access.tier === "free" && access.isRegistered) {
      await claimWeeklyFreeEpisode(sessionId, seriesId, episodeNumber);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Claim failed" },
      { status: 500 }
    );
  }
}
