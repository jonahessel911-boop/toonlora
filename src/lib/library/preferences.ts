import { STORAGE_KEYS } from "@/lib/constants";

export interface FollowingStory {
  seriesId: string;
  title: string;
  scheduleLabel: string;
  href: string;
}

/** One digest email for all followed sagas when new chapters release. */
export interface NotificationPreferences {
  newChaptersDigest: boolean;
}

const DEFAULT_FOLLOWS: FollowingStory[] = [
  {
    seriesId: "elon-musk",
    title: "Elon Musk — The Man Who Refused to Lose",
    scheduleLabel: "New chapter every Monday",
    href: "/story/elon-musk",
  },
  {
    seriesId: "steve-jobs",
    title: "Steve Jobs — The Return",
    scheduleLabel: "New chapter every Wednesday",
    href: "/story/steve-jobs",
  },
  {
    seriesId: "ferrari",
    title: "Ferrari — Built on Rage",
    scheduleLabel: "New chapter every Friday",
    href: "/story/ferrari",
  },
];

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  newChaptersDigest: true,
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function dispatchUpdate(): void {
  window.dispatchEvent(new Event("tl-library-prefs"));
}

function normalizeFollow(story: FollowingStory & { emailNotifications?: boolean }): FollowingStory {
  return {
    seriesId: story.seriesId,
    title: story.title,
    scheduleLabel: story.scheduleLabel,
    href: story.href,
  };
}

export function getFollowingStories(): FollowingStory[] {
  if (!isBrowser()) return DEFAULT_FOLLOWS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.followingStories);
    if (!raw) {
      localStorage.setItem(
        STORAGE_KEYS.followingStories,
        JSON.stringify(DEFAULT_FOLLOWS)
      );
      return DEFAULT_FOLLOWS;
    }
    const parsed = JSON.parse(raw) as Array<
      FollowingStory & { emailNotifications?: boolean }
    >;
    return parsed.map(normalizeFollow);
  } catch {
    return DEFAULT_FOLLOWS;
  }
}

export function setFollowingStories(stories: FollowingStory[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.followingStories, JSON.stringify(stories));
  dispatchUpdate();
}

export function getNotificationPreferences(): NotificationPreferences {
  if (!isBrowser()) return DEFAULT_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.notificationPrefs);
    if (!raw) return DEFAULT_NOTIFICATIONS;
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    return {
      newChaptersDigest:
        parsed.newChaptersDigest ??
        parsed.newChapterEmails ??
        DEFAULT_NOTIFICATIONS.newChaptersDigest,
    };
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
}

export function setNotificationPreferences(
  prefs: Partial<NotificationPreferences>
): void {
  if (!isBrowser()) return;
  const next = { ...getNotificationPreferences(), ...prefs };
  localStorage.setItem(STORAGE_KEYS.notificationPrefs, JSON.stringify(next));
  dispatchUpdate();
}

export function isNewChaptersDigestEnabled(): boolean {
  return getNotificationPreferences().newChaptersDigest;
}

/** Followed sagas included in the digest email when enabled. */
export function getDigestFollowedStories(): FollowingStory[] {
  return getFollowingStories();
}

export function formatSagaFollowTitle(title: string, subtitle: string): string {
  return subtitle ? `${title} — ${subtitle}` : title;
}

export function isFollowingSeries(seriesId: string): boolean {
  return getFollowingStories().some((s) => s.seriesId === seriesId);
}

export function getFollowEntry(seriesId: string): FollowingStory | undefined {
  return getFollowingStories().find((s) => s.seriesId === seriesId);
}

export function followSeries(entry: FollowingStory): void {
  const existing = getFollowingStories();
  if (existing.some((s) => s.seriesId === entry.seriesId)) {
    setFollowingStories(
      existing.map((s) =>
        s.seriesId === entry.seriesId ? { ...s, ...entry } : s
      )
    );
    return;
  }
  setFollowingStories([entry, ...existing]);
}

export function unfollowSeries(seriesId: string): void {
  setFollowingStories(
    getFollowingStories().filter((s) => s.seriesId !== seriesId)
  );
}
