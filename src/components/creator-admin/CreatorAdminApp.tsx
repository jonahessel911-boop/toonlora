"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type {
  CreatorAdminPanel,
  CreatorAdminSeriesDetail,
  CreatorAdminSeriesSummary,
  ImageQaResult,
} from "@/types/creator-admin";
import PanelReviewDetail from "@/components/creator-admin/PanelReviewDetail";
import PipelineLiveFeed from "@/components/creator-admin/PipelineLiveFeed";
import PipelineStartPanel from "@/components/creator-admin/PipelineStartPanel";
import StoryQueuePanel from "@/components/creator-admin/StoryQueuePanel";
import SeriesCoverSection from "@/components/creator-admin/SeriesCoverSection";
import ApiUsageDisplay from "@/components/creator-admin/ApiUsageDisplay";
import type { ApiUsageSummary } from "@/lib/api-usage-cost";

type PanelFilter = "all" | "needs_review" | "approved" | "failed_qa";

function panelMatchesFilter(panel: CreatorAdminPanel, filter: PanelFilter): boolean {
  if (filter === "all") return true;
  if (filter === "approved") {
    return panel.latest_human_review?.human_rating === "approve";
  }
  if (filter === "failed_qa") {
    return panel.latest_ai_review?.passed === false;
  }
  if (filter === "needs_review") {
    return (
      Boolean(panel.image_url) &&
      panel.latest_human_review?.human_rating !== "approve"
    );
  }
  return true;
}

