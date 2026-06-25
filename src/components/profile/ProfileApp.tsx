"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import CinematicStoryCover from "@/components/home/stream/CinematicStoryCover";
import ProfileSidebar, {
  type ProfileTab,
} from "@/components/profile/ProfileSidebar";
import ProfileSubscriptionTab from "@/components/profile/ProfileSubscriptionTab";
import {
  fetchPublishedStory,
  getStoryCoverArtUrl,
} from "@/lib/fetchPublishedStory";
import {
  getFollowingStories,
  getNotificationPreferences,
  setNotificationPreferences,
  type FollowingStory,
  type NotificationPreferences,
} from "@/lib/library/preferences";
import {
  getReadingHistory,
  buildResumeReadHref,
  computeSeriesReadPercent,
  type ReadingHistoryEntry,
} from "@/lib/readingHistory";
import { apiFetch } from "@/lib/session";
import { findMockStory } from "@/lib/mock/businessStoryCatalog";
import { buildRetentionStories } from "@/lib/profile/retentionStories";
import type { UserReadingEngagement } from "@/lib/services/user-reading-engagement";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import { useUserStore } from "@/store/useUserStore";

/* ── Toonlora library tokens ── */
const PAPER = "#F6F1E7";
const PAPER_CARD = "#FFFDF7";
const BORDER = "#E7DDCC";
const TEXT_DARK = "#0E1726";
const MUTED = "#64748B";
const NAVY = "#07111F";
const BLUE = "#2F80ED";
const BLUE_HOVER = "#1F6FD6";
const READING_CARD = "#101827";

interface FollowingStoryDisplay extends FollowingStory {
  coverArtUrl?: string;
  sagaLabel: string;
  subtitle: string;
  chapterProgress: number;
  totalChapters: number;
}

function SectionHeading({
  title,
  className = "",
}: {
  title: string;
  className?: string;
}) {
  return (
    <h2
      className={`font-heading text-lg font-extrabold tracking-tight sm:text-xl ${className}`}
      style={{ color: TEXT_DARK }}
    >
      {title}
    </h2>
  );
}

function ProfilePill({
  name,
  planLabel,
}: {
  name: string;
  planLabel: string;
}) {
  const initial = name.trim()[0]?.toUpperCase() || "T";
  const isPaid = planLabel !== "Free";

  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 shadow-[0_2px_12px_rgba(14,23,38,0.06)]"
      style={{ background: PAPER_CARD, border: `1px solid ${BORDER}` }}
    >
      <span
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white"
        style={{ background: NAVY }}
      >
        {initial}
      </span>
      <div className="min-w-0">
        <p
          className="truncate font-heading text-sm font-extrabold"
          style={{ color: TEXT_DARK }}
        >
          {name}
        </p>
        <span
          className="mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          style={{
            background: isPaid ? "rgba(47,128,237,0.12)" : "rgba(100,116,139,0.12)",
            color: isPaid ? BLUE : MUTED,
          }}
        >
          {planLabel}
        </span>
      </div>
    </div>
  );
}

function PrimaryButton({
  href,
  onClick,
  children,
  className = "",
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const cls = `inline-flex h-[42px] items-center justify-center rounded-full px-5 text-sm font-bold text-white transition hover:opacity-95 ${className}`;
  const style = { background: BLUE };

  if (href) {
    return (
      <Link
        href={href}
        className={cls}
        style={style}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = BLUE_HOVER;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = BLUE;
        }}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cls}
      style={style}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = BLUE_HOVER;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = BLUE;
      }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  href,
  onClick,
  children,
  className = "",
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const cls = `inline-flex h-[42px] items-center justify-center rounded-full border px-5 text-sm font-bold transition ${className}`;
  const style = {
    background: PAPER_CARD,
    borderColor: BORDER,
    color: TEXT_DARK,
  };

  if (href) {
    return (
      <Link href={href} className={cls} style={style}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cls} style={style}>
      {children}
    </button>
  );
}

