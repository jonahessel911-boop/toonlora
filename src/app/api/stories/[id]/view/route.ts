import { NextResponse } from "next/server";
import { isServerDatabaseConfigured } from "@/lib/config";
import {
  getSeriesViewCount,
  incrementSeriesViewCount,
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
    const viewsCount = await getSeriesViewCount(id);
    if (viewsCount === null) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, viewsCount });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "View lookup failed" },
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
    const viewsCount = await incrementSeriesViewCount(id);
    if (viewsCount === null) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, viewsCount });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "View tracking failed" },
      { status: 500 }
    );
  }
}
