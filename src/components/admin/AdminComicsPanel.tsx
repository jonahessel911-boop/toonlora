"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import ArtStylePicker from "@/components/admin/ArtStylePicker";
import type { CatalogSeries } from "@/types/catalog";
import {
  PANEL_COUNT_MAX,
  PANEL_COUNT_MIN,
} from "@/lib/panelCount";

const GENRES = [
  "Romance",
  "Anime",
  "Fantasy",
  "Comedy",
  "Drama",
  "Adventure",
  "Slice of Life",
];

const GRADIENTS = [
  "from-[#5340FF] via-[#7C3AED] to-[#FF4FA3]",
  "from-[#FF6847] via-[#FF4FA3] to-[#5340FF]",
  "from-[#22D3EE] via-[#5340FF] to-[#2A114B]",
  "from-[#FFE033] via-[#FF6847] to-[#FBBF24]",
];

export default function AdminComicsPanel() {
  const [series, setSeries] = useState<CatalogSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("Fantasy");
  const [mainCharacter, setMainCharacter] = useState("");
  const [loveInterest, setLoveInterest] = useState("");
  const [storyIdea, setStoryIdea] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [creatorName, setCreatorName] = useState("Toonlora Official");
  const [featuredRank, setFeaturedRank] = useState("");
  const [coverGradient, setCoverGradient] = useState(GRADIENTS[0]);
  const [artStyleId, setArtStyleId] = useState("cartoon-webtoon");
  const [panelCount, setPanelCount] = useState(6);

  const loadSeries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/series");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load series");
      setSeries(data.series ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load series");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSeries();
  }, [loadSeries]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/admin/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          story_idea: storyIdea,
          genre,
          tone: "Cinematic",
          main_character: mainCharacter,
          love_interest: loveInterest,
          language: "English",
          episode_length: "Normal",
          target_audience: "Teens / Young Adults",
          panel_count: panelCount,
          art_style_id: artStyleId,
          synopsis: synopsis || storyIdea,
          creator_display_name: creatorName,
          featured_rank: featuredRank ? Number(featuredRank) : null,
          cover_gradient: coverGradient,
          custom_title: title || undefined,
          publish: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create comic");

      const panels =
        data.story?.episodes?.[0]?.script?.panels?.length ?? panelCount;
      setMessage(
        `Published "${data.story?.title ?? title}" — episode 1 with ${panels} panels.`
      );
      setTitle("");
      setStoryIdea("");
      setSynopsis("");
      void loadSeries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create comic");
    } finally {
      setCreating(false);
    }
  };

  const patchSeries = async (id: string, body: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/series/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Update failed");
    void loadSeries();
  };

  const deleteSeries = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/series/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Delete failed");
    void loadSeries();
  };

  return (
    <div className="space-y-6">
      <section className="border border-[#EDEBE9] bg-white shadow-[0_1.6px_3.6px_rgba(0,0,0,0.13)]">
        <div className="border-b border-[#EDEBE9] px-4 py-3">
          <h2 className="text-sm font-semibold text-[#323130]">
            Create &amp; publish official comic
          </h2>
          <p className="mt-1 text-xs text-[#605E5C]">
            Generates episode 1 as one vertical webtoon page (single column, no
            grid) with OpenAI — genre and art style shape the visuals. Requires{" "}
            <code className="text-[11px]">OPENAI_API_KEY</code> in{" "}
            <code className="text-[11px]">.env.local</code>.
          </p>
        </div>

        <form onSubmit={handleCreate} className="space-y-5 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-[#323130]">
              Series title (optional)
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full border border-[#8A8886] px-3 py-2 text-sm"
                placeholder="Auto-generated from characters"
              />
            </label>
            <label className="block text-xs font-semibold text-[#323130]">
              Genre
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="mt-1 w-full border border-[#8A8886] px-3 py-2 text-sm"
              >
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold text-[#323130]">
              Main character
              <input
                required
                value={mainCharacter}
                onChange={(e) => setMainCharacter(e.target.value)}
                className="mt-1 w-full border border-[#8A8886] px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs font-semibold text-[#323130]">
              Love interest
              <input
                required
                value={loveInterest}
                onChange={(e) => setLoveInterest(e.target.value)}
                className="mt-1 w-full border border-[#8A8886] px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs font-semibold text-[#323130] sm:col-span-2">
              Story idea
              <textarea
                required
                value={storyIdea}
                onChange={(e) => setStoryIdea(e.target.value)}
                rows={3}
                className="mt-1 w-full border border-[#8A8886] px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs font-semibold text-[#323130] sm:col-span-2">
              Synopsis (shown on series page)
              <textarea
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                rows={2}
                className="mt-1 w-full border border-[#8A8886] px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs font-semibold text-[#323130]">
              Creator credit
              <input
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                className="mt-1 w-full border border-[#8A8886] px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs font-semibold text-[#323130]">
              Featured rank (lower = higher on homepage)
              <input
                type="number"
                value={featuredRank}
                onChange={(e) => setFeaturedRank(e.target.value)}
                className="mt-1 w-full border border-[#8A8886] px-3 py-2 text-sm"
                placeholder="1"
              />
            </label>
          </div>

          <div className="rounded border border-[#EDEBE9] bg-[#FAF9F8] p-4">
            <p className="text-xs font-semibold text-[#323130]">
              Generation settings
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-semibold text-[#323130]">
                Episodes to generate
                <input
                  readOnly
                  value="1"
                  className="mt-1 w-full cursor-not-allowed border border-[#EDEBE9] bg-white px-3 py-2 text-sm text-[#605E5C]"
                />
                <span className="mt-1 block text-[11px] font-normal text-[#605E5C]">
                  Admin create always starts with episode 1.
                </span>
              </label>
              <label className="block text-xs font-semibold text-[#323130]">
                Panels per episode
                <input
                  type="number"
                  min={PANEL_COUNT_MIN}
                  max={PANEL_COUNT_MAX}
                  required
                  value={panelCount}
                  onChange={(e) =>
                    setPanelCount(
                      Math.min(
                        PANEL_COUNT_MAX,
                        Math.max(
                          PANEL_COUNT_MIN,
                          Number(e.target.value) || PANEL_COUNT_MIN
                        )
                      )
                    )
                  }
                  className="mt-1 w-full border border-[#8A8886] px-3 py-2 text-sm"
                />
                <span className="mt-1 block text-[11px] font-normal text-[#605E5C]">
                  {PANEL_COUNT_MIN}–{PANEL_COUNT_MAX} vertical strips stacked in
                  one column (no grid).
                </span>
              </label>
            </div>
          </div>

          <ArtStylePicker value={artStyleId} onChange={setArtStyleId} />

          <div>
            <p className="text-xs font-semibold text-[#323130]">Cover gradient</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {GRADIENTS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setCoverGradient(g)}
                  className={`h-10 w-16 rounded bg-gradient-to-br ${g} ring-2 ${
                    coverGradient === g ? "ring-[#0078D4]" : "ring-transparent"
                  }`}
                />
              ))}
            </div>
          </div>

          {error ? <p className="text-sm text-[#A4262C]">{error}</p> : null}
          {message ? <p className="text-sm text-[#107C10]">{message}</p> : null}

          <button
            type="submit"
            disabled={creating}
            className="bg-[#0078D4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#106EBE] disabled:opacity-50"
          >
            {creating
              ? `Generating episode 1 (${panelCount} panels)…`
              : `Generate & publish episode 1 (${panelCount} panels)`}
          </button>
        </form>
      </section>

      <section className="border border-[#EDEBE9] bg-white shadow-[0_1.6px_3.6px_rgba(0,0,0,0.13)]">
        <div className="border-b border-[#EDEBE9] px-4 py-3">
          <h2 className="text-sm font-semibold text-[#323130]">All series</h2>
        </div>

        {loading ? (
          <p className="p-4 text-sm text-[#605E5C]">Loading series…</p>
        ) : series.length === 0 ? (
          <p className="p-4 text-sm text-[#605E5C]">
            No series yet. Create your first official comic above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#FAF9F8] text-xs uppercase text-[#605E5C]">
                <tr>
                  <th className="px-4 py-2">Title</th>
                  <th className="px-4 py-2">Source</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Eps</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {series.map((row) => (
                  <tr key={row.id} className="border-t border-[#EDEBE9]">
                    <td className="px-4 py-3 font-medium text-[#323130]">
                      <Link
                        href={`/story/${row.id}`}
                        className="text-[#0078D4] hover:underline"
                      >
                        {row.title}
                      </Link>
                      <p className="text-xs text-[#605E5C]">{row.genre}</p>
                    </td>
                    <td className="px-4 py-3 capitalize text-[#605E5C]">
                      {row.source}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-semibold ${
                          row.status === "published"
                            ? "bg-[#DFF6DD] text-[#107C10]"
                            : "bg-[#F3F2F1] text-[#605E5C]"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#605E5C]">
                      {row.episodeCount}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/story/${row.id}/read`}
                          className="text-xs font-semibold text-[#0078D4]"
                        >
                          Read
                        </Link>
                        {row.status === "published" ? (
                          <button
                            type="button"
                            onClick={() =>
                              void patchSeries(row.id, { action: "unpublish" })
                            }
                            className="text-xs text-[#605E5C]"
                          >
                            Unpublish
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              void patchSeries(row.id, { action: "publish" })
                            }
                            className="text-xs font-semibold text-[#107C10]"
                          >
                            Publish
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => void deleteSeries(row.id, row.title)}
                          className="text-xs text-[#A4262C]"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