function scoreColor(score: number | null | undefined): string {
  if (score == null) return "text-[#667085]";
  if (score >= 75) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

export default function CreatorAdminApp() {
  const [seriesList, setSeriesList] = useState<CreatorAdminSeriesSummary[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [seriesDetail, setSeriesDetail] = useState<CreatorAdminSeriesDetail | null>(
    null
  );
  const [activeEpisode, setActiveEpisode] = useState(1);
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);
  const [panelFilter, setPanelFilter] = useState<PanelFilter>("needs_review");
  const [initialLoading, setInitialLoading] = useState(true);
  const [switchingSeries, setSwitchingSeries] = useState(false);
  const [error, setError] = useState("");
  const [creatingExtraPanel, setCreatingExtraPanel] = useState(false);
  const [batchPanelCount, setBatchPanelCount] = useState(3);
  const [batchProgress, setBatchProgress] = useState("");
  const [generatingCover, setGeneratingCover] = useState(false);
  const [lastExtraPanelUsage, setLastExtraPanelUsage] = useState<ApiUsageSummary | null>(
    null
  );
  const [lastCoverUsage, setLastCoverUsage] = useState<ApiUsageSummary | null>(null);
  const [coverSelected, setCoverSelected] = useState(false);

  const selectedSeriesIdRef = useRef<string | null>(null);
  selectedSeriesIdRef.current = selectedSeriesId;

  const fetchSeriesList = useCallback(async (): Promise<CreatorAdminSeriesSummary[]> => {
    const res = await fetch("/api/creator-admin/series");
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error ?? "Kon series niet laden");
    }
    return (data.series ?? []) as CreatorAdminSeriesSummary[];
  }, []);

  const fetchSeriesDetail = useCallback(
    async (seriesId: string): Promise<CreatorAdminSeriesDetail> => {
      const res = await fetch(`/api/creator-admin/series/${seriesId}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Kon series niet laden");
      }
      return data.series as CreatorAdminSeriesDetail;
    },
    []
  );

  const refreshSeriesDataSilent = useCallback(
    async (seriesId: string) => {
      try {
        const [list, detail] = await Promise.all([
          fetchSeriesList(),
          fetchSeriesDetail(seriesId),
        ]);
        setSeriesList(list);
        if (selectedSeriesIdRef.current === seriesId) {
          setSeriesDetail(detail);
        }
      } catch {
        // keep existing UI on background refresh failure
      }
    },
    [fetchSeriesList, fetchSeriesDetail]
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const list = await fetchSeriesList();
        if (cancelled) return;
        setSeriesList(list);
        if (list.length > 0) {
          setSelectedSeriesId(list[0].id);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Kon series niet laden");
        }
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchSeriesList]);

  useEffect(() => {
    if (!selectedSeriesId) {
      setSeriesDetail(null);
      setSwitchingSeries(false);
      return;
    }

    const isSameSeries = seriesDetail?.id === selectedSeriesId;
    if (!isSameSeries) {
      setSwitchingSeries(true);
    }

    let cancelled = false;
    void (async () => {
      try {
        const detail = await fetchSeriesDetail(selectedSeriesId);
        if (cancelled || selectedSeriesIdRef.current !== selectedSeriesId) return;
        setSeriesDetail(detail);
        if (!isSameSeries) {
          setActiveEpisode(detail.episodes[0]?.episode_number ?? 1);
          setSelectedPanelId(null);
        }
      } catch (err) {
        if (!cancelled && selectedSeriesIdRef.current === selectedSeriesId) {
          setError(err instanceof Error ? err.message : "Kon series niet laden");
        }
      } finally {
        if (!cancelled && selectedSeriesIdRef.current === selectedSeriesId) {
          setSwitchingSeries(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only reload when user picks another series
  }, [selectedSeriesId, fetchSeriesDetail]);

  const handlePipelineStarted = useCallback(
    async (seriesId: string) => {
      setError("");
      setSelectedSeriesId(seriesId);
      try {
        const list = await fetchSeriesList();
        setSeriesList(list);
      } catch {
        // list refresh is optional; detail loads via selectedSeriesId effect
      }
    },
    [fetchSeriesList]
  );

  const activeEpisodeData = useMemo(
    () =>
      seriesDetail?.episodes.find((ep) => ep.episode_number === activeEpisode) ??
      null,
    [seriesDetail, activeEpisode]
  );

  const filteredPanels = useMemo(() => {
    if (!activeEpisodeData) return [];
    return activeEpisodeData.panels.filter((p) =>
      panelMatchesFilter(p, panelFilter)
    );
  }, [activeEpisodeData, panelFilter]);

  const selectedPanel = useMemo(() => {
    if (!selectedPanelId || !seriesDetail) return null;
    for (const ep of seriesDetail.episodes) {
      const panel = ep.panels.find((p) => p.id === selectedPanelId);
      if (panel) return panel;
    }
    return null;
  }, [selectedPanelId, seriesDetail]);

  const handlePanelUpdated = (panel: CreatorAdminPanel, qa?: ImageQaResult) => {
    void qa;
    setSeriesDetail((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        episodes: prev.episodes.map((ep) => ({
          ...ep,
          panels: ep.panels.map((p) => (p.id === panel.id ? panel : p)),
        })),
      };
    });
    setSeriesList((prev) =>
      prev.map((s) => {
        if (s.id !== selectedSeriesId) return s;
        const wasApproved = panel.latest_human_review?.human_rating === "approve";
        const prevApproved = selectedPanel?.latest_human_review?.human_rating === "approve";
        let approved = s.approved_count;
        if (wasApproved && !prevApproved) approved += 1;
        if (!wasApproved && prevApproved) approved -= 1;
        return { ...s, approved_count: Math.max(0, approved) };
      })
    );
  };

  const handleManualRefresh = useCallback(async () => {
    if (!selectedSeriesId) return;
    setError("");
    try {
      await refreshSeriesDataSilent(selectedSeriesId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kon niet vernieuwen");
    }
  }, [selectedSeriesId, refreshSeriesDataSilent]);

  const handleCreateExtraPanel = useCallback(
    async (count = 1) => {
      if (!activeEpisodeData?.id || !selectedSeriesId) return;
      const safeCount = Math.min(20, Math.max(1, Math.floor(count)));
      setCreatingExtraPanel(true);
      setBatchProgress(
        safeCount > 1 ? `Bezig met ${safeCount} panels…` : ""
      );
      setError("");
      try {
        const res = await fetch(
          `/api/creator-admin/episodes/${activeEpisodeData.id}/panels`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              count: safeCount,
              generateImage: true,
              autoReview: safeCount === 1,
            }),
          }
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "Panels aanmaken mislukt");
        }
        if (data.usage) {
          setLastExtraPanelUsage(data.usage as ApiUsageSummary);
        }
        const detail = await fetchSeriesDetail(selectedSeriesId);
        setSeriesDetail(detail);
        const list = await fetchSeriesList();
        setSeriesList(list);
        const lastPanel = (data.panels?.[data.panels.length - 1] ??
          data.panel) as CreatorAdminPanel | undefined;
        if (lastPanel?.id) {
          setSelectedPanelId(lastPanel.id);
          setPanelFilter("all");
          setCoverSelected(false);
        }
        if (safeCount > 1) {
          setBatchProgress(`${safeCount} panels toegevoegd`);
          window.setTimeout(() => setBatchProgress(""), 4000);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Panels aanmaken mislukt");
        setBatchProgress("");
      } finally {
        setCreatingExtraPanel(false);
      }
    },
    [activeEpisodeData?.id, selectedSeriesId, fetchSeriesDetail, fetchSeriesList]
  );

  const handleGenerateCover = useCallback(async () => {
    if (!selectedSeriesId) return;
    setGeneratingCover(true);
    setError("");
    try {
      const res = await fetch(`/api/creator-admin/series/${selectedSeriesId}/cover`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Cover aanmaken mislukt");
      }
      if (data.usage) {
        setLastCoverUsage(data.usage as ApiUsageSummary);
      }
      const [detail, list] = await Promise.all([
        fetchSeriesDetail(selectedSeriesId),
        fetchSeriesList(),
      ]);
      setSeriesDetail(detail);
      setSeriesList(list);
      setCoverSelected(true);
      setSelectedPanelId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cover aanmaken mislukt");
    } finally {
      setGeneratingCover(false);
    }
  }, [selectedSeriesId, fetchSeriesDetail, fetchSeriesList]);

  const selectedSummary = seriesList.find((s) => s.id === selectedSeriesId);
  const showDetailLoading =
    Boolean(selectedSeriesId) &&
    switchingSeries &&
    (!seriesDetail || seriesDetail.id !== selectedSeriesId);

  return (
    <div className="min-h-[100dvh] bg-[#F6F1E7] text-[#07111F]">
      <header className="border-b border-[#07111F]/10 bg-[#07111F] text-[#F6F1E7]">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#2F80ED]">
              Pipeline QA
            </p>
            <h1 className="text-xl font-bold sm:text-2xl">Creator Admin</h1>
            <p className="mt-1 text-sm text-[#F6F1E7]/70">
              Beoordeel panels, fix prompts, en verbeter toekomstige images
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/creator"
              className="rounded-lg border border-[#F6F1E7]/20 px-3 py-2 text-sm hover:bg-white/10"
            >
              Studio
            </Link>
            <button
              type="button"
              onClick={() => void handleManualRefresh()}
              className="rounded-lg bg-[#2F80ED] px-3 py-2 text-sm font-semibold text-white hover:bg-[#2563c7]"
            >
              Vernieuwen
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] flex-col lg:flex-row">
        <aside className="w-full shrink-0 border-b border-[#07111F]/10 bg-white lg:w-72 lg:border-b-0 lg:border-r">
          <div className="p-4">
            <StoryQueuePanel
              onSelectSeries={(seriesId) => {
                setSelectedSeriesId(seriesId);
                setSelectedPanelId(null);
                setCoverSelected(false);
              }}
              onActiveSeries={(seriesId) => {
                if (seriesId) {
                  void refreshSeriesDataSilent(seriesId);
                  void fetchSeriesList().then(setSeriesList).catch(() => {});
                }
              }}
            />
            <PipelineStartPanel
              selectedSeriesId={selectedSeriesId}
              onStarted={(seriesId) => void handlePipelineStarted(seriesId)}
              onPipelineDataSync={(seriesId) => {
                void refreshSeriesDataSilent(seriesId);
              }}
            />

            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#667085]">
              Pipeline series
            </p>
            {initialLoading ? (
              <p className="text-sm text-[#667085]">Laden…</p>
            ) : seriesList.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#07111F]/15 p-4 text-sm text-[#667085]">
                <p>Nog geen series. Start hierboven je eerste pipeline.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {seriesList.map((series) => (
                  <li key={series.id}>
                    <button
                      type="button"
                      onClick={() => {
                        if (series.id !== selectedSeriesId) {
                          setSelectedSeriesId(series.id);
                          setSelectedPanelId(null);
                        }
                      }}
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        selectedSeriesId === series.id
                          ? "border-[#2F80ED] bg-[#2F80ED]/5"
                          : "border-[#07111F]/10 hover:border-[#2F80ED]/40"
                      }`}
                    >
                      <p className="font-semibold leading-tight">{series.title}</p>
                      <p className="mt-1 text-xs text-[#667085]">
                        {series.with_image_count}/{series.panel_count} images ·{" "}
                        {series.approved_count} goedgekeurd
                      </p>
                      {series.needs_review_count > 0 ? (
                        <span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                          {series.needs_review_count} te reviewen
                        </span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {error ? (
            <div className="m-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          ) : null}

          {!selectedSeriesId ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 px-6 text-center text-[#667085]">
              <p>Start een pipeline links, of selecteer een bestaande series.</p>
            </div>
          ) : showDetailLoading ? (
            <div className="flex h-64 items-center justify-center text-[#667085]">
              Panels laden…
            </div>
          ) : seriesDetail && seriesDetail.id === selectedSeriesId ? (
            <div className="flex flex-col xl:flex-row">
              <section className="min-w-0 flex-1 p-4 sm:p-6">
                <PipelineLiveFeed
                  seriesId={selectedSeriesId}
                  onArtifactsUpdated={() => {
                    void refreshSeriesDataSilent(selectedSeriesId);
                  }}
                  onPipelineResumed={() => {
                    void refreshSeriesDataSilent(selectedSeriesId);
                  }}
                  onPipelineStopped={() => {
                    void refreshSeriesDataSilent(selectedSeriesId);
                  }}
                />

                {seriesDetail.episodes.length === 0 ? (
                  <div className="rounded-xl border border-[#2F80ED]/20 bg-white p-8 text-center">
                    <p className="font-semibold text-[#07111F]">Pipeline draait…</p>
                    <p className="mt-2 text-sm text-[#667085]">
                      Panels verschijnen na &quot;Panel schrijven&quot;. Daarna wordt 1 image gegenereerd — zie voortgang links.
                    </p>
                  </div>
                ) : (
                  <>
                    <SeriesCoverSection
                      series={seriesDetail}
                      busy={generatingCover}
                      lastUsage={lastCoverUsage}
                      onGenerate={() => void handleGenerateCover()}
                    />

                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold">
                          {seriesDetail.display_title ?? seriesDetail.title}
                        </h2>
                        <p className="text-sm text-[#667085]">
                          {selectedSummary?.category ?? seriesDetail.category} ·{" "}
                          {selectedSummary?.panel_count ?? 0} panels
                          {seriesDetail.cover_art_url ? " · cover ✓" : ""}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(
                          [
                            ["needs_review", "Te reviewen"],
                            ["failed_qa", "AI fail"],
                            ["approved", "Goedgekeurd"],
                            ["all", "Alles"],
                          ] as const
                        ).map(([key, label]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setPanelFilter(key)}
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              panelFilter === key
                                ? "bg-[#07111F] text-[#F6F1E7]"
                                : "bg-white text-[#667085] ring-1 ring-[#07111F]/10"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
                      {seriesDetail.episodes.map((ep) => (
                        <button
                          key={ep.id}
                          type="button"
                          onClick={() => {
                            setActiveEpisode(ep.episode_number);
                            setSelectedPanelId(null);
                            setCoverSelected(false);
                          }}
                          className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold ${
                            activeEpisode === ep.episode_number
                              ? "bg-[#2F80ED] text-white"
                              : "bg-white text-[#07111F] ring-1 ring-[#07111F]/10"
                          }`}
                        >
                          Ep {ep.episode_number}
                        </button>
                      ))}
                      {activeEpisodeData ? (
                        <div className="flex shrink-0 items-center gap-2 rounded-lg border border-dashed border-[#2F80ED]/40 bg-[#2F80ED]/5 px-2 py-1.5">
                          <label className="flex items-center gap-1.5 text-sm text-[#07111F]">
                            <span className="sr-only">Aantal panels</span>
                            <input
                              type="number"
                              min={1}
                              max={20}
                              value={batchPanelCount}
                              disabled={creatingExtraPanel}
                              onChange={(e) =>
                                setBatchPanelCount(
                                  Math.min(
                                    20,
                                    Math.max(1, Number(e.target.value) || 1)
                                  )
                                )
                              }
                              className="w-14 rounded-md border border-[#07111F]/15 bg-white px-2 py-1.5 text-center text-sm font-semibold outline-none focus:border-[#2F80ED] disabled:opacity-50"
                            />
                          </label>
                          <button
                            type="button"
                            disabled={creatingExtraPanel}
                            onClick={() => void handleCreateExtraPanel(batchPanelCount)}
                            className="whitespace-nowrap rounded-md bg-[#2F80ED] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#2563c7] disabled:opacity-50"
                          >
                            {creatingExtraPanel
                              ? batchPanelCount > 1
                                ? `Panels maken…`
                                : "Panel maken…"
                              : `Create ${batchPanelCount} panel${batchPanelCount === 1 ? "" : "s"} in this episode`}
                          </button>
                        </div>
                      ) : null}
                    </div>

                    {batchProgress && creatingExtraPanel ? (
                      <p className="mb-3 text-xs font-medium text-[#2F80ED]">
                        {batchProgress}
                      </p>
                    ) : null}

                    {lastExtraPanelUsage ? (
                      <div className="mb-4">
                        <ApiUsageDisplay usage={lastExtraPanelUsage} />
                      </div>
                    ) : null}

                    {filteredPanels.length === 0 && panelFilter !== "all" ? (
                      <p className="rounded-xl border border-dashed border-[#07111F]/15 bg-white p-8 text-center text-sm text-[#667085]">
                        Geen panels in dit filter voor episode {activeEpisode}.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {panelFilter === "all" ? (
                          <button
                            type="button"
                            onClick={() => {
                              setCoverSelected(true);
                              setSelectedPanelId(null);
                            }}
                            className={`overflow-hidden rounded-xl border bg-white text-left transition ${
                              coverSelected
                                ? "border-[#2F80ED] ring-2 ring-[#2F80ED]/30"
                                : "border-[#07111F]/10 hover:border-[#2F80ED]/50"
                            }`}
                          >
                            <div className="aspect-square bg-[#07111F]/5">
                              {seriesDetail.cover_art_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={seriesDetail.cover_art_url}
                                  alt="Series cover"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full flex-col items-center justify-center gap-1 p-2 text-center text-xs text-[#667085]">
                                  <span>📕</span>
                                  <span>Geen cover</span>
                                </div>
                              )}
                            </div>
                            <div className="p-2">
                              <span className="text-xs font-bold text-[#2F80ED]">
                                Cover
                              </span>
                              <p className="mt-0.5 text-[10px] text-[#667085]">
                                {seriesDetail.display_title
                                  ? "Catalog poster"
                                  : "Nog niet gemaakt"}
                              </p>
                            </div>
                          </button>
                        ) : null}
                        {filteredPanels.map((panel) => {
                          const ai = panel.latest_ai_review;
                          const human = panel.latest_human_review;
                          const isSelected = panel.id === selectedPanelId;

                          return (
                            <button
                              key={panel.id}
                              type="button"
                              onClick={() => {
                                setSelectedPanelId(panel.id);
                                setCoverSelected(false);
                              }}
                              className={`overflow-hidden rounded-xl border bg-white text-left transition ${
                                isSelected
                                  ? "border-[#2F80ED] ring-2 ring-[#2F80ED]/30"
                                  : "border-[#07111F]/10 hover:border-[#2F80ED]/50"
                              }`}
                            >
                              <div className="aspect-square bg-[#07111F]/5">
                                {panel.image_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={panel.image_url}
                                    alt={`Panel ${panel.panel_number}`}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-xs text-[#667085]">
                                    Geen image
                                  </div>
                                )}
                              </div>
                              <div className="p-2">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-xs font-bold">
                                    #{panel.panel_number}
                                  </span>
                                  {human?.human_rating === "approve" ? (
                                    <span className="text-[10px] text-emerald-600">✓</span>
                                  ) : human?.human_rating === "reject" ? (
                                    <span className="text-[10px] text-red-600">✗</span>
                                  ) : null}
                                </div>
                                {ai ? (
                                  <p
                                    className={`mt-0.5 text-[10px] font-semibold ${scoreColor(ai.score)}`}
                                  >
                                    AI {ai.score ?? "—"}
                                    {ai.passed === false ? " · fail" : ""}
                                  </p>
                                ) : (
                                  <p className="mt-0.5 text-[10px] text-[#667085]">
                                    Niet gereviewd
                                  </p>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </section>

              {selectedPanel ? (
                <div className="hidden xl:contents">
                  <PanelReviewDetail
                    panel={selectedPanel}
                    onClose={() => setSelectedPanelId(null)}
                    onUpdated={handlePanelUpdated}
                  />
                </div>
              ) : coverSelected && seriesDetail.cover_art_url ? (
                <aside className="hidden w-full shrink-0 border-t border-[#07111F]/10 bg-white p-6 xl:block xl:w-[420px] xl:border-l xl:border-t-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#667085]">
                    Series cover
                  </p>
                  <p className="mt-1 font-bold">
                    {seriesDetail.display_title ?? seriesDetail.title}
                  </p>
                  <div className="mt-4 overflow-hidden rounded-xl bg-[#07111F]/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={seriesDetail.cover_art_url}
                      alt="Series cover"
                      className="w-full object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={generatingCover}
                    onClick={() => void handleGenerateCover()}
                    className="mt-4 rounded-lg bg-[#2F80ED] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {generatingCover ? "Bezig…" : "Cover opnieuw maken"}
                  </button>
                </aside>
              ) : (
                <aside className="hidden w-full shrink-0 border-t border-[#07111F]/10 bg-white p-6 xl:block xl:w-[420px] xl:border-l xl:border-t-0">
                  <p className="text-sm text-[#667085]">
                    Klik op cover of een panel om te reviewen, fixen of opnieuw te
                    genereren.
                  </p>
                </aside>
              )}
            </div>
          ) : null}
        </main>
      </div>

      {selectedPanel ? (
        <div className="xl:hidden">
          <PanelReviewDetail
            panel={selectedPanel}
            onClose={() => setSelectedPanelId(null)}
            onUpdated={handlePanelUpdated}
            mobile
          />
        </div>
      ) : null}
    </div>
  );
}
