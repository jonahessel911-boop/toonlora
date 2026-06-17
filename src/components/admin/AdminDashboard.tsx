"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminReportingMetrics } from "@/lib/services/analytics-repository";
import AdminComicsPanel from "@/components/admin/AdminComicsPanel";
import AdminEngagementCharts from "@/components/admin/AdminEngagementCharts";

function MetricTile({
  label,
  value,
  sub,
  accent = "#0078D4",
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="border border-[#EDEBE9] bg-white shadow-[0_1.6px_3.6px_rgba(0,0,0,0.13)]">
      <div className="h-1" style={{ backgroundColor: accent }} />
      <div className="px-3 py-3 sm:px-4 sm:py-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#605E5C] sm:text-[11px]">
          {label}
        </p>
        <p className="mt-1.5 text-2xl font-semibold leading-none text-[#323130] sm:mt-2 sm:text-[32px]">
          {value}
        </p>
        {sub ? (
          <p className="mt-1.5 text-[11px] leading-relaxed text-[#605E5C] sm:mt-2 sm:text-xs">
            {sub}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"reporting" | "content">(
    "reporting"
  );
  const [metrics, setMetrics] = useState<AdminReportingMetrics | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/reporting");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load reporting.");
        return;
      }
      setMetrics(data.metrics);
    } catch {
      setError("Could not load reporting data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMetrics();
  }, [loadMetrics]);

  const readerRate = metrics?.totalVisitors
    ? Math.round((metrics.readersCount / metrics.totalVisitors) * 1000) / 10
    : 0;

  return (
    <div
      className="min-h-[100dvh] bg-[#F3F2F1] text-[#323130] pb-[env(safe-area-inset-bottom)]"
      style={{ fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif' }}
    >
      <header className="bg-[#0078D4] pt-[env(safe-area-inset-top)] text-white">
        <div className="flex h-12 items-center justify-between gap-2 px-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="grid h-7 w-7 shrink-0 place-items-center bg-white/15 text-xs font-bold">
              TL
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-none">
                Toonlora Admin Center
              </p>
              <p className="mt-0.5 hidden text-[11px] text-white/80 sm:block">
                Reporting · Users · Engagement
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadMetrics()}
            disabled={loading}
            className="shrink-0 border border-white/30 px-2.5 py-1 text-[11px] hover:bg-white/10 disabled:opacity-50 sm:px-3 sm:text-xs"
          >
            {loading ? "…" : "Refresh"}
          </button>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-t border-white/15 px-3 py-2 md:hidden">
          <button
            type="button"
            onClick={() => setActiveTab("reporting")}
            className={`shrink-0 rounded px-3 py-1 text-[11px] font-semibold ${
              activeTab === "reporting" ? "bg-white/20" : "text-white/60"
            }`}
          >
            Reporting
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("content")}
            className={`shrink-0 rounded px-3 py-1 text-[11px] font-semibold ${
              activeTab === "content" ? "bg-white/20" : "text-white/60"
            }`}
          >
            Comics
          </button>
        </nav>
      </header>

      <div className="flex min-h-[calc(100dvh-3rem-env(safe-area-inset-top))]">
        <aside className="hidden w-56 shrink-0 border-r border-[#EDEBE9] bg-[#FAF9F8] md:block">
          <nav className="py-3">
            <p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wide text-[#605E5C]">
              Monitor
            </p>
            <button
              type="button"
              onClick={() => setActiveTab("reporting")}
              className={`flex w-full items-center gap-2 border-l-2 px-4 py-2 text-sm ${
                activeTab === "reporting"
                  ? "border-[#0078D4] bg-white font-semibold text-[#0078D4]"
                  : "border-transparent text-[#323130] hover:bg-white/60"
              }`}
            >
              <span aria-hidden>📊</span>
              User reporting
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("content")}
              className={`flex w-full items-center gap-2 border-l-2 px-4 py-2 text-sm ${
                activeTab === "content"
                  ? "border-[#0078D4] bg-white font-semibold text-[#0078D4]"
                  : "border-transparent text-[#323130] hover:bg-white/60"
              }`}
            >
              <span aria-hidden>📁</span>
              Comics &amp; publish
            </button>
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="border-b border-[#EDEBE9] bg-white px-3 py-3 sm:px-6">
            <p className="hidden text-xs text-[#605E5C] sm:block">
              Home <span className="mx-1">›</span> Reporting <span className="mx-1">›</span>{" "}
              <span className="text-[#323130]">User engagement</span>
            </p>
            <h1 className="text-lg font-semibold text-[#323130] sm:mt-1 sm:text-xl">
              {activeTab === "reporting"
                ? "User engagement report"
                : "Comics & publishing"}
            </h1>
            {activeTab === "reporting" && metrics ? (
              <p className="mt-1 text-[11px] text-[#605E5C] sm:text-xs">
                Updated {new Date(metrics.generatedAt).toLocaleString()}
              </p>
            ) : null}
          </div>

          <div className="space-y-4 p-3 sm:space-y-5 sm:p-6">
            {activeTab === "content" ? (
              <AdminComicsPanel />
            ) : (
              <>
            {error ? (
              <div className="border border-[#F1BBBC] bg-[#FDE7E9] px-3 py-2.5 text-sm text-[#A4262C] sm:px-4 sm:py-3">
                {error}
              </div>
            ) : null}

            {loading && !metrics ? (
              <div className="border border-[#EDEBE9] bg-white px-4 py-8 text-center text-sm text-[#605E5C]">
                Loading reporting data…
              </div>
            ) : null}

            {metrics ? (
              <>
                <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
                  <MetricTile
                    label="Visitors"
                    value={metrics.totalVisitors.toLocaleString()}
                    sub={`${metrics.totalUsers} registered`}
                  />
                  <MetricTile
                    label="Story readers"
                    value={metrics.readersCount.toLocaleString()}
                    sub={`${readerRate}% of visitors`}
                    accent="#8764B8"
                  />
                  <MetricTile
                    label="Episode 1 finished"
                    value={metrics.episodeCompletedCount.toLocaleString()}
                    sub={`${metrics.firstThreePagesCount} reached page 3+`}
                    accent="#107C10"
                  />
                  <MetricTile
                    label="Avg. session time"
                    value={metrics.avgTimeOnPlatformFormatted}
                    sub={`${metrics.resignRate}% week-1 re-sign`}
                    accent="#CA5010"
                  />
                </div>

                <AdminEngagementCharts metrics={metrics} />
              </>
            ) : null}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
