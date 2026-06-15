import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/api/session";
import { isServerDatabaseConfigured } from "@/lib/config";
import { updateSeriesPublishing } from "@/lib/services/catalog-repository";
import { getStoryFromDb } from "@/lib/services/story-repository";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;

  if (!isServerDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  try {
    const sessionId = getSessionFromRequest(request);
    const story = await getStoryFromDb(id);

    if (!story) {
      return NextResponse.json({ error: "Series not found." }, { status: 404 });
    }

    // Only owner can publish creator drafts (admin series use admin API)
    const supabase = (await import("@/lib/supabase/admin")).getSupabaseAdmin();
    if (supabase) {
      const { data: row } = await supabase
        .from("series")
        .select("owner_session_id")
        .eq("id", id)
        .single();

      if (row && (row as { owner_session_id: string }).owner_session_id !== sessionId) {
        return NextResponse.json({ error: "Not authorized." }, { status: 403 });
      }
    }

    await updateSeriesPublishing(id, { status: "published", isPublic: true });
    const updated = await getStoryFromDb(id);
    return NextResponse.json({ story: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Publish failed" },
      { status: 500 }
    );
  }
}
