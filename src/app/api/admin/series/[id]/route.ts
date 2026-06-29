import { NextResponse } from "next/server";
import { isServerDatabaseConfigured } from "@/lib/config";
import {
  deleteSeriesFromDb,
  updateSeriesCategory,
  updateSeriesPublishing,
} from "@/lib/services/catalog-repository";
import { getStoryFromDb } from "@/lib/services/story-repository";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  if (!isServerDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  try {
    const story = await getStoryFromDb(id);
    if (!story) {
      return NextResponse.json({ error: "Series not found." }, { status: 404 });
    }
    return NextResponse.json({ story });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load series" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;

  if (!isServerDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const action = body.action as string | undefined;

    if (action === "publish") {
      await updateSeriesPublishing(id, { status: "published", isPublic: true });
    } else if (action === "unpublish") {
      await updateSeriesPublishing(id, { status: "draft", isPublic: false });
    } else if (typeof body.category === "string" && body.category.trim()) {
      await updateSeriesCategory(id, body.category.trim());
    } else if (body.featuredRank !== undefined) {
      await updateSeriesPublishing(id, {
        featuredRank: body.featuredRank === "" ? null : Number(body.featuredRank),
      });
    } else {
      return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }

    const story = await getStoryFromDb(id);
    return NextResponse.json({ story });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  if (!isServerDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  try {
    await deleteSeriesFromDb(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Delete failed" },
      { status: 500 }
    );
  }
}
