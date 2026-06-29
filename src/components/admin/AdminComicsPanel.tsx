"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ArtStylePicker from "@/components/admin/ArtStylePicker";
import AdminEpisodeEditor from "@/components/admin/AdminEpisodeEditor";
import AdminSeriesTable from "@/components/admin/AdminSeriesTable";
import AdminUploadComicPanel from "@/components/admin/AdminUploadComicPanel";
import {
  ADMIN_GRADIENTS,
  AdminAlert,
  AdminBrowseCategorySelect,
  AdminField,
  AdminGenreSelect,
  AdminInput,
  AdminPrimaryButton,
  AdminSelect,
  AdminTabBar,
  AdminTextarea,
  DEFAULT_PLATFORM_GENRE,
  GradientPicker,
} from "@/components/admin/adminUi";
import {
  PIPELINE_CATEGORY_OPTIONS,
  resolvePipelineSlug,
} from "@/lib/browseCategories";
import type { CatalogSeries } from "@/types/catalog";
import {
  PANEL_COUNT_MAX,
  PANEL_COUNT_MIN,
} from "@/lib/panelCount";

type PageView = "catalog" | "create" | "edit";
type CreateMode = "upload" | "ai";

export default function AdminComicsPanel() {
  const [pageView, setPageView] = useState<PageView>("catalog");
  const [editingSeriesId, setEditingSeriesId] = useState<string | null>(null);
  const [createMode, setCreateMode] = useState<CreateMode>("upload");
  const [series, setSeries] = useState<CatalogSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [filterGenre, setFilterGenre] = useState("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">(
    "all"
  );

  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState<string>(DEFAULT_PLATFORM_GENRE);
  const [mainCharacter, setMainCharacter] = useState("");
  const [loveInterest, setLoveInterest] = useState("");
  const [storyIdea, setStoryIdea] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [creatorName, setCreatorName] = useState("Toonlora Official");
  const [featuredRank, setFeaturedRank] = useState("");
  const [coverGradient, setCoverGradient] = useState<string>(ADMIN_GRADIENTS[0].class);
  const [artStyleId, setArtStyleId] = useState("cartoon-webtoon");
  const [panelCount, setPanelCount] = useState(6);
  const [showAiAdvanced, setShowAiAdvanced] = useState(false);

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

  const filteredSeries = useMemo(() => {
    const q = search.trim().toLowerCase();
    return series.filter((row) => {
      const matchSearch =
        !q ||
        row.title.toLowerCase().includes(q) ||
        row.genre.toLowerCase().includes(q) ||
        row.creatorDisplayName.toLowerCase().includes(q);
      const matchGenre =
        filterGenre === "all" ||
        resolvePipelineSlug(row.genre) === filterGenre;
      const matchStatus =
        filterStatus === "all" || row.status === filterStatus;
      return matchSearch && matchGenre && matchStatus;
    });
  }, [series, search, filterGenre, filterStatus]);

  const publishedCount = series.filter((s) => s.status === "published").length;

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
        `"${data.story?.title ?? title}" published with ${panels} AI panels.`
      );
      setTitle("");
      setStoryIdea("");
      setSynopsis("");
      setMainCharacter("");
      setLoveInterest("");
      void loadSeries();
      setPageView("catalog");
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

  const changeCategory = async (id: string, category: string) => {
    await patchSeries(id, { category });
  };

  const deleteSeries = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/series/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Delete failed");
    void loadSeries();
  };

  if (pageView === "edit" && editingSeriesId) {
    return (
      <AdminEpisodeEditor
        seriesId={editingSeriesId}
        onSaved={() => {
          void loadSeries();
          setPageView("catalog");
          setEditingSeriesId(null);
        }}
        onCancel={() => {
          setPageView("catalog");
          setEditingSeriesId(null);
        }}
      />
    );
  }

  if (pageView === "create") {
    return (
      <div className="space-y-5">
        <AdminTabBar
          active={createMode}
          onChange={(id) => setCreateMode(id as CreateMode)}
          tabs={[
            { id: "upload", label: "Upload panels", icon: "🖼️" },
            { id: "ai", label: "Generate with AI", icon: "✨" },
          ]}
        />

        {createMode === "upload" ? (
          <AdminUploadComicPanel
            onPublished={() => {
              void loadSeries();
              setPageView("catalog");
            }}
            onCancel={() => setPageView("catalog")}
          />
        ) : (
          <form
            onSubmit={handleCreate}
            className="rounded-xl border border-[#EDEBE9] bg-white shadow-sm"
          >
            <div className="border-b border-[#EDEBE9] bg-[#FAF9F8] px-5 py-4">
              <h3 className="text-sm font-semibold text-[#323130]">
                New comic — AI generation
              </h3>
              <p className="mt-1 text-xs text-[#605E5C]">
                Episode 1 is generated and published automatically.
              </p>
            </div>

            <div className="space-y-4 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <AdminField label="Title" hint="Optional — auto-generated if empty">
                  <AdminInput
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Series title"
                  />
                </AdminField>
                <AdminField label="Category">
                  <AdminGenreSelect
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                  />
                </AdminField>
                <AdminField label="Main character">
                  <AdminInput
                    required
                    value={mainCharacter}
                    onChange={(e) => setMainCharacter(e.target.value)}
                  />
                </AdminField>
                <AdminField label="Love interest">
                  <AdminInput
                    required
                    value={loveInterest}
                    onChange={(e) => setLoveInterest(e.target.value)}
                  />
                </AdminField>
              </div>
              <AdminField label="Story idea">
                <AdminTextarea
                  required
                  rows={3}
                  value={storyIdea}
                  onChange={(e) => setStoryIdea(e.target.value)}
                  placeholder="What happens in episode 1?"
                />
              </AdminField>
              <AdminField label="Synopsis">
                <AdminTextarea
                  rows={2}
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  placeholder="Shown on series page (defaults to story idea)"
                />
              </AdminField>

              <button
                type="button"
                onClick={() => setShowAiAdvanced((v) => !v)}
                className="text-xs font-semibold text-[#0078D4] hover:underline"
              >
                {showAiAdvanced ? "Hide" : "Show"} advanced options
              </button>

              {showAiAdvanced ? (
                <div className="space-y-4 rounded-lg border border-[#EDEBE9] bg-[#FAF9F8] p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <AdminField label="Creator credit">
                      <AdminInput
                        value={creatorName}
                        onChange={(e) => setCreatorName(e.target.value)}
                      />
                    </AdminField>
                    <AdminField label="Panels per episode">
                      <AdminInput
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
                      />
                    </AdminField>
                    <AdminField label="Featured rank">
                      <AdminInput
                        type="number"
                        min={1}
                        value={featuredRank}
                        onChange={(e) => setFeaturedRank(e.target.value)}
                        placeholder="Optional"
                      />
                    </AdminField>
                  </div>
                  <AdminField label="Cover gradient">
                    <GradientPicker
                      value={coverGradient}
                      onChange={setCoverGradient}
                    />
                  </AdminField>
                  <AdminField label="Art style">
                    <ArtStylePicker
                      value={artStyleId}
                      onChange={setArtStyleId}
                    />
                  </AdminField>
                </div>
              ) : null}

              {error ? <AdminAlert type="error">{error}</AdminAlert> : null}
              {message ? <AdminAlert type="success">{message}</AdminAlert> : null}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EDEBE9] bg-[#FAF9F8] px-5 py-4">
              <button
                type="button"
                onClick={() => setPageView("catalog")}
                className="text-sm font-semibold text-[#605E5C] hover:text-[#323130]"
              >
                ← Back to catalog
              </button>
              <AdminPrimaryButton type="submit" loading={creating}>
                {creating ? "Generating…" : "Generate & publish"}
              </AdminPrimaryButton>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid flex-1 gap-3 sm:grid-cols-3 sm:max-w-lg">
          <StatChip label="Total" value={series.length} />
          <StatChip label="Published" value={publishedCount} accent="#107C10" />
          <StatChip
            label="Drafts"
            value={series.length - publishedCount}
            accent="#CA5010"
          />
        </div>
        <button
          type="button"
          onClick={() => setPageView("create")}
          className="rounded-lg bg-[#0078D4] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#106EBE]"
        >
          + New comic
        </button>
      </div>

      <div className="rounded-xl border border-[#EDEBE9] bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <AdminField label="Search" className="min-w-[200px] flex-1">
            <AdminInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Title, genre, creator…"
            />
          </AdminField>
          <AdminField label="Category" className="w-48">
            <AdminSelect
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
            >
              <option value="all">All categories</option>
              {PIPELINE_CATEGORY_OPTIONS.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </AdminSelect>
          </AdminField>
          <AdminField label="Status" className="w-36">
            <AdminSelect
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as typeof filterStatus)
              }
            >
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </AdminSelect>
          </AdminField>
          <button
            type="button"
            onClick={() => void loadSeries()}
            disabled={loading}
            className="mb-0.5 rounded-lg border border-[#D2D0CE] px-3 py-2.5 text-xs font-semibold text-[#323130] hover:bg-[#F3F2F1] disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      <AdminSeriesTable
        series={filteredSeries}
        loading={loading}
        onEdit={(id) => {
          setEditingSeriesId(id);
          setPageView("edit");
        }}
        onPublish={(id) => void patchSeries(id, { action: "publish" })}
        onUnpublish={(id) => void patchSeries(id, { action: "unpublish" })}
        onDelete={(id, name) => void deleteSeries(id, name)}
        onCategoryChange={changeCategory}
      />
    </div>
  );
}

function StatChip({
  label,
  value,
  accent = "#0078D4",
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="rounded-lg border border-[#EDEBE9] bg-[#FAF9F8] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#605E5C]">
        {label}
      </p>
      <p
        className="mt-0.5 text-xl font-semibold leading-none"
        style={{ color: accent }}
      >
        {value}
      </p>
    </div>
  );
}