function ContinueReadingCard({ entry }: { entry: ReadingHistoryEntry }) {
  const mock = findMockStory(entry.seriesId);
  const totalChapters = mock?.chapters ?? entry.totalPanels ?? 1;
  const panelIndex = entry.panelIndex ?? 0;
  const totalPanels = entry.totalPanels ?? 1;
  const pct = computeSeriesReadPercent(
    entry.episodeNumber,
    totalChapters,
    panelIndex,
    totalPanels
  );
  const subtitle = mock?.subtitle ?? entry.genre;

  return (
    <article className="w-[min(88vw,340px)] shrink-0 snap-start sm:w-[320px]">
      <div
        className="flex h-[100px] overflow-hidden rounded-[14px] sm:h-[104px]"
        style={{ background: READING_CARD }}
      >
        <div className="relative h-full w-[88px] shrink-0 overflow-hidden">
          <CinematicStoryCover
            coverArtUrl={entry.coverArtUrl}
            title={entry.title}
            sagaLabel={entry.genre || mock?.sagaLabel}
            className="h-full w-full"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center px-3.5 py-2.5">
          <p className="truncate font-heading text-[15px] font-extrabold text-[#F8FAFC]">
            {entry.title}
          </p>
          {subtitle ? (
            <p className="truncate text-xs text-[#AAB4C3]">{subtitle}</p>
          ) : null}
          <div className="mt-2.5 h-1.5 w-full max-w-[180px] overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2F80ED] to-[#D8A84E]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-[#AAB4C3]">
            Chapter {entry.episodeNumber}
            {totalChapters > 1 ? ` of ${totalChapters}` : ""}
            {panelIndex > 0 ? ` · Panel ${panelIndex + 1}` : ""}
          </p>
        </div>

        <div className="flex shrink-0 items-center pr-3">
          <PrimaryButton href={entry.href} className="!h-9 !px-4 !text-xs">
            Continue
          </PrimaryButton>
        </div>
      </div>
    </article>
  );
}

function followingReadHref(seriesId: string, chapter: number): string {
  const history = getReadingHistory().find((e) => e.seriesId === seriesId);
  if (history && history.episodeNumber === chapter) {
    return history.href;
  }
  return buildResumeReadHref(seriesId, chapter, history?.panelIndex ?? 0);
}

function FollowingStoryCard({ story }: { story: FollowingStoryDisplay }) {
  const progress = story.chapterProgress;
  const total = Math.max(story.totalChapters, 1);
  const progressPct =
    progress > 0 ? Math.min(100, (progress / total) * 100) : 0;
  const readHref =
    progress > 0
      ? followingReadHref(story.seriesId, progress)
      : `${story.href}/read`;
  const ctaLabel = progress > 0 ? "Continue" : "Read";

  return (
    <article
      className="group flex items-center gap-4 rounded-2xl p-3.5 transition hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(14,23,38,0.08)] sm:gap-4 sm:p-4"
      style={{
        background: PAPER_CARD,
        border: `1px solid ${BORDER}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#FBF6EE";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = PAPER_CARD;
      }}
    >
      <Link href={story.href} className="shrink-0 overflow-hidden rounded-xl">
        <div className="h-[88px] w-16 overflow-hidden rounded-xl">
          <CinematicStoryCover
            coverArtUrl={story.coverArtUrl}
            title={story.title}
            sagaLabel={story.sagaLabel}
            className="h-full w-full"
          />
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={story.href} className="block min-w-0">
          <p
            className="font-heading line-clamp-2 text-[15px] font-extrabold leading-snug transition group-hover:text-[#2F80ED]"
            style={{ color: TEXT_DARK }}
          >
            {story.title}
          </p>
          {story.subtitle ? (
            <p className="mt-0.5 truncate text-xs" style={{ color: MUTED }}>
              {story.subtitle}
            </p>
          ) : null}
          <p className="mt-1 text-xs" style={{ color: MUTED }}>
            {progress > 0
              ? `Chapter ${progress} of ${total}`
              : story.scheduleLabel || "Not started yet"}
          </p>
        </Link>

        {progress > 0 ? (
          <div className="mt-2 max-w-[200px]">
            <div className="h-1.5 overflow-hidden rounded-full bg-[#E7DDCC]">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progressPct}%`, background: BLUE }}
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
        <PrimaryButton href={readHref} className="!h-9 !px-4 !text-xs sm:!text-sm">
          {ctaLabel}
        </PrimaryButton>
        <Link
          href={story.href}
          className="text-xs font-semibold transition hover:text-[#2F80ED]"
          style={{ color: MUTED }}
        >
          View
        </Link>
      </div>
    </article>
  );
}

