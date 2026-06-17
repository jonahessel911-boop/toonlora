"use client";

import type { AdminReportingMetrics } from "@/lib/services/analytics-repository";

const COLORS = {
  blue: "#0078D4",
  green: "#107C10",
  purple: "#8764B8",
  orange: "#CA5010",
  gray: "#A19F9D",
  teal: "#038387",
} as const;

function pctOf(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((value / total) * 1000) / 10;
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-[#EDEBE9] bg-white shadow-[0_1.6px_3.6px_rgba(0,0,0,0.13)]">
      <div className="border-b border-[#EDEBE9] px-4 py-3">
        <h2 className="text-sm font-semibold text-[#323130]">{title}</h2>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-[#605E5C]">{subtitle}</p>
        ) : null}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function HorizontalBar({
  label,
  value,
  max,
  color,
  percentLabel,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  percentLabel?: string;
}) {
  const width = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
        <span className="font-medium text-[#323130]">{label}</span>
        <span className="shrink-0 tabular-nums text-[#605E5C]">
          <span className="font-semibold text-[#323130]">
            {value.toLocaleString()}
          </span>
          {percentLabel ? (
            <span className="ml-1.5 text-[#0078D4]">{percentLabel}</span>
          ) : null}
        </span>
      </div>
      <div className="h-7 overflow-hidden bg-[#EDEBE9]">
        <div
          className="flex h-full items-center justify-end pr-2 text-[10px] font-semibold text-white transition-all duration-500"
          style={{ width: `${Math.max(width, value > 0 ? 8 : 0)}%`, backgroundColor: color }}
        >
          {width >= 18 ? `${Math.round(width)}%` : null}
        </div>
      </div>
    </div>
  );
}

function FunnelStep({
  label,
  value,
  max,
  color,
  step,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  step: number;
}) {
  const width = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const inset = step * 4;

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex h-10 w-full items-center justify-center text-xs font-semibold text-white sm:h-11 sm:text-sm"
        style={{
          width: `calc(${width}% - ${inset * 2}px)`,
          minWidth: value > 0 ? "72px" : "0",
          marginLeft: `${inset}px`,
          marginRight: `${inset}px`,
          backgroundColor: color,
        }}
      >
        {value.toLocaleString()}
      </div>
      <p className="mt-1.5 text-center text-[11px] font-medium text-[#605E5C] sm:text-xs">
        {label}
      </p>
      <p className="text-[10px] tabular-nums text-[#0078D4] sm:text-[11px]">
        {pctOf(value, max)}% of visitors
      </p>
    </div>
  );
}

