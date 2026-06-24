"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import CoverArt, { getCoverPreset } from "@/components/ui/CoverArt";
import SimilarStories from "@/components/story/SimilarStories";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";
import { fetchPublishedStory } from "@/lib/fetchPublishedStory";
import { appendAffiliateToHref, getStoredAffiliateSlug } from "@/lib/affiliate/client-tracking";
import { buildPaywallPath } from "@/lib/reader/nextEpisodeGate";
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
import { findMockStory } from "@/lib/mock/businessStoryCatalog";
import {
  chapterBadgeLabel,
  getChapterAccessBadge,
  formatChapterListLabel,
  getPublishedChapterCount,
  getSagaScheduleLabel,
  mockStoryToSeriesDetail,
} from "@/lib/mock/mockSeriesDetail";
import {
  getBusinessCaseFile,
  parseSagaTitle,
} from "@/lib/mock/sagaMeta";
import { storyToSeriesDetail, type SeriesDetail } from "@/lib/seriesCatalog";
import { trackSeriesView } from "@/lib/trackSeriesView";
import { formatCatalogViews } from "@/types/catalog";
import { useStoryStore } from "@/store/useStoryStore";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import { useUserStore } from "@/store/useUserStore";

type DetailTab = "chapters" | "about";

interface SeriesDetailClientProps {
  id: string;
}

