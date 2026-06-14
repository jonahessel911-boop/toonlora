import { NextResponse } from "next/server";
import { storyRepository } from "@/lib/services/database";
import { isServerDatabaseConfigured } from "@/lib/config";
import type { Story } from "@/types/story";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  if (!isServerDatabaseConfigured()) {
    return NextResponse.json({ story: null, source: "local" });
  }

  try {
    const story = await storyRepository.getById(id);
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }
    return NextResponse.json({ story, source: "supabase" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load story";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;

  if (!isServerDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const body = (await request.json()) as Story;
    const sessionId = request.headers.get("X-Session-Id")?.trim() || "anonymous";
    const story = await storyRepository.save({ ...body, id }, sessionId);
    return NextResponse.json({ story });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save story";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
