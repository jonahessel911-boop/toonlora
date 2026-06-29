"use client";

import type { AdminReportingMetrics } from "@/lib/services/analytics-repository";

const COLORS = {
  blue: "#0078D4",
  green: "#107C10",
  purple: "#5C2D91",
  orange: "#CA5010",
} as const;

function KpiCard({
  label,
  value,
  sub,
  accent = COLORS.blue,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-lg border border-[#EDEBE9] bg-white px-3 py-2.5 shadow-sm">
      <div className="flex items-center justify-between gap-1">
        <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-[#605E5C]">
          {label}
        </p>
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: accent }}
          aria-hidden
        />
      </div>
      <p className="mt-1 text-lg font-semibold tabular-nums leading-none text-[#323130]">
        {value}
      </p>
      {sub ? (
        <p className="mt-1 truncate text-[10px] text-[#605E5C]">{sub}</p>
      ) : null}
    </div>
  );
}

export default function AdminEngagementCharts({
  metrics,
}: {
  metrics: AdminReportingMetrics;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
      <KpiCard
        label="Views"
        value={metrics.totalSeriesViews.toLocaleString()}
        sub={`${metrics.totalEpisodeOpens} opens`}
      />
      <KpiCard
        label="Completion"
        value={`${metrics.episodeCompletionRate}%`}
        sub={`${metrics.episodeCompletedCount}/${metrics.totalEpisodeOpens}`}
        accent={COLORS.green}
      />
      <KpiCard
        label="Next ep."
        value={metrics.nextEpisodeClickCount.toLocaleString()}
        sub={`${metrics.nextEpisodeClickRate}% of done`}
        accent={COLORS.orange}
      />
      <KpiCard
        label="Checkouts"
        value={metrics.checkoutsStarted.toLocaleString()}
        sub={`${metrics.checkoutConversionRate}% of paywall`}
        accent={COLORS.purple}
      />
      <KpiCard
        label="Users"
        value={metrics.totalUsers.toLocaleString()}
        sub="Registered"
      />
      <KpiCard
        label="WAU"
        value={metrics.wau.toLocaleString()}
        sub={
          metrics.totalUsers > 0
            ? `${Math.round((metrics.wau / metrics.totalUsers) * 1000) / 10}% active`
            : undefined
        }
        accent={COLORS.blue}
      />
      <KpiCard
        label="MAU"
        value={metrics.mau.toLocaleString()}
        sub={
          metrics.totalUsers > 0
            ? `${Math.round((metrics.mau / metrics.totalUsers) * 1000) / 10}% active`
            : undefined
        }
        accent={COLORS.purple}
      />
      <KpiCard
        label="Subs"
        value={metrics.activeSubscriptions.toLocaleString()}
        sub="Active Plus"
        accent={COLORS.green}
      />
      <KpiCard
        label="MRR"
        value={metrics.mrrFormatted}
        sub="Monthly revenue"
        accent={COLORS.green}
      />
    </div>
  );
}
