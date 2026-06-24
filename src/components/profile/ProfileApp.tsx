"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import StoryCoverImage from "@/components/ui/StoryCoverImage";
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
import { getReadingHistory } from "@/lib/readingHistory";
import { getCountryName } from "@/lib/countries";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";
import { findMockStory } from "@/lib/mock/businessStoryCatalog";
import { NAVY_COVER_GRADIENT } from "@/lib/theme/navy";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import { useUserStore } from "@/store/useUserStore";

interface FollowingStoryDisplay extends FollowingStory {
  coverArtUrl?: string;
  coverGradient: string;
  genre: string;
  chapterProgress: number;
  totalChapters: number;
}

function ProfileAvatar({ name }: { name: string }) {
  const initial = name.trim()[0]?.toUpperCase() || "T";
  return (
    <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent text-xl font-extrabold text-white ring-4 ring-surface sm:h-16 sm:w-16 sm:text-2xl">
      {initial}
    </span>
  );
}

function LibraryCard({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-2xl bg-surface shadow-[0_4px_24px_rgba(10,22,40,0.06)] ring-1 ring-border ${className}`}
    >
      {title ? (
        <div className="border-b border-border px-5 py-4 sm:px-6">
          <h2 className="font-heading text-base font-extrabold text-primary sm:text-lg">
            {title}
          </h2>
        </div>
      ) : null}
      {children}
    </section>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition ${
        checked ? "bg-accent" : "bg-surface-soft"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function SettingRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-primary">{label}</p>
        {description ? (
          <p className="mt-0.5 text-xs leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-muted">
          {checked ? "ON" : "OFF"}
        </span>
        <ToggleSwitch checked={checked} onChange={onChange} label={label} />
      </div>
    </div>
  );
}

function followingReadHref(seriesId: string, chapter: number): string {
  return `/story/${seriesId}/read${chapter > 1 ? `?ep=${chapter}` : ""}`;
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
  let coverGradient = historyEntry?.coverGradient ?? NAVY_COVER_GRADIENT;
  let genre = historyEntry?.genre ?? mock?.sagaLabel ?? "Business";
  let totalChapters = mock?.chapters ?? 1;

  if (!mock) {
    const fetched = await fetchPublishedStory(story.seriesId);
    if (fetched) {
      coverArtUrl = getStoryCoverArtUrl(fetched) ?? coverArtUrl;
      coverGradient = fetched.coverGradient || coverGradient;
      genre = String(fetched.genre);
      totalChapters = Math.max(
        totalChapters,
        fetched.episodes?.length ?? 1
      );
    }
  }

  return {
    ...story,
    coverArtUrl,
    coverGradient,
    genre,
    totalChapters,
    chapterProgress,
  };
}

function FollowingStoryRow({ story }: { story: FollowingStoryDisplay }) {
  const seed = story.seriesId
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const progress = story.chapterProgress;
  const total = Math.max(story.totalChapters, 1);
  const progressPct =
    progress > 0 ? Math.min(100, (progress / total) * 100) : 0;
  const readHref =
    progress > 0
      ? followingReadHref(story.seriesId, progress)
      : story.href;

  return (
    <li className="px-5 py-4 sm:px-6">
      <Link
        href={readHref}
        className="group flex gap-4 transition hover:opacity-95"
      >
        <div className="h-[88px] w-[66px] shrink-0 overflow-hidden rounded-xl ring-1 ring-border">
          <StoryCoverImage
            coverArtUrl={story.coverArtUrl}
            title={story.title}
            genre={story.genre}
            gradient={story.coverGradient}
            seed={seed}
            className="h-full w-full !aspect-auto"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-heading line-clamp-2 text-base font-extrabold leading-snug text-primary group-hover:text-accent">
            {story.title}
          </p>
          <p className="mt-1 text-xs text-muted">{story.scheduleLabel}</p>

          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between gap-2 text-[11px] font-medium text-muted">
              <span>
                {progress > 0
                  ? `Chapter ${progress} / ${total}`
                  : "Not started yet"}
              </span>
              {progress > 0 ? (
                <span>{Math.round(progressPct)}%</span>
              ) : null}
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-soft">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
}

export default function ProfileApp() {
  const router = useRouter();
  const { fullName, email, countryCode, logout } = useUserStore();
  const { getTier, hasPaidAccess, hydrate: hydrateSubscription } =
    useSubscriptionStore();

  const displayName = fullName.trim() || "Toonlora reader";
  const tier = getTier();
  const hasPlus = hasPaidAccess();
  const tierLabel =
    tier === "entrepreneur"
      ? "Entrepreneur Plan"
      : tier === "achiever"
        ? "Achiever Plan"
        : "Free Plan";

  const [following, setFollowing] = useState<FollowingStoryDisplay[]>([]);
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    newChaptersDigest: true,
  });
  const [continueItem, setContinueItem] = useState<{
    title: string;
    href: string;
    chapter: number;
  } | null>(null);

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
    const latest = history[0];
    setContinueItem(
      latest
        ? {
            title: latest.title,
            href: latest.href,
            chapter: latest.episodeNumber,
          }
        : null
    );
  }, []);

  useEffect(() => {
    void hydrateSubscription();
  }, [hydrateSubscription]);

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

  const pageHeader = (
    <header className="mb-8">
      <h1 className="font-heading text-2xl font-extrabold text-primary sm:text-3xl">
        My Library
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
        Manage your stories, subscription, and chapter notifications.
      </p>
    </header>
  );

  if (!email) {
    return (
      <div className={`${PAGE_CONTAINER_CLASS} max-w-lg py-10 sm:py-14`}>
        {pageHeader}
        <LibraryCard className="p-8 text-center">
          <div className="flex justify-center">
            <ProfileAvatar name="T" />
          </div>
          <h2 className="font-heading mt-5 text-xl font-extrabold text-primary">
            Sign in to your library
          </h2>
          <p className="mt-2 text-sm text-muted">
            Save reading progress, follow sagas, and manage notifications.
          </p>
          <div className="mt-6 space-y-3">
            <Link
              href="/signin?returnTo=%2Fprofile"
              className="flex h-12 w-full items-center justify-center rounded-full bg-accent text-sm font-bold text-white transition hover:bg-accent-hover"
            >
              Log in
            </Link>
            <Link
              href="/signup/register?returnTo=%2Fprofile"
              className="flex h-12 w-full items-center justify-center rounded-full border border-border text-sm font-bold text-primary transition hover:bg-surface-soft"
            >
              Create free account
            </Link>
          </div>
        </LibraryCard>
      </div>
    );
  }

  return (
    <div className={`${PAGE_CONTAINER_CLASS} max-w-2xl py-10 sm:py-12`}>
      {pageHeader}

      <div className="space-y-6">
        <LibraryCard title="Account">
          <div className="flex items-center gap-4 px-5 py-5 sm:px-6">
            <ProfileAvatar name={displayName} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-heading text-lg font-extrabold text-primary">
                {displayName}
              </p>
              <p className="truncate text-sm text-muted">{email}</p>
              {countryCode ? (
                <p className="mt-1 text-xs text-muted">
                  {getCountryName(countryCode)}
                </p>
              ) : null}
              <span className="mt-2 inline-flex rounded-full bg-primary-soft px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
                {tierLabel}
              </span>
            </div>
          </div>
          <div className="border-t border-border px-5 py-4 sm:px-6">
            <Link
              href="/subscribe"
              className="flex h-11 w-full items-center justify-center rounded-full border border-border text-sm font-bold text-primary transition hover:border-accent/40 hover:text-accent"
            >
              Manage subscription
            </Link>
            {!hasPlus ? (
              <p className="mt-3 text-center text-xs text-muted">
                1 free chapter per week · Achiever €7,99 · Entrepreneur €12,99
              </p>
            ) : null}
          </div>
        </LibraryCard>

        <LibraryCard title="Continue Reading">
          {continueItem ? (
            <div className="px-5 py-5 sm:px-6">
              <p className="font-heading text-lg font-extrabold text-primary">
                {continueItem.title}
              </p>
              <p className="mt-1 text-sm text-muted">
                Chapter {continueItem.chapter}
              </p>
              <Link
                href={continueItem.href}
                className="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-accent text-sm font-bold text-white transition hover:bg-accent-hover"
              >
                Continue reading
              </Link>
            </div>
          ) : (
            <div className="px-5 py-5 sm:px-6">
              <p className="text-sm text-muted">No stories in progress yet.</p>
              <Link
                href="/"
                className="mt-4 flex h-11 w-full items-center justify-center rounded-full border border-border text-sm font-bold text-primary transition hover:bg-surface-soft"
              >
                Browse stories
              </Link>
            </div>
          )}
        </LibraryCard>

        <LibraryCard title="Following Stories">
          {following.length > 0 ? (
            <ul className="divide-y divide-border">
              {following.map((story) => (
                <FollowingStoryRow key={story.seriesId} story={story} />
              ))}
            </ul>
          ) : (
            <p className="px-5 py-5 text-sm text-muted sm:px-6">
              You&apos;re not following any sagas yet. Tap Follow Story on a saga
              page to add it here.
            </p>
          )}
        </LibraryCard>

        <LibraryCard title="Email Notifications">
          <div className="px-5 sm:px-6">
            <SettingRow
              label="New chapter digest"
              description="One email listing new chapters across all sagas you follow — not one email per story."
              checked={notifications.newChaptersDigest}
              onChange={(value) => {
                setNotifications({ newChaptersDigest: value });
                setNotificationPreferences({ newChaptersDigest: value });
              }}
            />
            {notifications.newChaptersDigest && following.length > 0 ? (
              <p className="border-t border-border pb-4 pt-2 text-xs text-muted">
                Sent to {email} when new chapters drop for:{" "}
                {following.map((s) => s.title).join(", ")}.
              </p>
            ) : null}
            {notifications.newChaptersDigest && following.length === 0 ? (
              <p className="border-t border-border pb-4 pt-2 text-xs text-muted">
                Follow at least one saga to receive chapter updates.
              </p>
            ) : null}
          </div>
        </LibraryCard>

        <LibraryCard title="Account Actions">
          <div className="space-y-3 px-5 py-5 sm:px-6">
            <Link
              href="/"
              className="flex h-11 w-full items-center justify-center rounded-full border border-border text-sm font-bold text-primary transition hover:bg-surface-soft"
            >
              Browse stories
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="flex h-11 w-full items-center justify-center rounded-full border border-border text-sm font-bold text-muted transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              Log out
            </button>
          </div>
        </LibraryCard>
      </div>
    </div>
  );
}
