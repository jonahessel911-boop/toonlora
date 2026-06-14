"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/AppChrome";
import EmptyState from "@/components/EmptyState";
import PricingModal from "@/components/PricingModal";
import { useStoryStore } from "@/store/useStoryStore";

const FILTERS = [
  { id: "all", label: "All", icon: null },
  { id: "Romance", label: "Romance", icon: "💕" },
  { id: "Fantasy", label: "Fantasy", icon: "🧙" },
  { id: "Anime", label: "Anime", icon: "🤖" },
  { id: "drafts", label: "Drafts", icon: "✏️" },
];

export default function LibraryApp() {
  const { stories, hydrate, hydrated } = useStoryStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [pricingOpen, setPricingOpen] = useState(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const filtered = stories.filter((s) => {
    const matchSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.mainCharacter?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "drafts" ? false : String(s.genre).includes(filter));
    return matchSearch && matchFilter;
  });

  return (
    <>
      <AppHeader />
      <div className="mx-auto max-w-lg px-4 pb-28 pt-2">
        <h1 className="text-2xl font-black text-gray-900">My Library</h1>
        <p className="mt-1 text-sm text-gray-500">
          All your saved stories in one place
        </p>

        <div className="mt-5 flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border-2 border-border bg-white px-4 py-3">
            <span className="text-gray-400">🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your stories..."
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>
          <button
            type="button"
            className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-border bg-white text-gray-500"
          >
            ⚙️
          </button>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
                filter === f.id
                  ? "bg-groen-primary text-white"
                  : "bg-white text-gray-600 ring-1 ring-gray-100"
              }`}
            >
              {f.icon && <span>{f.icon}</span>}
              {f.label}
            </button>
          ))}
        </div>

        {!hydrated ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-groen-mint border-t-groen-deep" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No stories yet"
              description="Create your first cartoon episode and it will appear here."
              actionHref="/create"
            />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4">
            {filtered.map((story, i) => (
              <Link
                key={story.id}
                href={`/story/${story.id}`}
                className="group"
              >
                <div className="relative overflow-hidden rounded-2xl shadow-md transition group-hover:-translate-y-0.5">
                  <div
                    className={`aspect-[3/4] bg-gradient-to-br ${story.coverGradient}`}
                  />
                  {i === 0 && (
                    <span className="absolute left-2 top-2 rounded-full bg-groen-primary px-2 py-0.5 text-[10px] font-bold text-white">
                      New
                    </span>
                  )}
                  <button
                    type="button"
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/20 text-xs text-white backdrop-blur-sm"
                    onClick={(e) => e.preventDefault()}
                  >
                    ⋮
                  </button>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                    <p className="line-clamp-2 text-sm font-bold text-white">
                      {story.title}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-gray-400">
                  {story.episodes?.length ?? 1} Episodes • Updated today
                </p>
              </Link>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setPricingOpen(true)}
          className="mt-8 w-full rounded-2xl bg-groen-mint/50 py-3 text-sm font-bold text-groen-deep"
        >
          🍃 Buy more credits
        </button>
      </div>

      <PricingModal open={pricingOpen} onClose={() => setPricingOpen(false)} />
    </>
  );
}
