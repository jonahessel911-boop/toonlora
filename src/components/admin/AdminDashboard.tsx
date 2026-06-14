"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminReportingMetrics } from "@/lib/services/analytics-repository";

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

function MetricCard({
  metric,
  value,
  rate,
  notes,
}: {
  metric: string;
  value: string;
  rate: string;
  notes: string;
}) {
  return (
    <div className="border border-[#EDEBE9] bg-white p-3 sm:hidden">
      <p className="text-xs font-semibold text-[#323130]">{metric}</p>
      <div className="mt-2 flex items-baseline justify-between gap-2">
        <span className="text-lg font-semibold text-[#323130]">{value}</span>
        <span className="text-sm font-semibold text-[#0078D4]">{rate}</span>
      </div>
      <p className="mt-1 text-[11px] text-[#605E5C]">{notes}</p>
    </div>
  );
}

export default function AdminDashboard() {
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

  const rows = metrics
    ? [
        {
          metric: "Total registered users",
          value: metrics.totalUsers.toLocaleString(),
          rate: "—",
          notes: "Profiles in Supabase",
        },
        {
          metric: "Total unique visitors",
          value: metrics.totalVisitors.toLocaleString(),
          rate: "—",
          notes: "Sessions with platform activity",
        },
        {
          metric: "Finished episode 1 (10 pages)",
          value: metrics.episodeCompletedCount.toLocaleString(),
          rate: `${metrics.episodeCompletionRate}%`,
          notes: `${metrics.readersCount} users opened a story`,
        },
        {
          metric: "No story interaction",
          value: metrics.noStoryInteractionCount.toLocaleString(),
          rate: `${metrics.noStoryInteractionRate}%`,
          notes: "Visited platform, never opened a reader",
        },
        {
          metric: "Reached first 3 pages",
          value: metrics.firstThreePagesCount.toLocaleString(),
          rate: `${metrics.firstThreePagesRate}%`,
          notes: "Of users who opened a story",
        },
        {
          metric: "Re-sign rate (2+ logins in week 1)",
          value: metrics.resignCount.toLocaleString(),
          rate: `${metrics.resignRate}%`,
          notes: `${metrics.signupCount} total signups`,
        },
        {
          metric: "Average time on platform",
          value: metrics.avgTimeOnPlatformFormatted,
          rate: `${metrics.avgTimeOnPlatformSeconds}s`,
          notes: "Per platform session",
        },
      ]
    : [];

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
          <span className="shrink-0 rounded bg-white/20 px-3 py-1 text-[11px] font-semibold">
            User reporting
          </span>
          <span className="shrink-0 rounded px-3 py-1 text-[11px] text-white/60">
            Content
          </span>
          <span className="shrink-0 rounded px-3 py-1 text-[11px] text-white/60">
            Settings
          </span>
        </nav>
      </header>

      <div className="flex min-h-[calc(100dvh-3rem-env(safe-area-inset-top))]">
        <aside className="hidden w-56 shrink-0 border-r border-[#EDEBE9] bg-[#FAF9F8] md:block">
          <nav className="py-3">
            <p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wide text-[#605E5C]">
              Monitor
            </p>
            <a
              href="#"
              className="flex items-center gap-2 border-l-2 border-[#0078D4] bg-white px-4 py-2 text-sm font-semibold text-[#0078D4]"
            >
              <span aria-hidden>📊</span>
              User reporting
            </a>
            <span className="flex items-center gap-2 px-4 py-2 text-sm text-[#A19F9D]">
              <span aria-hidden>📁</span>
              Content (soon)
            </span>
            <span className="flex items-center gap-2 px-4 py-2 text-sm text-[#A19F9D]">
              <span aria-hidden>⚙️</span>
              Settings (soon)
            </span>
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="border-b border-[#EDEBE9] bg-white px-3 py-3 sm:px-6">
            <p className="hidden text-xs text-[#605E5C] sm:block">
              Home <span className="mx-1">›</span> Reporting <span className="mx-1">›</span>{" "}
              <span className="text-[#323130]">User engagement</span>
            </p>
            <h1 className="text-lg font-semibold text-[#323130] sm:mt-1 sm:text-xl">
              User engagement report
            </h1>
            {metrics ? (
              <p className="mt-1 text-[11px] text-[#605E5C] sm:text-xs">
                Updated {new Date(metrics.generatedAt).toLocaleString()}
              </p>
            ) : null}
          </div>

          <div className="space-y-4 p-3 sm:space-y-5 sm:p-6">
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
                    label="Registered users"
                    value={metrics.totalUsers.toLocaleString()}
                    sub="Total accounts created"
                  />
                  <MetricTile
                    label="Episode 1 completion"
                    value={`${metrics.episodeCompletionRate}%`}
                    sub={`${metrics.episodeCompletedCount} finished all 10 pages`}
                    accent="#107C10"
                  />
                  <MetricTile
                    label="Re-sign rate"
                    value={`${metrics.resignRate}%`}
                    sub={`${metrics.resignCount} users logged in 2+ times in week 1`}
                    accent="#8764B8"
                  />
                  <MetricTile
                    label="Avg. time on platform"
                    value={metrics.avgTimeOnPlatformFormatted}
                    sub={`${metrics.avgTimeOnPlatformSeconds}s per session`}
                    accent="#CA5010"
                  />
                </div>

                <section className="border border-[#EDEBE9] bg-white shadow-[0_1.6px_3.6px_rgba(0,0,0,0.13)]">
                  <div className="border-b border-[#EDEBE9] px-3 py-2.5 sm:px-4 sm:py-3">
                    <h2 className="text-sm font-semibold text-[#323130]">
                      Detailed metrics
                    </h2>
                  </div>

                  <div className="divide-y divide-[#EDEBE9] sm:hidden">
                    {rows.map((row) => (
                      <MetricCard key={row.metric} {...row} />
                    ))}
                  </div>

                  <div className="hidden overflow-x-auto sm:block">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-[#FAF9F8] text-xs uppercase tracking-wide text-[#605E5C]">
                        <tr>
                          <th className="border-b border-[#EDEBE9] px-4 py-2 font-semibold">
                            Metric
                          </th>
                          <th className="border-b border-[#EDEBE9] px-4 py-2 font-semibold">
                            Count / Value
                          </th>
                          <th className="border-b border-[#EDEBE9] px-4 py-2 font-semibold">
                            Rate
                          </th>
                          <th className="border-b border-[#EDEBE9] px-4 py-2 font-semibold">
                            Notes
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, i) => (
                          <tr
                            key={row.metric}
                            className={i % 2 === 0 ? "bg-white" : "bg-[#FAF9F8]"}
                          >
                            <td className="border-b border-[#EDEBE9] px-4 py-3 font-medium text-[#323130]">
                              {row.metric}
                            </td>
                            <td className="border-b border-[#EDEBE9] px-4 py-3 text-[#323130]">
                              {row.value}
                            </td>
                            <td className="border-b border-[#EDEBE9] px-4 py-3 font-semibold text-[#0078D4]">
                              {row.rate}
                            </td>
                            <td className="border-b border-[#EDEBE9] px-4 py-3 text-[#605E5C]">
                              {row.notes}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="grid gap-3 md:grid-cols-2">
                  <div className="border border-[#EDEBE9] bg-white p-3 shadow-[0_1.6px_3.6px_rgba(0,0,0,0.13)] sm:p-4">
                    <h3 className="text-sm font-semibold text-[#323130]">
                      Reading funnel
                    </h3>
                    <ul className="mt-3 space-y-2 text-sm">
                      <li className="flex justify-between gap-2 border-b border-[#EDEBE9] pb-2">
                        <span>Visitors</span>
                        <span className="shrink-0 font-semibold">
                          {metrics.totalVisitors.toLocaleString()}
                        </span>
                      </li>
                      <li className="flex justify-between gap-2 border-b border-[#EDEBE9] pb-2">
                        <span>Opened a story</span>
                        <span className="shrink-0 text-right font-semibold text-[#0078D4]">
                          {metrics.readersCount.toLocaleString()} (
                          {metrics.totalVisitors
                            ? Math.round(
                                (metrics.readersCount / metrics.totalVisitors) * 1000
                              ) / 10
                            : 0}
                          %)
                        </span>
                      </li>
                      <li className="flex justify-between gap-2 border-b border-[#EDEBE9] pb-2">
                        <span>Reached page 3+</span>
                        <span className="shrink-0 font-semibold text-[#8764B8]">
                          {metrics.firstThreePagesCount.toLocaleString()} (
                          {metrics.firstThreePagesRate}%)
                        </span>
                      </li>
                      <li className="flex justify-between gap-2">
                        <span>Finished 10 pages</span>
                        <span className="shrink-0 font-semibold text-[#107C10]">
                          {metrics.episodeCompletedCount.toLocaleString()} (
                          {metrics.episodeCompletionRate}%)
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="border border-[#EDEBE9] bg-white p-3 shadow-[0_1.6px_3.6px_rgba(0,0,0,0.13)] sm:p-4">
                    <h3 className="text-sm font-semibold text-[#323130]">
                      Retention (week 1)
                    </h3>
                    <p className="mt-2 text-xs text-[#605E5C] sm:text-sm">
                      Re-sign rate measures signups who logged in at least{" "}
                      <strong className="text-[#323130]">2 times</strong> during their
                      first 7 days after registration.
                    </p>
                    <div className="mt-4">
                      <div className="flex items-end justify-between gap-2">
                        <span className="text-2xl font-semibold text-[#323130] sm:text-3xl">
                          {metrics.resignRate}%
                        </span>
                        <span className="text-[11px] text-[#605E5C] sm:text-xs">
                          {metrics.resignCount} / {metrics.signupCount} signups
                        </span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden bg-[#EDEBE9]">
                        <div
                          className="h-full bg-[#0078D4] transition-all"
                          style={{ width: `${Math.min(metrics.resignRate, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
