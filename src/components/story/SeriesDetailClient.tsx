"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import NetflixChapterCard from "@/components/story/NetflixChapterCard";
import NetflixChapterRow from "@/components/story/NetflixChapterRow";
import SimilarStories from "@/components/story/SimilarStories";
import SubscriptionPaywall from "@/components/reader/SubscriptionPaywall";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";
import { fetchPublishedStory, isStoryBrowsable } from "@/lib/fetchPublishedStory";
import { appendAffiliateToHref, getStoredAffiliateSlug } from "@/lib/affiliate/client-tracking";
import { buildPaywallPath, buildReaderSignupPath } from "@/lib/reader/nextEpisodeGate";
import {
  buildFreeEpisodeLimitSignupPath,
  checkEpisodeReadAccess,
} from "@/lib/reader/episodeAccessGate";
import {
  followSeries,
  formatSagaFollowTitle,
  isFollowingSeries,
  unfollowSeries,
} from "@/lib/library/preferences";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { findMockStory } from "@/lib/mock/businessStoryCatalog";
import {
  buildFullEpisodeList,
  getChapterAccessBadge,
  getChapterDescription,
  getPublishedChapterCount,
  getSagaScheduleLabel,
  mockStoryToSeriesDetail,
  resolveChapterListTitle,
} from "@/lib/mock/mockSeriesDetail";
import {
  getBusinessCaseFile,
  parseSagaTitle,
} from "@/lib/mock/sagaMeta";
import { getReadingHistory } from "@/lib/readingHistory";
import { hasCompletedEpisode } from "@/lib/readingProgress";
import { storyToSeriesDetail, type SeriesDetail } from "@/lib/seriesCatalog";
import type { Story } from "@/types/story";
import { trackSeriesView } from "@/lib/trackSeriesView";
import { formatCatalogViews } from "@/types/catalog";
import { useStoryStore } from "@/store/useStoryStore";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import { useUserStore } from "@/store/useUserStore";

type DetailTab = "episodes" | "about" | "similar";

interface SeriesDetailClientProps {
  id: string;
}

function getEpisodeProgress(
  seriesId: string,
  episodeNumber: number,
  currentEpisode: number | null
): number {
  if (hasCompletedEpisode(seriesId, episodeNumber)) return 100;
  if (currentEpisode === episodeNumber) return 42;
  if (currentEpisode !== null && episodeNumber < currentEpisode) return 100;
  return 0;
}