function AccountCard({
  email,
  username,
  notifications,
  onToggleNotifications,
  onLogout,
}: {
  email: string;
  username: string;
  notifications: NotificationPreferences;
  onToggleNotifications: (value: boolean) => void;
  onLogout: () => void;
}) {
  return (
    <section
      className="rounded-[18px] p-5"
      style={{ background: PAPER_CARD, border: `1px solid ${BORDER}` }}
    >
      <SectionHeading title="Account" className="!text-base" />

      <dl className="mt-4 space-y-3">
        <div>
          <dt className="text-[11px] font-bold uppercase tracking-wide" style={{ color: MUTED }}>
            Username
          </dt>
          <dd className="mt-0.5 text-sm font-semibold" style={{ color: TEXT_DARK }}>
            {username}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-bold uppercase tracking-wide" style={{ color: MUTED }}>
            Email
          </dt>
          <dd className="mt-0.5 truncate text-sm" style={{ color: TEXT_DARK }}>
            {email}
          </dd>
        </div>
      </dl>

      <div
        className="mt-5 flex items-center justify-between gap-3 border-t pt-4"
        style={{ borderColor: BORDER }}
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold" style={{ color: TEXT_DARK }}>
            Chapter digest
          </p>
          <p className="text-xs" style={{ color: MUTED }}>
            One email when new chapters drop
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={notifications.newChaptersDigest}
          aria-label="Chapter digest emails"
          onClick={() =>
            onToggleNotifications(!notifications.newChaptersDigest)
          }
          className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition"
          style={{
            background: notifications.newChaptersDigest ? BLUE : "#E7DDCC",
          }}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
              notifications.newChaptersDigest ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <div className="mt-5">
        <SecondaryButton onClick={onLogout} className="w-full">
          Log out
        </SecondaryButton>
      </div>
    </section>
  );
}

async function hydrateFollowingStory(
  story: FollowingStory,
  chapterProgress: number
): Promise<FollowingStoryDisplay> {
  const historyEntry = getReadingHistory().find(
    (entry) => entry.seriesId === story.seriesId
  );
  const mock = findMockStory(story.seriesId);

  let coverArtUrl = historyEntry?.coverArtUrl;
  let sagaLabel = historyEntry?.genre ?? mock?.sagaLabel ?? "Business";
  let subtitle = mock?.subtitle ?? sagaLabel;
  let totalChapters = mock?.chapters ?? 1;

  if (!mock) {
    const fetched = await fetchPublishedStory(story.seriesId);
    if (fetched) {
      coverArtUrl = getStoryCoverArtUrl(fetched) ?? coverArtUrl;
      sagaLabel = String(fetched.genre);
      subtitle = sagaLabel;
      totalChapters = Math.max(totalChapters, fetched.episodes?.length ?? 1);
    }
  }

  return {
    ...story,
    coverArtUrl,
    sagaLabel,
    subtitle,
    totalChapters,
    chapterProgress,
  };
}

function parseTab(value: string | null): ProfileTab {
  if (value === "subscription" || value === "account") return value;
  return "overview";
}