export default function SeriesDetailClient({ id }: SeriesDetailClientProps) {
  const { getStoryById } = useStoryStore();
  const { email } = useUserStore();
  const { hasPaidAccess, hydrate: hydrateSubscription } = useSubscriptionStore();
  const [series, setSeries] = useState<SeriesDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DetailTab>("chapters");
  const [following, setFollowing] = useState(false);
  const viewTracked = useRef(false);

  const loggedIn = Boolean(email);
  const paid = hasPaidAccess();

  useEffect(() => {
    void hydrateSubscription();
  }, [hydrateSubscription]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const fetched = await fetchPublishedStory(id);
        if (!cancelled) {
          if (fetched) {
            setSeries(storyToSeriesDetail(fetched));
            return;
          }

          const local = getStoryById(id);
          if (local && (local.status === "published" || local.isPublic)) {
            setSeries(storyToSeriesDetail(local));
            return;
          }

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

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-accent" />
      </div>
    );
  }

  if (!series) {
    return (
      <div className="mx-auto max-w-lg bg-background py-20 text-center">
        <h1 className="font-heading text-2xl font-bold text-primary">Series not found</h1>
        <p className="mt-2 text-sm text-muted">
          This series may be unpublished or does not exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-bold text-white hover:bg-accent-hover"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const preset = getCoverPreset(series.genre);
  const readHref = `/story/${id}/read`;
  const mock = findMockStory(id);

  const caseFile = getBusinessCaseFile(id, {
    title: series.title,
    genre: series.genre,
    synopsis: series.synopsis,
    chapterCount: mock?.chapters ?? series.episodes.length,
  });

  const { name: parsedName, subtitle: parsedSubtitle } = parseSagaTitle(
    series.title
  );
  const heroTitle = mock?.title ?? (caseFile.subtitle ? parsedName : series.title);
  const heroSubtitle =
    mock?.subtitle ?? (caseFile.subtitle || parsedSubtitle);
  const storyDescription = mock?.hook ?? series.synopsis;
  const sagaBadge = caseFile.sagaLabel.toUpperCase();
  const totalChapters = mock?.chapters ?? series.episodes.length;
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
    if (badge === "coming") return;

    const access = await checkEpisodeReadAccess(id, episodeNumber);

    if (!access.allowed) {
      if (!loggedIn) {
        navigateWithAffiliate(buildFreeEpisodeLimitSignupPath(id, series.title));
        return;
      }
      navigateWithAffiliate(buildPaywallPath(id, episodeNumber, series.title));
      return;
    }

    const href = `${readHref}${episodeNumber > 1 ? `?ep=${episodeNumber}` : ""}`;
    navigateWithAffiliate(href);
  };

  const toggleFollow = () => {
    if (following) {
      unfollowSeries(id);
      setFollowing(false);
    } else {
      followSeries(followMeta);
      setFollowing(true);
    }
  };

  return (
    <div className="bg-background pb-16">
      {/* Light hero */}
      <section className="border-b border-border bg-surface">
        <div className={`${PAGE_CONTAINER_CLASS} max-w-5xl py-8 md:py-12`}>
          <div className="grid items-start gap-8 md:grid-cols-[minmax(0,280px)_1fr] lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-12">
            {/* Cover */}
            <div className="mx-auto w-full max-w-[280px] md:mx-0 lg:max-w-none">
              <div className="overflow-hidden rounded-2xl shadow-[0_8px_32px_rgba(10,22,40,0.12)] ring-1 ring-border">
                {series.coverArtUrl ? (
                  <img
                    src={series.coverArtUrl}
                    alt={heroTitle}
                    className="aspect-[2/3] w-full object-cover"
                  />
                ) : (
                  <CoverArt
                    gradient={series.coverGradient || preset.gradient}
                    genre={series.genre}
                    title={heroTitle}
                    showOverlay={false}
                    className="aspect-[2/3] w-full"
                  />
                )}
              </div>
            </div>

            {/* Info */}
            <div className="min-w-0">
              <span className="inline-flex rounded-md bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                {sagaBadge}
              </span>

              <h1 className="mt-4 font-heading text-3xl font-extrabold leading-tight text-primary md:text-4xl">
                {heroTitle}
              </h1>
              {heroSubtitle ? (
                <p className="mt-2 text-xl font-semibold text-accent md:text-2xl">
                  {heroSubtitle}
                </p>
              ) : null}

              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
                {storyDescription}
              </p>

              <p className="mt-4 text-sm font-medium text-primary/70">
                {totalChapters} chapters · {readMinutes} min reads · {schedule}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void openEpisode(1)}
                  className="inline-flex min-h-[48px] items-center rounded-full bg-accent px-7 text-sm font-bold text-white transition hover:bg-accent-hover"
                >
                  Start Chapter 1
                </button>
                <button
                  type="button"
                  onClick={toggleFollow}
                  className={`inline-flex min-h-[48px] items-center rounded-full border px-7 text-sm font-bold transition ${
                    following
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-primary hover:border-accent/40"
                  }`}
                >
                  {following ? "Following ✓" : "Follow Story"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs + content */}
      <div className={`${PAGE_CONTAINER_CLASS} max-w-5xl pt-8`}>
        <div className="flex gap-1 border-b border-border">
          {(
            [
              ["chapters", "Chapters"],
              ["about", "About"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`relative px-4 py-3 text-sm font-bold transition sm:px-6 ${
                activeTab === key
                  ? "text-accent"
                  : "text-muted hover:text-primary"
              }`}
            >
              {label}
              {activeTab === key ? (
                <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-accent sm:inset-x-6" />
              ) : null}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {activeTab === "chapters" ? (
            <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
              <ul className="divide-y divide-border">
                {series.episodes.map((ep) => {
                  const label = formatChapterListLabel(id, ep.number, ep.title);
                  const badge = getChapterAccessBadge(
                    ep.number,
                    publishedCount,
                    paid
                  );
                  const isComing = badge === "coming";

                  return (
                    <li key={ep.number}>
                      <button
                        type="button"
                        disabled={isComing}
                        onClick={() => void openEpisode(ep.number)}
                        className={`group flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition sm:px-6 ${
                          isComing
                            ? "cursor-default opacity-70"
                            : "hover:bg-surface-soft"
                        }`}
                      >
                        <div className="min-w-0">
                          <p
                            className={`font-semibold ${
                              isComing
                                ? "text-muted"
                                : "text-primary group-hover:text-accent"
                            }`}
                          >
                            {label}
                          </p>
                        </div>
                        {badge ? (
                          <ChapterBadge type={badge} />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          {activeTab === "about" ? (
            <div className="rounded-2xl bg-surface p-6 ring-1 ring-border sm:p-8">
              <p className="text-base leading-relaxed text-primary">
                {storyDescription}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <SimilarStories seriesId={id} />
    </div>
  );
}

function ChapterBadge({ type }: { type: "free" | "achiever" | "coming" }) {
  const styles = {
    free: "bg-accent/10 text-accent",
    achiever: "bg-primary-soft text-primary",
    coming: "bg-surface-soft text-muted",
  };

  return (
    <span
      className={`flex-shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${styles[type]}`}
    >
      {chapterBadgeLabel(type)}
    </span>
  );
}