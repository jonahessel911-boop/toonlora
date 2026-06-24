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
  explanation,
  rate,
  accent = COLORS.blue,
}: {
  label: string;
  value: string;
  explanation: string;
  rate?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-[#EDEBE9] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#605E5C]">
          {label}
        </p>
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: accent }}
          aria-hidden
        />
      </div>
      <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-[#323130]">
        {value}
      </p>
      <p className="mt-2 text-sm leading-snug text-[#605E5C]">{explanation}</p>
      {rate ? (
        <p
          className="mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{ backgroundColor: `${accent}18`, color: accent }}
        >
          {rate}
        </p>
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
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      <KpiCard
        label="Total views"
        value={metrics.totalSeriesViews.toLocaleString()}
        explanation="Series page views across all stories"
        rate={`${metrics.totalEpisodeOpens.toLocaleString()} episode opens`}
      />
      <KpiCard
        label="Completion rate"
        value={`${metrics.episodeCompletionRate}%`}
        explanation="View → full episode read"
        rate={`${metrics.episodeCompletedCount.toLocaleString()} of ${metrics.totalEpisodeOpens.toLocaleString()} opens`}
        accent={COLORS.green}
      />
      <KpiCard
        label="Next episode clicks"
        value={metrics.nextEpisodeClickCount.toLocaleString()}
        explanation="Clicks on continue / next episode"
        rate={`${metrics.nextEpisodeClickRate}% of completions`}
        accent={COLORS.orange}
      />
      <KpiCard
        label="Checkouts started"
        value={metrics.checkoutsStarted.toLocaleString()}
        explanation="Stripe subscription checkouts initiated"
        rate={`${metrics.checkoutConversionRate}% of paywall views`}
        accent={COLORS.purple}
      />
      <KpiCard
        label="Total users"
        value={metrics.totalUsers.toLocaleString()}
        explanation="Registered accounts"
        accent={COLORS.blue}
      />
      <KpiCard
        label="WAU"
        value={metrics.wau.toLocaleString()}
        explanation="Signed-up users active in the last 7 days"
        rate={
          metrics.totalUsers > 0
            ? `${Math.round((metrics.wau / metrics.totalUsers) * 1000) / 10}% of registered`
            : undefined
        }
        accent={COLORS.blue}
      />
      <KpiCard
        label="MAU"
        value={metrics.mau.toLocaleString()}
        explanation="Signed-up users active in the last 30 days"
        rate={
          metrics.totalUsers > 0
            ? `${Math.round((metrics.mau / metrics.totalUsers) * 1000) / 10}% of registered`
            : undefined
        }
        accent={COLORS.purple}
      />
      <KpiCard
        label="Active subscriptions"
        value={metrics.activeSubscriptions.toLocaleString()}
        explanation="Currently active Toonlora Plus subscribers"
        accent={COLORS.blue}
      />
      <KpiCard
        label="MRR"
        value={metrics.mrrFormatted}
        explanation="Estimated monthly recurring revenue"
        accent={COLORS.green}
      />
    </div>
  );
}
