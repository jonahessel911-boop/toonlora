import { NextResponse } from "next/server";
import {
  reactToComment,
  reactToCommentLocal,
} from "@/lib/services/comments-repository";
import { isServerDatabaseConfigured } from "@/lib/config";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const reaction = body.reaction === "dislike" ? "dislike" : "like";
    const seriesId = String(body.seriesId ?? "").trim();
    const episodeNumber = Number(body.episodeNumber ?? 1);

    if (!isServerDatabaseConfigured()) {
      if (!seriesId) {
        return NextResponse.json({ error: "seriesId required" }, { status: 400 });
      }
      const comment = reactToCommentLocal(
        seriesId,
        episodeNumber,
        id,
        reaction
      );
      if (!comment) {
        return NextResponse.json({ error: "Comment not found" }, { status: 404 });
      }
      return NextResponse.json({ comment });
    }

    const comment = await reactToComment(id, reaction);
    return NextResponse.json({ comment });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Reaction failed" },
      { status: 500 }
    );
  }
}
