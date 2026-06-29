"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminReportingMetrics } from "@/lib/services/analytics-repository";
import AdminAffiliatesPanel from "@/components/admin/AdminAffiliatesPanel";
import AdminComicsPanel from "@/components/admin/AdminComicsPanel";
import AdminEngagementCharts from "@/components/admin/AdminEngagementCharts";
import AdminLpFunnelPanel from "@/components/admin/AdminLpFunnelPanel";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<
    "reporting" | "lpFunnels" | "content" | "affiliates"
  >("reporting");
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
            onClick={() => setActiveTab("lpFunnels")}
            className={`shrink-0 rounded px-3 py-1 text-[11px] font-semibold ${
              activeTab === "lpFunnels" ? "bg-white/20" : "text-white/60"
            }`}
          >
            LP funnels
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
          <button
            type="button"
            onClick={() => setActiveTab("affiliates")}
            className={`shrink-0 rounded px-3 py-1 text-[11px] font-semibold ${
              activeTab === "affiliates" ? "bg-white/20" : "text-white/60"
            }`}
          >
            Affiliates
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
              onClick={() => setActiveTab("lpFunnels")}
              className={`flex w-full items-center gap-2 border-l-2 px-4 py-2 text-sm ${
                activeTab === "lpFunnels"
                  ? "border-[#0078D4] bg-white font-semibold text-[#0078D4]"
                  : "border-transparent text-[#323130] hover:bg-white/60"
              }`}
            >
              <span aria-hidden>🎯</span>
              LP funnel analytics
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
            <p className="px-4 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-wide text-[#605E5C]">
              Partners
            </p>
            <button
              type="button"
              onClick={() => setActiveTab("affiliates")}
              className={`flex w-full items-center gap-2 border-l-2 px-4 py-2 text-sm ${
                activeTab === "affiliates"
                  ? "border-[#0078D4] bg-white font-semibold text-[#0078D4]"
                  : "border-transparent text-[#323130] hover:bg-white/60"
              }`}
            >
              <span aria-hidden>🤝</span>
              Affiliates
            </button>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 bg-[#F8FAFC]">
          <div className="border-b border-[#EDEBE9] bg-white px-4 py-4 sm:px-6 sm:py-5">
            <p className="hidden text-xs text-[#605E5C] sm:block">
              Home <span className="mx-1">›</span>{" "}
              {activeTab === "reporting" ? (
                <>
                  Reporting <span className="mx-1">›</span>{" "}
                  <span className="text-[#323130]">User engagement</span>
                </>
              ) : activeTab === "lpFunnels" ? (
                <>
                  Reporting <span className="mx-1">›</span>{" "}
                  <span className="text-[#323130]">LP funnel drop-off</span>
                </>
              ) : activeTab === "content" ? (
                <>
                  Content <span className="mx-1">›</span>{" "}
                  <span className="text-[#323130]">Comics & publishing</span>
                </>
              ) : (
                <>
                  Partners <span className="mx-1">›</span>{" "}
                  <span className="text-[#323130]">Affiliates</span>
                </>
              )}
            </p>
            <div className="flex flex-wrap items-start justify-between gap-3 sm:mt-1">
              <div>
                <h1 className="text-xl font-semibold text-[#323130] sm:text-2xl">
                  {activeTab === "reporting"
                    ? "Platform analytics"
                    : activeTab === "lpFunnels"
                      ? "LP funnel analytics"
                      : activeTab === "content"
                        ? "Comics & publishing"
                        : "Affiliate program"}
                </h1>
                {activeTab === "reporting" && metrics ? (
                  <p className="mt-1.5 text-xs text-[#605E5C] sm:text-sm">
                    Views, completion, conversions, subscriptions &amp; revenue · Last updated{" "}
                    <time dateTime={metrics.generatedAt}>
                      {new Date(metrics.generatedAt).toLocaleString()}
                    </time>
                  </p>
                ) : activeTab === "lpFunnels" ? (
                  <p className="mt-1.5 text-xs text-[#605E5C] sm:text-sm">
                    Per-step drop-off and conversion for every{" "}
                    <code className="text-xs">/lp/{"{n}"}</code> landing page.
                  </p>
                ) : activeTab === "content" ? (
                  <p className="mt-1.5 text-xs text-[#605E5C] sm:text-sm">
                    Upload panel art or generate comics with AI, then manage your
                    catalog.
                  </p>
                ) : activeTab === "affiliates" ? (
                  <p className="mt-1.5 text-xs text-[#605E5C] sm:text-sm">
                    Manage partner links, signups, purchases, and monthly payouts.
                  </p>
                ) : null}
              </div>
              {activeTab === "reporting" ? (
                <button
                  type="button"
                  onClick={() => void loadMetrics()}
                  disabled={loading}
                  className="rounded-lg border border-[#EDEBE9] bg-white px-4 py-2 text-sm font-semibold text-[#0078D4] shadow-sm hover:bg-[#EFF6FC] disabled:opacity-50"
                >
                  {loading ? "Refreshing…" : "Refresh data"}
                </button>
              ) : null}
            </div>
          </div>

          <div className="space-y-6 p-4 sm:p-6">
            {activeTab === "content" ? (
              <AdminComicsPanel />
            ) : activeTab === "affiliates" ? (
              <AdminAffiliatesPanel />
            ) : activeTab === "lpFunnels" ? (
              <AdminLpFunnelPanel />
            ) : (
              <>
            {error ? (
              <div className="rounded-xl border border-[#F1BBBC] bg-[#FDE7E9] px-4 py-3 text-sm text-[#A4262C]">
                {error}
              </div>
            ) : null}

            {loading && !metrics ? (
              <div className="rounded-xl border border-[#EDEBE9] bg-white px-6 py-16 text-center shadow-sm">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#EDEBE9] border-t-[#0078D4]" />
                <p className="mt-4 text-sm text-[#605E5C]">
                  Loading engagement data…
                </p>
              </div>
            ) : null}

            {metrics ? <AdminEngagementCharts metrics={metrics} /> : null}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