function VerticalBarChart({
  items,
}: {
  items: { label: string; value: number; color: string }[];
}) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="flex h-44 items-end justify-around gap-3 border-b border-[#EDEBE9] pb-1 pt-2 sm:h-52">
      {items.map((item) => {
        const height = Math.max(6, (item.value / max) * 100);
        return (
          <div
            key={item.label}
            className="flex min-w-0 flex-1 flex-col items-center gap-2"
          >
            <span className="text-xs font-semibold tabular-nums text-[#323130] sm:text-sm">
              {item.value.toLocaleString()}
            </span>
            <div
              className="w-full max-w-[72px] rounded-t-sm transition-all duration-500"
              style={{ height: `${height}%`, backgroundColor: item.color }}
            />
            <span className="text-center text-[10px] leading-tight text-[#605E5C] sm:text-[11px]">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminEngagementCharts({
  metrics,
}: {
  metrics: AdminReportingMetrics;
}) {
  const visitors = metrics.totalVisitors;
  const readers = metrics.readersCount;
  const readerPct = pctOf(readers, visitors);

  const audienceMax = Math.max(
    visitors,
    metrics.totalUsers,
    readers,
    metrics.firstThreePagesCount,
    metrics.episodeCompletedCount,
    1
  );

  const timeMaxMinutes = 30;
  const avgMinutes = metrics.avgTimeOnPlatformSeconds / 60;
  const timeWidth = Math.min(100, (avgMinutes / timeMaxMinutes) * 100);

  const retained = metrics.resignCount;
  const notRetained = Math.max(0, metrics.signupCount - metrics.resignCount);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Audience overview"
          subtitle="Counts compared to total visitors"
        >
          <div className="space-y-4">
            <HorizontalBar
              label="Unique visitors"
              value={visitors}
              max={audienceMax}
              color={COLORS.blue}
            />
            <HorizontalBar
              label="Registered users"
              value={metrics.totalUsers}
              max={audienceMax}
              color={COLORS.teal}
              percentLabel={`${pctOf(metrics.totalUsers, visitors)}%`}
            />
            <HorizontalBar
              label="Opened a story"
              value={readers}
              max={audienceMax}
              color={COLORS.purple}
              percentLabel={`${readerPct}%`}
            />
            <HorizontalBar
              label="Reached page 3+"
              value={metrics.firstThreePagesCount}
              max={audienceMax}
              color={COLORS.orange}
              percentLabel={`${metrics.firstThreePagesRate}% of readers`}
            />
            <HorizontalBar
              label="Finished episode 1"
              value={metrics.episodeCompletedCount}
              max={audienceMax}
              color={COLORS.green}
              percentLabel={`${metrics.episodeCompletedCount} sessions`}
            />
          </div>
        </Panel>

        <Panel
          title="Reading funnel"
          subtitle="Drop-off from visit to completion"
        >
          <div className="space-y-2 py-2">
            <FunnelStep
              label="Visitors"
              value={visitors}
              max={visitors}
              color={COLORS.blue}
              step={0}
            />
            <FunnelStep
              label="Opened a story"
              value={readers}
              max={visitors}
              color={COLORS.purple}
              step={1}
            />
            <FunnelStep
              label="Reached page 3+"
              value={metrics.firstThreePagesCount}
              max={visitors}
              color={COLORS.orange}
              step={2}
            />
            <FunnelStep
              label="Finished episode 1"
              value={metrics.episodeCompletedCount}
              max={visitors}
              color={COLORS.green}
              step={3}
            />
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          title="Visitor behaviour"
          subtitle="Story vs no story"
        >
          <VerticalBarChart
            items={[
              {
                label: "No story",
                value: metrics.noStoryInteractionCount,
                color: COLORS.gray,
              },
              {
                label: "Readers",
                value: readers,
                color: COLORS.purple,
              },
              {
                label: "Completed",
                value: metrics.episodeCompletedCount,
                color: COLORS.green,
              },
            ]}
          />
          <p className="mt-3 text-center text-xs text-[#605E5C]">
            {metrics.noStoryInteractionRate}% of visitors never opened a reader
          </p>
        </Panel>

        <Panel title="Week-1 retention" subtitle="2+ logins in first 7 days">
          <VerticalBarChart
            items={[
              {
                label: "Re-signed",
                value: retained,
                color: COLORS.blue,
              },
              {
                label: "One login",
                value: notRetained,
                color: COLORS.gray,
              },
            ]}
          />
          <p className="mt-3 text-center text-2xl font-semibold text-[#323130]">
            {metrics.resignRate}%
            <span className="ml-2 text-sm font-normal text-[#605E5C]">
              re-sign rate
            </span>
          </p>
        </Panel>

        <Panel
          title="Session duration"
          subtitle={`Average ${metrics.avgTimeOnPlatformFormatted} per session`}
        >
          <div className="flex h-44 flex-col justify-end sm:h-52">
            <p className="mb-2 text-right text-xs text-[#605E5C]">
              Scale: 0 – {timeMaxMinutes} min
            </p>
            <div className="h-8 overflow-hidden bg-[#EDEBE9] sm:h-10">
              <div
                className="flex h-full items-center justify-end bg-[#CA5010] pr-2 text-xs font-semibold text-white"
                style={{ width: `${Math.max(timeWidth, metrics.avgTimeOnPlatformSeconds > 0 ? 12 : 0)}%` }}
              >
                {metrics.avgTimeOnPlatformFormatted}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] text-[#605E5C]">
              <div className="rounded border border-[#EDEBE9] bg-[#FAF9F8] px-2 py-2">
                <p className="font-semibold text-[#323130]">
                  {metrics.avgTimeOnPlatformSeconds}s
                </p>
                <p>Avg seconds</p>
              </div>
              <div className="rounded border border-[#EDEBE9] bg-[#FAF9F8] px-2 py-2">
                <p className="font-semibold text-[#323130]">
                  {metrics.signupCount}
                </p>
                <p>Signups</p>
              </div>
              <div className="rounded border border-[#EDEBE9] bg-[#FAF9F8] px-2 py-2">
                <p className="font-semibold text-[#323130]">{readerPct}%</p>
                <p>Read rate</p>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
