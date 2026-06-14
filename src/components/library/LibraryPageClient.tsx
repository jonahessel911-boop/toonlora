"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import StoryCard from "@/components/StoryCard";
import EmptyState from "@/components/EmptyState";
import PricingModal from "@/components/PricingModal";
import { useStoryStore } from "@/store/useStoryStore";
import { useCreditsStore } from "@/store/useCreditsStore";

const TABS = [
  "All",
  "Reading",
  "My Stories",
  "Drafts",
  "Published",
  "Favorites",
] as const;

type Tab = (typeof TABS)[number];

function viewToTab(view: string | null): Tab {
  if (view === "creations") return "My Stories";
  if (view === "saved") return "Reading";
  return "All";
}

export default function LibraryPageClient() {
  const searchParams = useSearchParams();
  const initialView = searchParams.get("view");
  const { stories, hydrate, hydrated } = useStoryStore();
  const { credits, freeUsed, hydrate: hydrateCredits } = useCreditsStore();
  const [tab, setTab] = useState<Tab>(() => viewToTab(initialView));
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent");
  const [pricingOpen, setPricingOpen] = useState(false);

  useEffect(() => {
    void hydrate();
    void hydrateCredits();
  }, [hydrate, hydrateCredits]);

  useEffect(() => {
    setTab(viewToTab(searchParams.get("view")));
  }, [searchParams]);

  const filtered = stories
    .filter((s) => {
      const q = search.toLowerCase();
      const matchSearch =
        s.title.toLowerCase().includes(q) ||
        s.mainCharacter?.toLowerCase().includes(q);
      if (tab === "My Stories" || tab === "All") return matchSearch;
      if (tab === "Drafts") return matchSearch;
      if (tab === "Published") return matchSearch;
      if (tab === "Reading") return matchSearch;
      if (tab === "Favorites") return matchSearch;
      return matchSearch;
    })
    .sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleShare = (id: string) => {
    navigator.clipboard?.writeText(`${window.location.origin}/share/${id}`);
    alert("Share link copied!");
  };

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 sm:text-4xl">
            My Library
          </h1>
          <p className="mt-2 text-gray-600">
            Your saved episodes, Loras, reading progress, and drafts — all in
            one place.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-groen-mint px-4 py-2 text-sm font-bold text-groen-deep ring-1 ring-border">
            🍃 {credits} credits
          </span>
          <button
            type="button"
            onClick={() => setPricingOpen(true)}
            className="rounded-full bg-groen-deep px-4 py-2 text-sm font-bold text-white"
          >
            Buy credits
          </button>
        </div>
      </div>

      {!freeUsed && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-groen-mint to-surface-soft px-5 py-4 ring-1 ring-border">
          <p className="text-sm font-bold text-groen-deep">
            🎉 Your first story is free — create something amazing today.
          </p>
        </div>
      )}

      {stories.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-black text-gray-900">
            Continue creating
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {stories.slice(0, 3).map((story) => (
              <StoryCard
                key={story.id}
                id={story.id}
                title={story.title}
                genre={String(story.genre)}
                coverGradient={story.coverGradient}
                episodes={story.episodes?.length ?? 1}
                date={story.createdAt}
                status="draft"
                href={`/story/${story.id}/preview`}
                compact
              />
            ))}
          </div>
        </section>
      )}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-2xl border-2 border-border bg-white px-4 py-3 shadow-sm">
          <span className="text-gray-400">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your stories..."
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-2xl border-2 border-border bg-white px-4 py-3 text-sm font-bold text-gray-600 shadow-sm"
          >
            ⚙ Filter
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-2xl border-2 border-border bg-white px-4 py-3 text-sm font-bold text-gray-600 shadow-sm outline-none"
          >
            <option value="recent">Recent</option>
            <option value="title">Title A–Z</option>
          </select>
        </div>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
              tab === t
                ? "bg-groen-deep text-white shadow-md"
                : "bg-white text-gray-600 ring-1 ring-gray-100"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {!hydrated ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-groen-mint border-t-groen-deep" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No stories yet"
          description="Turn your idea into a cartoon episode — your first story is free."
          actionLabel="Create your first story"
          actionHref="/create"
        />
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((story, i) => (
            <div key={story.id} className="relative">
              <button
                type="button"
                className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm"
                onClick={() => handleShare(story.id)}
              >
                ⋮
              </button>
              <StoryCard
                id={story.id}
                title={story.title}
                genre={String(story.genre)}
                coverGradient={story.coverGradient}
                episodes={story.episodes?.length ?? 1}
                date={story.createdAt}
                status={i === 0 ? "new" : "published"}
                showActions
                onShare={() => handleShare(story.id)}
              />
            </div>
          ))}
        </div>
      )}

      <PricingModal open={pricingOpen} onClose={() => setPricingOpen(false)} />
    </>
  );
}
