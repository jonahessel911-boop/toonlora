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

export interface CreateCommentInput {
  seriesId: string;
  episodeNumber: number;
  body: string;
  authorName: string;
  authorEmail: string;
  isSpoiler?: boolean;
}

const LOCAL_KEY = "toonlora-episode-comments";
const LOCAL_REACTIONS_KEY = "toonlora-comment-reactions";

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
