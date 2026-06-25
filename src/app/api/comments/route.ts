import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/api/session";
import {
  createEpisodeComment,
  listEpisodeComments,
  type CommentSort,
} from "@/lib/services/comments-repository";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const seriesId = searchParams.get("seriesId")?.trim() ?? "";
    const episodeNumber = Number(searchParams.get("episodeNumber") ?? 1);
    const sort = (searchParams.get("sort") ?? "top") as CommentSort;

    if (!seriesId) {
      return NextResponse.json({ error: "seriesId required" }, { status: 400 });
    }

    const sessionId = getSessionFromRequest(request);
    const comments = await listEpisodeComments(
      seriesId,
      episodeNumber,
      sort === "newest" ? "newest" : "top",
      sessionId
    );

    return NextResponse.json({ comments, count: comments.length });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load comments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const seriesId = String(body.seriesId ?? "").trim();
    const episodeNumber = Number(body.episodeNumber ?? 1);
    const text = String(body.body ?? "").trim();
    const authorName = String(body.authorName ?? "").trim();
    const authorEmail = String(body.authorEmail ?? "").trim().toLowerCase();
    const isSpoiler = Boolean(body.isSpoiler);

    if (!seriesId || !authorName || !authorEmail) {
      return NextResponse.json(
        { error: "seriesId, authorName, and authorEmail are required." },
        { status: 400 }
      );
    }

    if (!text) {
      return NextResponse.json(
        { error: "Comment cannot be empty." },
        { status: 400 }
      );
    }

    const sessionId = getSessionFromRequest(request);
    const comment = await createEpisodeComment(sessionId, {
      seriesId,
      episodeNumber,
      body: text,
      authorName,
      authorEmail,
      isSpoiler,
    });

    return NextResponse.json({ comment });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to post comment" },
      { status: 500 }
    );
  }
}
