import { isServerDatabaseConfigured } from "@/lib/config";
import { getProfileBySessionFromDb } from "@/lib/services/profile-repository";
import { ensureSession } from "@/lib/services/story-repository";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { EpisodeCommentRow } from "@/lib/supabase/types";

export type CommentSort = "top" | "newest";
export type CommentReaction = "like" | "dislike";

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
  userReaction?: CommentReaction | null;
}

const LOCAL_KEY = "toonlora-episode-comments";
const LOCAL_REACTIONS_KEY = "toonlora-comment-reactions";

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

function localKey(seriesId: string, episodeNumber: number) {
  return `${LOCAL_KEY}:${seriesId}:${episodeNumber}`;
}

function localReactionsKey(
  sessionId: string,
  seriesId: string,
  episodeNumber: number
) {
  return `${LOCAL_REACTIONS_KEY}:${sessionId}:${seriesId}:${episodeNumber}`;
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

function readLocalReactions(
  sessionId: string,
  seriesId: string,
  episodeNumber: number
): Record<string, CommentReaction> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(
      localReactionsKey(sessionId, seriesId, episodeNumber)
    );
    return raw ? (JSON.parse(raw) as Record<string, CommentReaction>) : {};
  } catch {
    return {};
  }
}

function writeLocalReactions(
  sessionId: string,
  seriesId: string,
  episodeNumber: number,
  reactions: Record<string, CommentReaction>
) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    localReactionsKey(sessionId, seriesId, episodeNumber),
    JSON.stringify(reactions)
  );
}

function applyReactionDelta(
  comment: EpisodeComment,
  previous: CommentReaction | null,
  next: CommentReaction | null
): EpisodeComment {
  let { likes, dislikes } = comment;

  if (previous === "like") likes = Math.max(0, likes - 1);
  if (previous === "dislike") dislikes = Math.max(0, dislikes - 1);
  if (next === "like") likes += 1;
  if (next === "dislike") dislikes += 1;

  return {
    ...comment,
    likes,
    dislikes,
    userReaction: next,
  };
}

function resolveNextReaction(
  current: CommentReaction | null,
  clicked: CommentReaction
): CommentReaction | null {
  return current === clicked ? null : clicked;
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
  sort: CommentSort = "top",
  sessionId?: string
): EpisodeComment[] {
  const reactions =
    sessionId && typeof window !== "undefined"
      ? readLocalReactions(sessionId, seriesId, episodeNumber)
      : {};

  const comments = readLocal(seriesId, episodeNumber).map((comment) => ({
    ...comment,
    userReaction: reactions[comment.id] ?? null,
  }));

  return sortComments(comments, sort);
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
    userReaction: null,
  };
  const existing = readLocal(input.seriesId, input.episodeNumber);
  writeLocal(input.seriesId, input.episodeNumber, [comment, ...existing]);
  return comment;
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

export function reactToCommentLocal(
  sessionId: string,
  seriesId: string,
  episodeNumber: number,
  commentId: string,
  reaction: CommentReaction
): EpisodeComment | null {
  const comments = readLocal(seriesId, episodeNumber);
  const idx = comments.findIndex((c) => c.id === commentId);
  if (idx < 0) return null;

  const reactions = readLocalReactions(sessionId, seriesId, episodeNumber);
  const previous = reactions[commentId] ?? null;
  const next = resolveNextReaction(previous, reaction);

  const updated = applyReactionDelta(comments[idx], previous, next);
  comments[idx] = updated;

  if (next === null) {
    delete reactions[commentId];
  } else {
    reactions[commentId] = next;
  }

  writeLocal(seriesId, episodeNumber, comments);
  writeLocalReactions(sessionId, seriesId, episodeNumber, reactions);
  return updated;
}
