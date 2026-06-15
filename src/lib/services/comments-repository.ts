import { isServerDatabaseConfigured } from "@/lib/config";
import { getProfileBySessionFromDb } from "@/lib/services/profile-repository";
import { ensureSession } from "@/lib/services/story-repository";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { EpisodeCommentRow } from "@/lib/supabase/types";

export type CommentSort = "top" | "newest";

export interface EpisodeComment {
  id: string;
  seriesId: string;
  episodeNumber: number;
  profileId: string | null;
  authorName: string;
  authorEmail: string | null;
  body: string;
  likes: number;
  dislikes: number;
  isSpoiler: boolean;
  createdAt: string;
}

const LOCAL_KEY = "toonlora-episode-comments";

function rowToComment(row: EpisodeCommentRow): EpisodeComment {
  return {
    id: row.id,
    seriesId: row.series_id,
    episodeNumber: row.episode_number,
    profileId: row.profile_id,
    authorName: row.author_name,
    authorEmail: row.author_email,
    body: row.body,
    likes: row.likes,
    dislikes: row.dislikes,
    isSpoiler: row.is_spoiler,
    createdAt: row.created_at,
  };
}

function localKey(seriesId: string, episodeNumber: number) {
  return `${LOCAL_KEY}:${seriesId}:${episodeNumber}`;
}

function readLocal(seriesId: string, episodeNumber: number): EpisodeComment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(localKey(seriesId, episodeNumber));
    return raw ? (JSON.parse(raw) as EpisodeComment[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(
  seriesId: string,
  episodeNumber: number,
  comments: EpisodeComment[]
) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    localKey(seriesId, episodeNumber),
    JSON.stringify(comments)
  );
}

function sortComments(
  comments: EpisodeComment[],
  sort: CommentSort
): EpisodeComment[] {
  const copy = [...comments];
  if (sort === "newest") {
    return copy.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  return copy.sort((a, b) => {
    if (b.likes !== a.likes) return b.likes - a.likes;
    return (
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });
}

export function listCommentsFromClient(
  seriesId: string,
  episodeNumber: number,
  sort: CommentSort = "top"
): EpisodeComment[] {
  return sortComments(readLocal(seriesId, episodeNumber), sort);
}

export function postCommentFromClient(
  input: CreateCommentInput
): EpisodeComment {
  const body = input.body.trim();
  if (!body) throw new Error("Comment cannot be empty.");

  const comment: EpisodeComment = {
    id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    seriesId: input.seriesId,
    episodeNumber: input.episodeNumber,
    profileId: null,
    authorName: input.authorName.trim(),
    authorEmail: input.authorEmail.trim().toLowerCase(),
    body,
    likes: 0,
    dislikes: 0,
    isSpoiler: input.isSpoiler ?? false,
    createdAt: new Date().toISOString(),
  };
  const existing = readLocal(input.seriesId, input.episodeNumber);
  writeLocal(input.seriesId, input.episodeNumber, [comment, ...existing]);
  return comment;
}

export async function listEpisodeComments(
  seriesId: string,
  episodeNumber: number,
  sort: CommentSort = "top"
): Promise<EpisodeComment[]> {
  if (!isServerDatabaseConfigured()) {
    return [];
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  let query = supabase
    .from("episode_comments")
    .select("*")
    .eq("series_id", seriesId)
    .eq("episode_number", episodeNumber);

  if (sort === "newest") {
    query = query.order("created_at", { ascending: false });
  } else {
    query = query
      .order("likes", { ascending: false })
      .order("created_at", { ascending: false });
  }

  const { data, error } = await query.limit(100);
  if (error) throw new Error(error.message);

  return (data as EpisodeCommentRow[]).map(rowToComment);
}

export interface CreateCommentInput {
  seriesId: string;
  episodeNumber: number;
  body: string;
  authorName: string;
  authorEmail: string;
  isSpoiler?: boolean;
}

export async function createEpisodeComment(
  sessionId: string,
  input: CreateCommentInput
): Promise<EpisodeComment> {
  const body = input.body.trim();
  if (!body) throw new Error("Comment cannot be empty.");

  if (!isServerDatabaseConfigured()) {
    throw new Error("Use postCommentFromClient when database is disabled.");
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured");

  await ensureSession(sessionId);
  const profile = await getProfileBySessionFromDb(sessionId);

  const { data, error } = await supabase
    .from("episode_comments")
    .insert({
      series_id: input.seriesId,
      episode_number: input.episodeNumber,
      profile_id: profile?.id ?? null,
      session_id: sessionId,
      author_name: input.authorName.trim(),
      author_email: input.authorEmail.trim().toLowerCase(),
      body,
      is_spoiler: input.isSpoiler ?? false,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToComment(data as EpisodeCommentRow);
}

export async function reactToComment(
  commentId: string,
  reaction: "like" | "dislike"
): Promise<EpisodeComment> {
  if (!isServerDatabaseConfigured()) {
    throw new Error("Reactions require database in server mode.");
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured");

  const { data: existing, error: fetchError } = await supabase
    .from("episode_comments")
    .select("*")
    .eq("id", commentId)
    .single();

  if (fetchError || !existing) {
    throw new Error("Comment not found.");
  }

  const row = existing as EpisodeCommentRow;
  const update =
    reaction === "like"
      ? { likes: row.likes + 1 }
      : { dislikes: row.dislikes + 1 };

  const { data, error } = await supabase
    .from("episode_comments")
    .update(update)
    .eq("id", commentId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToComment(data as EpisodeCommentRow);
}

export function reactToCommentLocal(
  seriesId: string,
  episodeNumber: number,
  commentId: string,
  reaction: "like" | "dislike"
): EpisodeComment | null {
  const comments = readLocal(seriesId, episodeNumber);
  const idx = comments.findIndex((c) => c.id === commentId);
  if (idx < 0) return null;

  const updated = { ...comments[idx] };
  if (reaction === "like") updated.likes += 1;
  else updated.dislikes += 1;

  comments[idx] = updated;
  writeLocal(seriesId, episodeNumber, comments);
  return updated;
}
