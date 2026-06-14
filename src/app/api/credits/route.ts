import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/api/session";
import { creditsRepository } from "@/lib/services/database";
import { isServerDatabaseConfigured } from "@/lib/config";

export async function GET(request: Request) {
  if (!isServerDatabaseConfigured()) {
    return NextResponse.json({ credits: 10, freeUsed: false, source: "local" });
  }

  try {
    const sessionId = getSessionFromRequest(request);
    const data = await creditsRepository.get(sessionId);
    return NextResponse.json({ ...data, source: "supabase" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load credits";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sessionId = getSessionFromRequest(request);
    const body = await request.json().catch(() => ({}));
    const action = body.action as string;

    if (action === "consume") {
      const ok = await creditsRepository.consume(sessionId);
      const data = await creditsRepository.get(sessionId);
      return NextResponse.json({ success: ok, ...data });
    }

    if (action === "add" && typeof body.amount === "number") {
      const credits = await creditsRepository.add(sessionId, body.amount);
      return NextResponse.json({ credits });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Credits error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
