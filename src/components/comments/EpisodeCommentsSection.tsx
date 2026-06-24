"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import CoverArt from "@/components/ui/CoverArt";
import EpisodeCharactersSection from "@/components/reader/EpisodeCharactersSection";
import { formatChapterShort } from "@/lib/brand";
import { isDatabaseEnabled } from "@/lib/config";
import {
  listCommentsFromClient,
  postCommentFromClient,
  reactToCommentLocal,
  type CommentSort,
  type EpisodeComment,
} from "@/lib/services/comments-repository";
import type { SeriesDetail, SeriesEpisodeListing } from "@/lib/seriesCatalog";
import type { Story } from "@/types/story";
import { useCatalog } from "@/hooks/useCatalog";
import { apiFetch } from "@/lib/session";
import { useUserStore } from "@/store/useUserStore";

interface EpisodeCommentsSectionProps {
  series: SeriesDetail;
  episodeNumber: number;
  story?: Story;
}

function formatCommentDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function EpisodeCarousel({
  episodes,
  seriesId,
  activeEpisode,
  genre,
}: {
  episodes: SeriesEpisodeListing[];
  seriesId: string;
  activeEpisode: number;
  genre: string;
}) {
  return (
    <div className="border-b border-[#E8E8E8] bg-white">
      <div className="flex gap-3 overflow-x-auto px-4 py-4 scrollbar-hide sm:px-6">
        {episodes.map((ep) => {
          const isActive = ep.number === activeEpisode;
          const label =
            ep.number === 0
              ? "Prologue"
              : `${formatChapterShort(ep.number)} - ${ep.title.replace(/^Chapter \d+\s*-?\s*/i, "").slice(0, 12)}`;

          return (
            <Link
              key={ep.number}
              href={`/story/${seriesId}/read${ep.number > 1 ? `?ep=${ep.number}` : ""}`}
              className="flex w-[88px] shrink-0 flex-col gap-1.5 sm:w-[100px]"
            >
              <div
                className={`relative aspect-square overflow-hidden rounded-lg ring-2 transition ${
                  isActive ? "ring-[#00DC64]" : "ring-transparent"
                }`}
              >
                <CoverArt
                  gradient={ep.coverGradient}
                  genre={genre}
                  showOverlay={false}
                  className="h-full w-full"
                />
              </div>
              <p
                className={`truncate text-center text-[10px] font-medium sm:text-[11px] ${
                  isActive ? "text-[#00DC64]" : "text-[#666]"
                }`}
              >
                {label}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function TrendingSidebar() {
  const { series: items } = useCatalog({ sort: "popular", limit: 5 });

  return (
    <aside className="hidden w-full shrink-0 lg:block lg:w-[300px] xl:w-[320px]">
      <div className="sticky top-4 space-y-6">
        <section>
          <h3 className="text-sm font-bold text-[#222]">Trending &amp; Popular</h3>
          <ol className="mt-3 space-y-3">
            {items.map((story, i) => (
              <li key={story.id}>
                <Link
                  href={`/story/${story.id}`}
                  className="flex gap-3 transition hover:opacity-80"
                >
                  <span className="w-4 shrink-0 text-sm font-bold text-[#888]">
                    {i + 1}
                  </span>
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
                    <CoverArt
                      gradient={story.coverGradient}
                      genre={String(story.genre)}
                      showOverlay={false}
                      className="h-full w-full"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase text-[#888]">
                      {story.genre}
                    </p>
                    <p className="truncate text-sm font-bold text-[#222]">
                      {story.title}
                    </p>
                    <p className="truncate text-xs text-[#666]">
                      {story.creatorDisplayName}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </aside>
  );
}

function CommentItem({
  comment,
  isTop,
  onReact,
}: {
  comment: EpisodeComment;
  isTop: boolean;
  onReact: (id: string, reaction: "like" | "dislike") => void;
}) {
  const [revealed, setRevealed] = useState(!comment.isSpoiler);

  return (
    <article className="border-b border-[#E8E8E8] py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-[#222]">
              {comment.authorName}
            </span>
            {isTop && comment.likes >= 3 ? (
              <span className="rounded bg-[#00DC64] px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                Top
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-[#999]">
            {formatCommentDate(comment.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-3">
        {comment.isSpoiler && !revealed ? (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="rounded-lg bg-[#F5F5F5] px-4 py-3 text-sm font-medium text-[#666]"
          >
            Tap to reveal spoiler
          </button>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#333]">
            {comment.body}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          className="text-xs font-semibold text-[#666] hover:text-[#222]"
        >
          Replies 0
        </button>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onReact(comment.id, "like")}
            className="flex items-center gap-1.5 text-xs text-[#666] hover:text-[#222]"
            aria-label="Like comment"
          >
            <span aria-hidden>👍</span>
            <span className="font-semibold">{comment.likes.toLocaleString()}</span>
          </button>
          <button
            type="button"
            onClick={() => onReact(comment.id, "dislike")}
            className="flex items-center gap-1.5 text-xs text-[#666] hover:text-[#222]"
            aria-label="Dislike comment"
          >
            <span aria-hidden>👎</span>
            <span className="font-semibold">
              {comment.dislikes.toLocaleString()}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default function EpisodeCommentsSection({
  series,
  episodeNumber,
  story,
}: EpisodeCommentsSectionProps) {
  const { email, fullName } = useUserStore();
  const loggedIn = Boolean(email && fullName);
  const [sort, setSort] = useState<CommentSort>("top");
  const [comments, setComments] = useState<EpisodeComment[]>([]);
  const [draft, setDraft] = useState("");
  const [spoiler, setSpoiler] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const loadComments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (isDatabaseEnabled()) {
        const res = await apiFetch(
          `/api/comments?seriesId=${encodeURIComponent(series.id)}&episodeNumber=${episodeNumber}&sort=${sort}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load comments");
        setComments(data.comments ?? []);
      } else {
        setComments(
          listCommentsFromClient(series.id, episodeNumber, sort)
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [series.id, episodeNumber, sort]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  const handlePost = async () => {
    if (!loggedIn || !draft.trim()) return;
    setPosting(true);
    setError("");

    try {
      if (isDatabaseEnabled()) {
        const res = await apiFetch("/api/comments", {
          method: "POST",
          body: JSON.stringify({
            seriesId: series.id,
            episodeNumber,
            body: draft,
            authorName: fullName,
            authorEmail: email,
            isSpoiler: spoiler,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to post comment");
        setComments((prev) => [data.comment, ...prev]);
      } else {
        const comment = postCommentFromClient({
          seriesId: series.id,
          episodeNumber,
          body: draft,
          authorName: fullName,
          authorEmail: email,
          isSpoiler: spoiler,
        });
        setComments((prev) => [comment, ...prev]);
      }
      setDraft("");
      setSpoiler(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  const handleReact = async (commentId: string, reaction: "like" | "dislike") => {
    try {
      if (isDatabaseEnabled()) {
        const res = await apiFetch(`/api/comments/${commentId}/react`, {
          method: "POST",
          body: JSON.stringify({
            reaction,
            seriesId: series.id,
            episodeNumber,
          }),
        });
        const data = await res.json();
        if (!res.ok) return;
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? data.comment : c))
        );
      } else {
        const updated = reactToCommentLocal(
          series.id,
          episodeNumber,
          commentId,
          reaction
        );
        if (updated) {
          setComments((prev) =>
            prev.map((c) => (c.id === commentId ? updated : c))
          );
        }
      }
    } catch {
      /* ignore */
    }
  };

  const creatorsLabel = series.creators.join(", ");

  return (
    <section id="episode-comments" className="bg-white">
      <EpisodeCarousel
        episodes={series.episodes}
        seriesId={series.id}
        activeEpisode={episodeNumber}
        genre={series.genre}
      />

      {story ? (
        <EpisodeCharactersSection story={story} episodeNumber={episodeNumber} />
      ) : null}

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          <div className="min-w-0 flex-1">
            <div className="mb-6">
              <p className="text-sm font-bold text-[#222]">Creator</p>
              <p className="mt-1 text-sm text-[#666]">{creatorsLabel}</p>
            </div>

            <div className="mb-4 flex items-baseline gap-2">
              <h2 className="text-lg font-bold uppercase tracking-wide text-[#222]">
                Comments
              </h2>
              <span className="text-lg font-bold text-[#222]">
                {comments.length.toLocaleString()}
              </span>
            </div>

            <div className="mb-6 overflow-hidden rounded-lg border border-[#D9D9D9] bg-white">
              {loggedIn ? (
                <>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Share your thoughts on this episode…"
                    rows={4}
                    className="w-full resize-none px-4 py-3 text-sm text-[#222] outline-none placeholder:text-[#999]"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E8E8E8] px-4 py-3">
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-[#666]">
                      <input
                        type="checkbox"
                        checked={spoiler}
                        onChange={(e) => setSpoiler(e.target.checked)}
                        className="rounded border-[#CCC]"
                      />
                      Spoiler
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="hidden text-xs text-[#999] sm:inline">
                        Posting as <strong className="text-[#222]">{fullName}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => void handlePost()}
                        disabled={posting || !draft.trim()}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#222] text-white transition hover:bg-[#444] disabled:opacity-40"
                        aria-label="Post comment"
                      >
                        {posting ? "…" : "➤"}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-[#666]">
                    Please log in to leave a comment
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-3">
                    <Link
                      href="/signin"
                      className="rounded-full bg-[#222] px-5 py-2 text-sm font-semibold text-white"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      className="rounded-full border border-[#CCC] px-5 py-2 text-sm font-semibold text-[#222]"
                    >
                      Create account
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {error ? (
              <p className="mb-4 text-sm text-red-600">{error}</p>
            ) : null}

            <div className="mb-4 flex gap-6 border-b border-[#E8E8E8]">
              {(["top", "newest"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSort(tab)}
                  className={`pb-3 text-xs font-bold uppercase tracking-wide transition ${
                    sort === tab
                      ? "border-b-2 border-[#222] text-[#222]"
                      : "text-[#999] hover:text-[#666]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {loading ? (
              <p className="py-8 text-center text-sm text-[#999]">
                Loading comments…
              </p>
            ) : comments.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#999]">
                No comments yet. Be the first to share your thoughts!
              </p>
            ) : (
              <div>
                {comments.map((comment, i) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    isTop={sort === "top" && i < 3}
                    onReact={handleReact}
                  />
                ))}
              </div>
            )}
          </div>

          <TrendingSidebar />
        </div>
      </div>
    </section>
  );
}
