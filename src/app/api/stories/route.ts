import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/api/session";
import { storyRepository } from "@/lib/services/database";
import { isServerDatabaseConfigured } from "@/lib/config";

export async function GET(request: Request) {
  if (!isServerDatabaseConfigured()) {
    return NextResponse.json({ stories: [], source: "local" });
  }

  try {
    const sessionId = getSessionFromRequest(request);
    const stories = await storyRepository.list(sessionId);
    return NextResponse.json({ stories, source: "supabase" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load stories";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
