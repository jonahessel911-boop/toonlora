import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/api/session";
import { isServerDatabaseConfigured } from "@/lib/config";
import { recordPlatformHeartbeat } from "@/lib/services/analytics-repository";

export async function POST(request: Request) {
  try {
    if (!isServerDatabaseConfigured()) {
      return NextResponse.json({ ok: false, skipped: true });
    }

    const body = await request.json().catch(() => ({}));
    const entryPath = String(body.path ?? "/");

    const sessionId = getSessionFromRequest(request);
    const session = await recordPlatformHeartbeat(sessionId, entryPath);

    return NextResponse.json({ ok: true, session });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Heartbeat failed" },
      { status: 500 }
    );
  }
}