export default function SeriesDetailClient({ id }: SeriesDetailClientProps) {
  const { getStoryById } = useStoryStore();
  const { email } = useUserStore();
  const { requireAuth } = useRequireAuth();
  const {
    hasPaidAccess,
    hydrate: hydrateSubscription,
    isEntrepreneur,
  } = useSubscriptionStore();
  const [series, setSeries] = useState<SeriesDetail | null>(null);
  const [loadedStory, setLoadedStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DetailTab>("episodes");
  const [following, setFollowing] = useState(false);
  const [readingEpisode, setReadingEpisode] = useState<number | null>(null);
  const [fastPassOpen, setFastPassOpen] = useState(false);
  const [fastPassEpisode, setFastPassEpisode] = useState(1);
  const viewTracked = useRef(false);

  const loggedIn = Boolean(email);
  const paid = hasPaidAccess();
  const entrepreneur = isEntrepreneur();

  useEffect(() => {
    void hydrateSubscription();
  }, [hydrateSubscription]);

  useEffect(() => {
    const syncProgress = () => {
      const entry = getReadingHistory().find((e) => e.seriesId === id);
      setReadingEpisode(entry?.episodeNumber ?? null);
    };
    syncProgress();
    window.addEventListener("tl-reading-history", syncProgress);
    window.addEventListener("tl-reading-progress", syncProgress);
    return () => {
      window.removeEventListener("tl-reading-history", syncProgress);
      window.removeEventListener("tl-reading-progress", syncProgress);
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const fetched = await fetchPublishedStory(id);
        if (!cancelled) {
          if (fetched) {
            setLoadedStory(fetched);
            setSeries(storyToSeriesDetail(fetched));
            return;
          }

          const local = getStoryById(id);
          if (local && isStoryBrowsable(local)) {
            setLoadedStory(local);
            setSeries(storyToSeriesDetail(local));
            return;
          }

          setLoadedStory(null);
          const mock = findMockStory(id);
          if (mock) {
            setSeries(mockStoryToSeriesDetail(mock));
          } else {
            setSeries(null);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [id, getStoryById]);

  useEffect(() => {
    const syncFollow = () => setFollowing(isFollowingSeries(id));
    syncFollow();
    window.addEventListener("tl-library-prefs", syncFollow);
    return () => window.removeEventListener("tl-library-prefs", syncFollow);
  }, [id]);

  useEffect(() => {
    if (!series || viewTracked.current) return;
    viewTracked.current = true;
    void trackSeriesView(id).then((viewsCount) => {
      if (viewsCount === null) return;
      setSeries((current) =>
        current
          ? { ...current, views: formatCatalogViews(viewsCount) }
          : current
      );
    });
  }, [id, series]);

  const mock = findMockStory(id);

  const episodeList = useMemo(() => {
    if (!series) return [];
    const total = mock?.chapters ?? Math.max(series.episodes.length, 1);
    return buildFullEpisodeList(
      id,
      total,
      series.episodes,
      series.coverArtUrl,
      series.coverGradient
    );
  }, [series, id, mock?.chapters]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#F6F1E7]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E6DFD1] border-t-[#2F80ED]" />
      </div>
    );
  }

  if (!series) {
    return (
      <div className="mx-auto max-w-lg bg-[#F6F1E7] py-20 text-center text-[#111827]">
        <h1 className="font-heading text-2xl font-bold">Series not found</h1>
        <p className="mt-2 text-sm text-white/60">
          This series may be unpublished or does not exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded bg-[#111827] px-6 py-3 text-sm font-bold text-white hover:bg-[#1f2937]"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const readHref = `/story/${id}/read`;

  const caseFile = getBusinessCaseFile(id, {
    title: series.title,
    genre: series.genre,
    synopsis: series.synopsis,
    chapterCount: mock?.chapters ?? series.episodes.length,
    topic: loadedStory?.topic,
    slug: loadedStory?.slug,
    category: loadedStory?.category ?? loadedStory?.genre,
    mainCharacter: loadedStory?.mainCharacter,
    researchTopic: loadedStory?.researchTopic,
    researchCharacters: loadedStory?.researchCharacters,
  });

  const { name: parsedName, subtitle: parsedSubtitle } = parseSagaTitle(
    series.title
  );
  const heroTitle = mock?.title ?? (caseFile.subtitle ? parsedName : series.title);
  const heroSubtitle =
    mock?.subtitle ?? (caseFile.subtitle || parsedSubtitle);
  const storyDescription = mock?.hook ?? series.synopsis;
  const sagaBadge = caseFile.sagaLabel.toUpperCase();
  const totalChapters = mock?.chapters ?? episodeList.length;
  const publishedCount = getPublishedChapterCount(id, totalChapters);
  const readMinutes = mock?.readMinutes ?? caseFile.readMinutes;
  const schedule =
    mock?.id ? getSagaScheduleLabel(mock.id) : series.schedule;

  const followMeta = {
    seriesId: id,
    title: formatSagaFollowTitle(heroTitle, heroSubtitle),
    scheduleLabel: schedule,
    href: `/story/${id}`,
  };

  const navigateWithAffiliate = (path: string) => {
    window.location.href = appendAffiliateToHref(path, getStoredAffiliateSlug());
  };

  const openEpisode = async (episodeNumber: number) => {
    const badge = getChapterAccessBadge(
      episodeNumber,
      publishedCount,
      paid
    );
    const entrepreneurEarly =
      entrepreneur && episodeNumber === publishedCount + 1;
    if (badge === "coming" && !entrepreneurEarly) return;

    const access = await checkEpisodeReadAccess(id, episodeNumber);

    if (!access.allowed) {
      if (
        !loggedIn &&
        (access.reason === "signup_required" || episodeNumber > 1)
      ) {
        navigateWithAffiliate(
          buildReaderSignupPath(id, series.title, Math.max(1, episodeNumber - 1))
        );
        return;
      }
      if (!loggedIn) {
        navigateWithAffiliate(buildFreeEpisodeLimitSignupPath(id, series.title));
        return;
      }
      navigateWithAffiliate(
        buildPaywallPath(id, episodeNumber, series.title, {
          reason:
            access.reason === "weekly_free_used" ? "weekly_limit" : undefined,
        })
      );
      return;
    }

    const href = `${readHref}${episodeNumber > 1 ? `?ep=${episodeNumber}` : ""}`;
    navigateWithAffiliate(href);
  };

  const toggleFollow = () => {
    if (!requireAuth(`/story/${id}`)) return;

    if (following) {
      unfollowSeries(id);
      setFollowing(false);
    } else {
      followSeries(followMeta);
      setFollowing(true);
    }
  };

  const openFastPass = (episodeNumber: number) => {
    if (!loggedIn) {
      navigateWithAffiliate(
        `/signup/continue?${new URLSearchParams({
          storyId: id,
          storyTitle: series.title,
          ep: String(episodeNumber),
          returnTo: buildPaywallPath(id, episodeNumber, heroTitle, {
            reason: "fast_pass",
          }),
        }).toString()}`
      );
      return;
    }

    setFastPassEpisode(episodeNumber);
    setFastPassOpen(true);
  };

  const fastPassReturnPath = `${readHref}?ep=${fastPassEpisode}`;

  const tabs: { key: DetailTab; label: string }[] = [
    { key: "episodes", label: "Episodes" },
    { key: "about", label: "About" },
    { key: "similar", label: "More Like This" },
  ];

  return (
    <div className="min-h-screen bg-[#F6F1E7] pb-16">
      {/* Cinematic hero — lighter, fades into cream body */}
      <section className="relative min-h-[420px] overflow-hidden md:min-h-[480px]">
        <div className="absolute inset-0">
          {series.coverArtUrl ? (
            <img
              src={series.coverArtUrl}
              alt=""
              className="h-full w-full object-cover object-center brightness-[1.05] saturate-[1.06] md:object-right"
            />
          ) : null}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(20, 28, 40, 0.78) 0%, rgba(20, 28, 40, 0.45) 38%, rgba(20, 28, 40, 0.12) 68%, transparent 100%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[140px]"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, rgba(246, 241, 231, 0.5) 60%, #F6F1E7 100%)",
            }}
          />
        </div>

        <div className={`${PAGE_CONTAINER_CLASS} relative max-w-6xl py-10 text-white md:py-14`}>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#F0D48A]">
            Toonlora Original
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-wide text-white/75">
            {sagaBadge}
          </p>

          <h1
            className="font-heading mt-3 max-w-3xl text-4xl font-black uppercase leading-[1.02] tracking-tight md:text-5xl lg:text-[3.25rem]"
            style={{ textShadow: "0 2px 16px rgba(0,0,0,0.3)" }}
          >
            {heroTitle}
          </h1>
          {heroSubtitle ? (
            <p
              className="mt-2 text-xl font-semibold text-[#E8EDF4] md:text-2xl"
              style={{ textShadow: "0 1px 8px rgba(0,0,0,0.25)" }}
            >
              {heroSubtitle}
            </p>
          ) : null}

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#D1DAE6] md:text-base">
            {storyDescription}
          </p>

          <p className="mt-3 text-sm text-[#C5D0DC]">
            {totalChapters} chapters · {readMinutes} min reads · {schedule}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void openEpisode(1)}
              className="inline-flex h-11 items-center gap-2.5 rounded-[10px] bg-white px-6 text-sm font-extrabold text-[#111827] shadow-md transition hover:bg-[#F8FAFC]"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#111827] text-[10px] text-white">
                ▶
              </span>
              Play Chapter 1
            </button>
            <button
              type="button"
              onClick={toggleFollow}
              className={`inline-flex h-11 items-center rounded-[10px] border px-6 text-sm font-bold transition ${
                following
                  ? "border-white/50 bg-white/20 text-white"
                  : "border-white/40 bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {following ? "✓ My List" : "+ My List"}
            </button>
          </div>
        </div>
      </section>

      {/* Tabs + content on warm body */}
      <div className={`${PAGE_CONTAINER_CLASS} max-w-6xl`}>
        <div className="flex gap-6 overflow-x-auto border-b border-[#E6DFD1] scrollbar-hide md:gap-10">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`relative shrink-0 py-4 text-sm font-bold uppercase tracking-[0.06em] transition ${
                activeTab === key
                  ? "text-[#111827]"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              {label}
              {activeTab === key ? (
                <span className="absolute inset-x-0 bottom-0 h-[3px] bg-[#2F80ED]" />
              ) : null}
            </button>
          ))}
        </div>

        <div className="py-8 md:py-10">
          {activeTab === "episodes" ? (
            <div>
              <div className="mb-5 flex items-center gap-3">
                <label className="sr-only" htmlFor="chapter-season">
                  Season
                </label>
                <select
                  id="chapter-season"
                  className="rounded border border-[#D1C9B8] bg-white px-3 py-1.5 text-sm font-semibold text-[#111827]"
                  defaultValue="1"
                >
                  <option value="1">Season 1</option>
                </select>
                <span className="text-sm text-[#6B7280]">
                  {publishedCount} of {totalChapters} available
                </span>
              </div>

              <NetflixChapterRow>
                {episodeList.map((ep) => {
                  const title = resolveChapterListTitle(id, ep.number, ep.title);
                  const displayTitle =
                    title.replace(/^Chapter\s+\d+\s*[—–-]\s*/i, "") || title;
                  const badge = getChapterAccessBadge(
                    ep.number,
                    publishedCount,
                    paid
                  );
                  const progress = getEpisodeProgress(
                    id,
                    ep.number,
                    readingEpisode
                  );
                  const isNextLocked = ep.number === publishedCount + 1;
                  const showFastPass =
                    badge === "coming" && isNextLocked && !entrepreneur;
                  const entrepreneurCanReadEarly =
                    entrepreneur && isNextLocked && badge === "coming";

                  return (
                    <NetflixChapterCard
                      key={ep.number}
                      number={ep.number}
                      title={displayTitle}
                      description={getChapterDescription(
                        id,
                        ep.number,
                        heroTitle
                      )}
                      durationMinutes={readMinutes}
                      coverArtUrl={ep.coverArtUrl ?? series.coverArtUrl}
                      coverGradient={ep.coverGradient}
                      genre={series.genre}
                      progressPercent={progress}
                      badge={badge}
                      variant="light"
                      showFastPass={showFastPass}
                      disabled={badge === "coming" && !showFastPass && !entrepreneurCanReadEarly}
                      onClick={() => void openEpisode(ep.number)}
                      onFastPassClick={() => openFastPass(ep.number)}
                    />
                  );
                })}
              </NetflixChapterRow>
            </div>
          ) : null}

          {activeTab === "about" ? (
            <div className="max-w-4xl space-y-8">
              <p className="text-lg leading-relaxed text-[#374151] md:text-xl md:leading-relaxed">
                {storyDescription}
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="rounded-xl border border-[#E6DFD1] bg-white p-5 md:p-6">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#6B7280] md:text-sm">
                    Founder
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[#111827] md:text-xl">
                    {caseFile.founder}
                  </p>
                </div>
                <div className="rounded-xl border border-[#E6DFD1] bg-white p-5 md:p-6">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#6B7280] md:text-sm">
                    Company
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[#111827] md:text-xl">
                    {caseFile.company}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#6B7280] md:text-sm">
                  Key lessons
                </p>
                <ul className="mt-4 space-y-3">
                  {caseFile.lessons.map((lesson) => (
                    <li
                      key={lesson}
                      className="flex gap-3 text-base text-[#374151] md:text-lg"
                    >
                      <span className="text-[#D8A84E]">•</span>
                      {lesson}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}

          {activeTab === "similar" ? (
            <SimilarStories seriesId={id} variant="light" />
          ) : null}
        </div>
      </div>

      {activeTab !== "similar" ? (
        <SimilarStories seriesId={id} variant="light" />
      ) : null}

      <SubscriptionPaywall
        variant="modal"
        storyName={heroTitle}
        open={fastPassOpen}
        onClose={() => setFastPassOpen(false)}
        returnPath={fastPassReturnPath}
        coverArtUrl={series.coverArtUrl}
        storyId={id}
        episodeNumber={fastPassEpisode}
        fastPass
      />
    </div>
  );
}
