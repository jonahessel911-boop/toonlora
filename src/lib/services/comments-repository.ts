import { isServerDatabaseConfigured } from "@/lib/config";
import {
  type CommentReaction,
  type CommentSort,
  type CreateCommentInput,
  type EpisodeComment,
} from "@/lib/services/comments-client";
import { getProfileBySessionFromDb } from "@/lib/services/profile-lookup";
import { ensureSession } from "@/lib/services/story-repository";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { EpisodeCommentRow } from "@/lib/supabase/types";

export type {
  CommentReaction,
  CommentSort,
  CreateCommentInput,
  EpisodeComment,
} from "@/lib/services/comments-client";

function rowToComment(
  row: EpisodeCommentRow,
  userReaction: CommentReaction | null = null
): EpisodeComment {
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
    userReaction,
  };
}

function resolveNextReaction(
  current: CommentReaction | null,
  clicked: CommentReaction
): CommentReaction | null {
  return current === clicked ? null : clicked;
}

export async function listEpisodeComments(
  seriesId: string,
  episodeNumber: number,
  sort: CommentSort = "top",
  sessionId?: string
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

  const rows = data as EpisodeCommentRow[];
  if (!sessionId || rows.length === 0) {
    return rows.map((row) => rowToComment(row));
  }

  const commentIds = rows.map((row) => row.id);
  const { data: reactionRows, error: reactionError } = await supabase
    .from("comment_reactions")
    .select("comment_id, reaction")
    .eq("session_id", sessionId)
    .in("comment_id", commentIds);

  if (reactionError) throw new Error(reactionError.message);

  const reactionByComment = new Map<string, CommentReaction>();
  for (const row of reactionRows ?? []) {
    reactionByComment.set(
      row.comment_id as string,
      row.reaction as CommentReaction
    );
  }

  return rows.map((row) =>
    rowToComment(row, reactionByComment.get(row.id) ?? null)
  );
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
  sessionId: string,
  commentId: string,
  reaction: CommentReaction
): Promise<EpisodeComment> {
  if (!isServerDatabaseConfigured()) {
    throw new Error("Reactions require database in server mode.");
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured");

  await ensureSession(sessionId);
  const profile = await getProfileBySessionFromDb(sessionId);

  const { data: existing, error: fetchError } = await supabase
    .from("episode_comments")
    .select("*")
    .eq("id", commentId)
    .single();

  if (fetchError || !existing) {
    throw new Error("Comment not found.");
  }

  const row = existing as EpisodeCommentRow;

  const { data: priorReaction } = await supabase
    .from("comment_reactions")
    .select("id, reaction")
    .eq("comment_id", commentId)
    .eq("session_id", sessionId)
    .maybeSingle();

  const previous = (priorReaction?.reaction as CommentReaction | undefined) ?? null;
  const next = resolveNextReaction(previous, reaction);

  let likes = row.likes;
  let dislikes = row.dislikes;

  if (previous === "like") likes = Math.max(0, likes - 1);
  if (previous === "dislike") dislikes = Math.max(0, dislikes - 1);
  if (next === "like") likes += 1;
  if (next === "dislike") dislikes += 1;

  const { data: updated, error: updateError } = await supabase
    .from("episode_comments")
    .update({ likes, dislikes })
    .eq("id", commentId)
    .select()
    .single();

  if (updateError) throw new Error(updateError.message);

  if (next === null) {
    if (priorReaction?.id) {
      await supabase.from("comment_reactions").delete().eq("id", priorReaction.id);
    }
  } else if (priorReaction?.id) {
    await supabase
      .from("comment_reactions")
      .update({ reaction: next, profile_id: profile?.id ?? null })
      .eq("id", priorReaction.id);
  } else {
    await supabase.from("comment_reactions").insert({
      comment_id: commentId,
      session_id: sessionId,
      profile_id: profile?.id ?? null,
      reaction: next,
    });
  }

  return rowToComment(updated as EpisodeCommentRow, next);
}
