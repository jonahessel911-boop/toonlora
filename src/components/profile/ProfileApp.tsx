"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getReadingHistory } from "@/lib/readingHistory";
import { useCreditsStore } from "@/store/useCreditsStore";
import { useUserStore } from "@/store/useUserStore";

type ProfileTab = "profile" | "library" | "studio";

function ProfileAvatar({ name, size = "lg" }: { name: string; size?: "lg" | "md" }) {
  const initial = name.trim()[0]?.toUpperCase() || "T";
  const dim = size === "lg" ? "h-28 w-28 text-4xl" : "h-10 w-10 text-sm";

  return (
    <span
      className={`inline-flex ${dim} items-center justify-center rounded-full bg-gradient-to-br from-[#5340FF] to-[#7C3AED] font-extrabold text-white shadow-[0_12px_40px_rgba(83,64,255,0.35)] ring-4 ring-white`}
    >
      {initial}
    </span>
  );
}

function StatBlock({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 px-3 text-center md:items-start md:text-left">
      <div className="flex items-center gap-2 text-[#667085]">
        {icon}
        <span className="font-heading text-2xl font-extrabold text-[#2A114B]">{value}</span>
      </div>
      <span className="text-xs font-semibold uppercase tracking-wide text-[#667085]">
        {label}
      </span>
    </div>
  );
}