export default function ProfileApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = parseTab(searchParams.get("tab"));

  const { fullName, email, logout } = useUserStore();
  const {
    getTier,
    hasPaidAccess,
    hydrate: hydrateSubscription,
    planId,
    periodEnd,
  } = useSubscriptionStore();

  const displayName = fullName.trim() || "Toonlora reader";
  const tier = getTier();
  const hasPlus = hasPaidAccess();
  const planLabel = hasPlus ? "Plus" : "Free";

  const [following, setFollowing] = useState<FollowingStoryDisplay[]>([]);
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    newChaptersDigest: true,
  });
  const [continueItems, setContinueItems] = useState<ReadingHistoryEntry[]>([]);
  const [engagement, setEngagement] = useState<UserReadingEngagement | null>(
    null
  );

  const setTab = (tab: ProfileTab) => {
    router.push(tab === "overview" ? "/profile" : `/profile?tab=${tab}`);
  };

  const retentionStories = useMemo(
    () =>
      buildRetentionStories({
        engagement,
        history: continueItems,
        following: getFollowingStories(),
      }),
    [engagement, continueItems]
  );

  const refreshLibrary = useCallback(async () => {
    const follows = getFollowingStories();
    const history = getReadingHistory();
    const progressBySeries = new Map(
      history.map((entry) => [entry.seriesId, entry.episodeNumber])
    );

    const enriched = await Promise.all(
      follows.map((story) =>
        hydrateFollowingStory(
          story,
          progressBySeries.get(story.seriesId) ?? 0
        )
      )
    );

    setFollowing(enriched);
    setNotifications(getNotificationPreferences());
    setContinueItems(history.slice(0, 8));
  }, []);

  useEffect(() => {
    void hydrateSubscription();
  }, [hydrateSubscription]);

  useEffect(() => {
    if (!email) {
      setEngagement(null);
      return;
    }
    void apiFetch("/api/user/reading-engagement")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && !data.error) setEngagement(data as UserReadingEngagement);
      })
      .catch(() => setEngagement(null));
  }, [email]);

  useEffect(() => {
    void refreshLibrary();
    const onUpdate = () => void refreshLibrary();
    window.addEventListener("tl-library-prefs", onUpdate);
    window.addEventListener("tl-reading-history", onUpdate);
    return () => {
      window.removeEventListener("tl-library-prefs", onUpdate);
      window.removeEventListener("tl-reading-history", onUpdate);
    };
  }, [refreshLibrary]);

  const pageShell = (children: React.ReactNode) => (
    <div style={{ background: PAPER }}>
      <div className="mx-auto w-full max-w-[1120px] px-4 pb-10 pt-8 sm:px-6 md:pt-14">
        {children}
      </div>
    </div>
  );

  if (!email) {
    return pageShell(
      <>
        <header className="max-w-xl">
          <h1
            className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl"
            style={{ color: TEXT_DARK }}
          >
            My Library
          </h1>
          <p className="mt-2 text-sm leading-relaxed sm:text-base" style={{ color: MUTED }}>
            Your saved stories, reading progress, and subscription.
          </p>
        </header>

        <div
          className="mt-8 max-w-md rounded-[18px] p-6 text-center"
          style={{ background: PAPER_CARD, border: `1px solid ${BORDER}` }}
        >
          <span
            className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full text-lg font-extrabold text-white"
            style={{ background: NAVY }}
          >
            T
          </span>
          <h2
            className="font-heading mt-4 text-xl font-extrabold"
            style={{ color: TEXT_DARK }}
          >
            Sign in to your library
          </h2>
          <p className="mt-2 text-sm" style={{ color: MUTED }}>
            Save reading progress, follow founder stories, and pick up where you
            left off.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <PrimaryButton href="/signin?returnTo=%2Fprofile" className="w-full">
              Log in
            </PrimaryButton>
            <SecondaryButton
              href="/signup/register?returnTo=%2Fprofile"
              className="w-full"
            >
              Create free account
            </SecondaryButton>
          </div>
        </div>
      </>
    );
  }

  return pageShell(
    <div className="flex flex-col gap-8 md:flex-row md:items-start">
      <ProfileSidebar active={activeTab} onChange={setTab} />

      <div className="min-w-0 flex-1">
        {activeTab === "overview" ? (
          <>
            <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1
                  className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl"
                  style={{ color: TEXT_DARK }}
                >
                  My Library
                </h1>
                <p className="mt-1 text-sm" style={{ color: MUTED }}>
                  Continue reading and stories you follow.
                </p>
              </div>
              <ProfilePill name={displayName} planLabel={planLabel} />
            </header>

            <section className="mb-10">
              <SectionHeading title="Continue Reading" />
              {continueItems.length > 0 ? (
                <div className="-mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-1 snap-x snap-mandatory scrollbar-none sm:-mx-0 sm:px-0">
                  {continueItems.map((entry) => (
                    <ContinueReadingCard key={entry.seriesId} entry={entry} />
                  ))}
                </div>
              ) : (
                <div
                  className="mt-4 rounded-[18px] p-6"
                  style={{
                    background: PAPER_CARD,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <p
                    className="font-heading text-base font-extrabold"
                    style={{ color: TEXT_DARK }}
                  >
                    No stories in progress yet
                  </p>
                  <p className="mt-2 text-sm" style={{ color: MUTED }}>
                    Start a story and it will appear here.
                  </p>
                  <div className="mt-5">
                    <PrimaryButton href="/">Browse stories</PrimaryButton>
                  </div>
                </div>
              )}
            </section>

            <section>
              <SectionHeading title="Following Stories" />
              {following.length > 0 ? (
                <ul className="mt-4 flex flex-col gap-3">
                  {following.map((story) => (
                    <li key={story.seriesId}>
                      <FollowingStoryCard story={story} />
                    </li>
                  ))}
                </ul>
              ) : (
                <div
                  className="mt-4 rounded-[18px] p-6"
                  style={{
                    background: PAPER_CARD,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <p className="text-sm" style={{ color: MUTED }}>
                    You&apos;re not following any stories yet. Tap Follow Story
                    on a series page to add it here.
                  </p>
                  <div className="mt-4">
                    <SecondaryButton href="/">Browse stories</SecondaryButton>
                  </div>
                </div>
              )}
            </section>
          </>
        ) : null}

        {activeTab === "subscription" ? (
          <ProfileSubscriptionTab
            hasPlus={hasPlus}
            tier={tier}
            planId={planId}
            periodEnd={periodEnd}
            retentionStories={retentionStories}
            onSubscriptionChange={() => void hydrateSubscription()}
          />
        ) : null}

        {activeTab === "account" ? (
          <>
            <h2
              className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl"
              style={{ color: TEXT_DARK }}
            >
              Account
            </h2>
            <div className="mt-6 max-w-lg">
              <AccountCard
                email={email}
                username={displayName}
                notifications={notifications}
                onToggleNotifications={(value) => {
                  setNotifications({ newChaptersDigest: value });
                  setNotificationPreferences({ newChaptersDigest: value });
                }}
                onLogout={() => {
                  logout();
                  router.push("/");
                }}
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
