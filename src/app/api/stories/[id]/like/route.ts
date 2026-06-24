import { NextResponse } from "next/server";
import { isServerDatabaseConfigured } from "@/lib/config";
import {
  getSeriesLikeCount,
  incrementSeriesLikeCount,
} from "@/lib/services/catalog-repository";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  if (!isServerDatabaseConfigured()) {
    return NextResponse.json({ ok: false, skipped: true }, { status: 503 });
  }

  try {
    const likesCount = await getSeriesLikeCount(id);
    if (likesCount === null) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, likesCount });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Like lookup failed" },
      { status: 500 }
    );
  }
}

export async function POST(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  if (!isServerDatabaseConfigured()) {
    return NextResponse.json({ ok: false, skipped: true }, { status: 503 });
  }

  try {
    const likesCount = await incrementSeriesLikeCount(id);
    if (likesCount === null) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, likesCount });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Like tracking failed" },
      { status: 500 }
    );
  }
}