export default function ProfileApp() {
  const router = useRouter();
  const [tab, setTab] = useState<ProfileTab>("profile");
  const [readingCount, setReadingCount] = useState(0);
  const { fullName, email, wantsRecommendations, logout } = useUserStore();
  const { credits, hydrate } = useCreditsStore();
  const displayName = fullName.trim() || "Toonlora reader";

  useEffect(() => {
    void hydrate();
    setReadingCount(getReadingHistory().length);
  }, [hydrate]);

  if (!email) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="overflow-hidden rounded-[28px] border border-[#E7D8FF] bg-white p-8 shadow-[0_20px_60px_rgba(83,64,255,0.08)]">
          <ProfileAvatar name="T" size="md" />
          <h1 className="font-heading mt-6 text-2xl font-extrabold text-[#2A114B]">
            Your Toonlora profile
          </h1>
          <p className="mt-2 text-sm text-[#667085]">
            Sign in to save episodes, manage your library, and track your coins.
          </p>
          <div className="mt-6 space-y-3">
            <Link
              href="/signin"
              className="flex h-12 w-full items-center justify-center rounded-full bg-[#5340FF] text-sm font-bold text-white"
            >
              Log in
            </Link>
            <Link
              href="/signup/register"
              className="flex h-12 w-full items-center justify-center rounded-full border-2 border-[#E7D8FF] text-sm font-bold text-[#5340FF]"
            >
              Create free account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { id: ProfileTab; label: string; icon: string }[] = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "library", label: "Library", icon: "📚" },
    { id: "studio", label: "Studio", icon: "✨" },
  ];

  return (
    <div className="pb-16">
      {/* Cover banner */}
      <div className="relative h-44 overflow-hidden md:h-52">
        <div className="absolute inset-0 bg-gradient-to-br from-[#5340FF] via-[#7C3AED] to-[#C4B5FD]" />
        <div className="absolute -left-1/4 top-1/4 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -right-1/4 bottom-0 h-48 w-72 rounded-full bg-[#FF6847]/20 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#F5F4F8] to-transparent" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        {/* Header */}
        <div className="-mt-14 flex flex-col items-center gap-6 md:-mt-16 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col items-center gap-4 md:flex-row md:items-end">
            <ProfileAvatar name={displayName} />
            <div className="text-center md:pb-1 md:text-left">
              <h1 className="font-heading text-2xl font-extrabold text-[#2A114B] md:text-3xl">
                {displayName}
              </h1>
              <p className="mt-1 text-sm font-medium text-[#667085]">Creator on Toonlora</p>
            </div>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <StatBlock
              icon={<span className="text-lg text-[#FFE033]">✦</span>}
              value={credits}
              label="Coins"
            />
            <StatBlock
              icon={<span className="text-lg">📖</span>}
              value={readingCount}
              label="Reading"
            />
            <StatBlock
              icon={<span className="text-lg">✨</span>}
              value="Studio"
              label="Create"
            />
          </div>

          <Link
            href="/creator"
            className="rounded-full bg-[#5340FF] px-6 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(83,64,255,0.35)] transition hover:bg-[#4330e8]"
          >
            Open Lora Studio
          </Link>
        </div>

        {/* Mobile stats */}
        <div className="mt-6 flex justify-center gap-6 border-b border-[#E7D8FF] pb-6 md:hidden">
          <StatBlock
            icon={<span className="text-base text-[#FFE033]">✦</span>}
            value={credits}
            label="Coins"
          />
          <StatBlock
            icon={<span className="text-base">📖</span>}
            value={readingCount}
            label="Reading"
          />
        </div>

        {/* Tabs */}
        <nav className="mt-6 flex gap-1 overflow-x-auto rounded-2xl bg-[#EEF0FF]/80 p-1.5 scrollbar-hide">
          {tabs.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  active
                    ? "bg-white text-[#5340FF] shadow-sm"
                    : "text-[#667085] hover:text-[#5340FF]"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Left column — Introduction */}
          <aside className="lg:col-span-1">
            <div className="rounded-[24px] border border-[#E7D8FF]/80 bg-white p-6 shadow-[0_8px_32px_rgba(42,17,75,0.06)]">
              <h2 className="font-heading text-lg font-extrabold text-[#2A114B]">Introduction</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#667085]">
                Welcome to your Toonlora profile. Read cartoon stories, create characters, and
                publish episodes from Lora Studio.
              </p>

              <ul className="mt-5 space-y-4">
                <li className="flex items-start gap-3 text-sm text-[#667085]">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3ECFF] text-base">
                    ✉️
                  </span>
                  <span className="min-w-0 break-all pt-1">{email}</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-[#667085]">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3ECFF] text-base">
                    ✦
                  </span>
                  <span className="pt-1">{credits} coins available</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-[#667085]">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3ECFF] text-base">
                    ⭐
                  </span>
                  <span className="pt-1">
                    {wantsRecommendations
                      ? "Story recommendations enabled"
                      : "Story recommendations off"}
                  </span>
                </li>
              </ul>

              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="mt-6 flex w-full items-center justify-center rounded-full border border-[#E7D8FF] py-2.5 text-sm font-bold text-[#667085] transition hover:border-[#FECDCA] hover:bg-[#FFF1F0] hover:text-[#B42318]"
              >
                Log out
              </button>
            </div>
          </aside>

          {/* Right column — dynamic by tab */}
          <main className="space-y-4 lg:col-span-2">
            {tab === "profile" && (
              <>
                <div className="rounded-[24px] border border-[#E7D8FF]/80 bg-white p-6 shadow-[0_8px_32px_rgba(42,17,75,0.06)]">
                  <h2 className="font-heading text-lg font-extrabold text-[#2A114B]">
                    Quick actions
                  </h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <ActionCard
                      href="/creator"
                      icon="🎬"
                      title="Create a comic"
                      sub="Start a new story in Studio"
                    />
                    <ActionCard
                      href="/creator?section=settings"
                      icon="✦"
                      title="Buy coins"
                      sub={`${credits} coins in your wallet`}
                    />
                    <ActionCard
                      href="/library?view=creations"
                      icon="✨"
                      title="My creations"
                      sub="Stories you made"
                    />
                    <ActionCard
                      href="/library?view=saved"
                      icon="📚"
                      title="Saved library"
                      sub="Episodes to continue"
                    />
                  </div>
                </div>

                {readingCount > 0 ? (
                  <div className="rounded-[24px] border border-[#E7D8FF]/80 bg-white p-6 shadow-[0_8px_32px_rgba(42,17,75,0.06)]">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-heading text-lg font-extrabold text-[#2A114B]">
                        Continue reading
                      </h2>
                      <Link
                        href="/library"
                        className="text-sm font-semibold text-[#5340FF]"
                      >
                        View all ›
                      </Link>
                    </div>
                    <div className="mt-4 space-y-3">
                      {getReadingHistory()
                        .slice(0, 3)
                        .map((entry) => (
                          <Link
                            key={entry.seriesId}
                            href={entry.href}
                            className="flex items-center gap-4 rounded-2xl border border-[#E7D8FF] bg-[#FCFAFF] p-3 transition hover:border-[#5340FF]/30 hover:bg-[#F3ECFF]"
                          >
                            <div className="h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-[#E7D8FF]">
                              {entry.coverArtUrl ? (
                                <img
                                  src={entry.coverArtUrl}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : null}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-bold text-[#2A114B]">{entry.title}</p>
                              <p className="text-xs text-[#667085]">
                                Episode {entry.episodeNumber} · {entry.genre}
                              </p>
                            </div>
                          </Link>
                        ))}
                    </div>
                  </div>
                ) : null}
              </>
            )}

            {tab === "library" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <ActionCard
                  href="/library?view=creations"
                  icon="✨"
                  title="Creations"
                  sub="Stories you made"
                  large
                />
                <ActionCard
                  href="/library?view=saved"
                  icon="📚"
                  title="Library"
                  sub="Saved to read"
                  large
                />
                <ActionCard
                  href="/"
                  icon="📖"
                  title="Browse stories"
                  sub="Discover new cartoons"
                  large
                />
                <ActionCard
                  href="/library"
                  icon="🔖"
                  title="Full library"
                  sub="All your saved episodes"
                  large
                />
              </div>
            )}

            {tab === "studio" && (
              <div className="space-y-4">
                <div className="rounded-[24px] border border-[#E7D8FF]/80 bg-gradient-to-br from-[#F3ECFF] to-white p-6 shadow-[0_8px_32px_rgba(42,17,75,0.06)]">
                  <h2 className="font-heading text-xl font-extrabold text-[#2A114B]">
                    Lora Studio
                  </h2>
                  <p className="mt-2 text-sm text-[#667085]">
                    Design characters, generate comic panels, and publish your stories.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href="/creator"
                      className="rounded-full bg-[#FF6847] px-5 py-2.5 text-sm font-bold text-white"
                    >
                      Open Studio
                    </Link>
                    <Link
                      href="/creator?section=settings"
                      className="rounded-full border border-[#E7D8FF] bg-white px-5 py-2.5 text-sm font-bold text-[#5340FF]"
                    >
                      Buy coins ({credits} ✦)
                    </Link>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ActionCard
                    href="/creator"
                    icon="▤"
                    title="My stories"
                    sub="Manage drafts & episodes"
                  />
                  <ActionCard
                    href="/creator?section=characters"
                    icon="◎"
                    title="Characters"
                    sub="Your reusable cast"
                  />
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  title,
  sub,
  large,
}: {
  href: string;
  icon: string;
  title: string;
  sub: string;
  large?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-start gap-4 rounded-[20px] border border-[#E7D8FF] bg-white p-5 shadow-[0_4px_20px_rgba(42,17,75,0.04)] transition hover:border-[#5340FF]/30 hover:shadow-[0_8px_28px_rgba(83,64,255,0.1)] ${
        large ? "sm:p-6" : ""
      }`}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F3ECFF] text-xl">
        {icon}
      </span>
      <div>
        <p className="font-heading font-extrabold text-[#2A114B]">{title}</p>
        <p className="mt-1 text-sm text-[#667085]">{sub}</p>
      </div>
    </Link>
  );
}
