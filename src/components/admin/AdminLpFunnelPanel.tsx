"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  LpFunnelReport,
  LpFunnelReportsResponse,
} from "@/lib/services/analytics-repository";
import {
  LP_FUNNEL_KEY_METRICS,
  lpFunnelHasKeyMetrics,
  type LpFunnelKeyMetricDefinition,
} from "@/lib/lp/funnelMetrics";

const DAY_OPTIONS = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
  { label: "All time", value: null },
] as const;

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L4 13.172V16h2.828l7.38-7.379-2.83-2.828z" />
    </svg>
  );
}

function EditableAngleLabel({
  reportKey,
  label,
  onRenamed,
  onError,
  className,
  labelClassName,
}: {
  reportKey: string;
  label: string;
  onRenamed: (reportKey: string, label: string) => void;
  onError: (message: string) => void;
  className?: string;
  labelClassName?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(label);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(label);
  }, [label, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const cancel = () => {
    setDraft(label);
    setEditing(false);
  };

  const save = async () => {
    const next = draft.trim();
    if (!next) {
      onError("Name cannot be empty.");
      return;
    }
    if (next === label) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/lp-funnel/angles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportKey, label: next }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        onError(json.error ?? "Could not save name.");
        return;
      }
      onRenamed(reportKey, next);
      setEditing(false);
    } catch {
      onError("Could not save name.");
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div
        className={`flex items-center gap-1.5 ${className ?? ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          type="text"
          value={draft}
          disabled={saving}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void save();
            if (e.key === "Escape") cancel();
          }}
          className="min-w-0 flex-1 rounded-md border border-[#C8C6C4] bg-white px-2 py-1 text-sm font-semibold text-[#323130] outline-none focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4]"
          aria-label="Lander angle name"
        />
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="rounded-md bg-[#0078D4] px-2 py-1 text-xs font-semibold text-white hover:bg-[#106EBE] disabled:opacity-50"
        >
          {saving ? "…" : "Save"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={cancel}
          className="rounded-md border border-[#EDEBE9] bg-white px-2 py-1 text-xs font-semibold text-[#605E5C] hover:bg-[#FAF9F8] disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 ${className ?? ""}`}>
      <span className={labelClassName ?? "font-semibold text-[#0078D4]"}>{label}</span>
      <button
        type="button"
        title="Edit name"
        aria-label={`Edit name for ${label}`}
        onClick={(e) => {
          e.stopPropagation();
          setEditing(true);
        }}
        className="rounded p-1 text-[#605E5C] hover:bg-[#EDEBE9] hover:text-[#0078D4]"
      >
        <PencilIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function pctBar(rate: number, color: string) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#EDEBE9]">
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${Math.min(100, Math.max(0, rate))}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  accent = "#0078D4",
  subValue,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: string;
  subValue?: string;
}) {
  return (
    <div className="rounded-xl border border-[#EDEBE9] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#605E5C]">
          {label}
        </p>
        <span
          className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: accent }}
          aria-hidden
        />
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-[#323130]">
        {value}
      </p>
      {subValue ? (
        <p className="mt-0.5 text-sm font-semibold tabular-nums text-[#0078D4]">
          {subValue}
        </p>
      ) : null}
      {hint ? <p className="mt-1 text-xs leading-snug text-[#605E5C]">{hint}</p> : null}
    </div>
  );
}

const KEY_METRIC_ACCENTS = ["#0078D4", "#5C2D91", "#CA5010", "#107C10"];

function LpFunnelKeyMetricsPanel({ report }: { report: LpFunnelReport }) {
  const metrics = LP_FUNNEL_KEY_METRICS[report.lpId];
  if (!metrics?.length) return null;

  const getCount = (metric: LpFunnelKeyMetricDefinition) => {
    const value = report[metric.countKey];
    return typeof value === "number" ? value : 0;
  };

  const getRate = (metric: LpFunnelKeyMetricDefinition) => {
    if (!metric.rateKey) return null;
    const rate = report[metric.rateKey];
    return typeof rate === "number" ? rate : 0;
  };

  return (
    <div>
      <h2 className="mb-1 text-sm font-semibold text-[#323130]">
        Key metrics · /lp/{report.lpId}
      </h2>
      <p className="mb-4 text-xs text-[#605E5C]">
        Conversion funnel for {report.angleLabel}. Rates are % of visitors.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => {
          const count = getCount(metric);
          const rate = getRate(metric);
          return (
            <SummaryCard
              key={metric.id}
              label={metric.label}
              value={count.toLocaleString()}
              subValue={
                rate != null && metric.id !== "visitors"
                  ? `${rate}% of visitors`
                  : undefined
              }
              hint={metric.hint}
              accent={KEY_METRIC_ACCENTS[index % KEY_METRIC_ACCENTS.length]}
            />
          );
        })}
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-[#EDEBE9] bg-white p-4 shadow-sm">
        <div className="flex min-w-[520px] items-stretch gap-2">
          {metrics.map((metric, index) => {
            const count = getCount(metric);
            const visitors = report.uniqueVisitors;
            const width =
              visitors > 0 ? Math.max(8, (count / visitors) * 100) : 0;
            const isLast = index === metrics.length - 1;
            return (
              <div key={metric.id} className="flex flex-1 items-center gap-2">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="truncate text-[10px] font-bold uppercase tracking-wide text-[#605E5C]">
                    {metric.label}
                  </p>
                  <div className="h-3 overflow-hidden rounded-full bg-[#EDEBE9]">
                    <div
                      className="h-full rounded-full bg-[#0078D4] transition-all"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <p className="text-xs font-semibold tabular-nums text-[#323130]">
                    {count.toLocaleString()}
                  </p>
                </div>
                {!isLast ? (
                  <span className="shrink-0 text-[#C8C6C4]" aria-hidden>
                    →
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function OverviewTable({
  data,
  selectedReportKey,
  onSelect,
  onRenamed,
  onRenameError,
}: {
  data: LpFunnelReportsResponse;
  selectedReportKey: string | null;
  onSelect: (reportKey: string) => void;
  onRenamed: (reportKey: string, label: string) => void;
  onRenameError: (message: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#EDEBE9] bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-[#EDEBE9] bg-[#FAF9F8] text-xs uppercase tracking-wide text-[#605E5C]">
          <tr>
            <th className="px-4 py-3 font-semibold">Lander</th>
            <th className="px-4 py-3 font-semibold">Page views</th>
            <th className="px-4 py-3 font-semibold">Unique visitors</th>
            <th className="px-4 py-3 font-semibold">Checkout</th>
            <th className="px-4 py-3 font-semibold">Subscribed</th>
            <th className="px-4 py-3 font-semibold">Conversion</th>
          </tr>
        </thead>
        <tbody>
          {data.overview.map((row) => (
            <tr
              key={row.reportKey}
              className={`cursor-pointer border-b border-[#EDEBE9] last:border-0 hover:bg-[#FAF9F8] ${
                selectedReportKey === row.reportKey ? "bg-[#EFF6FC]" : ""
              }`}
              onClick={() => onSelect(row.reportKey)}
            >
              <td className="px-4 py-3">
                <EditableAngleLabel
                  reportKey={row.reportKey}
                  label={row.angleLabel}
                  onRenamed={onRenamed}
                  onError={onRenameError}
                />
                <p className="mt-0.5 text-xs text-[#605E5C]">/lp/{row.lpId}</p>
              </td>
              <td className="px-4 py-3 tabular-nums">
                {row.totalPageViews.toLocaleString()}
              </td>
              <td className="px-4 py-3 tabular-nums">
                {row.uniqueVisitors.toLocaleString()}
              </td>
              <td className="px-4 py-3 tabular-nums">
                {row.checkoutStarts.toLocaleString()}
              </td>
              <td className="px-4 py-3 tabular-nums text-[#107C10]">
                {row.subscribes.toLocaleString()}
              </td>
              <td className="px-4 py-3 tabular-nums font-semibold">
                {row.subscribeRate}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FunnelTable({ report }: { report: LpFunnelReport }) {
  const maxUnique = Math.max(
    report.uniqueVisitors,
    ...report.steps.map((s) => s.uniqueVisitors),
    1
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-[#EDEBE9] bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-[#EDEBE9] bg-[#FAF9F8] text-xs uppercase tracking-wide text-[#605E5C]">
          <tr>
            <th className="px-3 py-3 font-semibold sm:px-4">Step</th>
            <th className="px-3 py-3 font-semibold sm:px-4">Page views</th>
            <th className="px-3 py-3 font-semibold sm:px-4">Visitors</th>
            <th className="px-3 py-3 font-semibold sm:px-4">% of start</th>
            <th className="px-3 py-3 font-semibold sm:px-4">Step fall-off</th>
            <th className="px-3 py-3 font-semibold sm:px-4">Total fall-off</th>
            <th className="px-3 py-3 font-semibold sm:px-4">Completed</th>
            <th className="min-w-[120px] px-3 py-3 font-semibold sm:px-4">Funnel</th>
          </tr>
        </thead>
        <tbody>
          {report.steps.map((step) => (
            <tr
              key={step.step}
              className="border-b border-[#EDEBE9] last:border-0"
            >
              <td className="px-3 py-3 font-medium text-[#323130] sm:px-4">
                <span className="text-[#605E5C]">{step.stepIndex + 1}.</span>{" "}
                {step.label}
              </td>
              <td className="px-3 py-3 tabular-nums sm:px-4">
                {step.pageViews.toLocaleString()}
              </td>
              <td className="px-3 py-3 tabular-nums font-medium sm:px-4">
                {step.uniqueVisitors.toLocaleString()}
              </td>
              <td className="px-3 py-3 tabular-nums text-[#0078D4] sm:px-4">
                {step.shareOfStarts}%
              </td>
              <td className="px-3 py-3 tabular-nums text-[#A4262C] sm:px-4">
                {step.stepIndex === 0 ? "—" : `${step.stepFallOff}%`}
              </td>
              <td className="px-3 py-3 tabular-nums text-[#A4262C] sm:px-4">
                {step.dropOffFromStart}%
              </td>
              <td className="px-3 py-3 tabular-nums sm:px-4">
                <span className="text-[#107C10]">
                  {step.uniqueCompletions.toLocaleString()}
                </span>
                <span className="ml-1 text-xs text-[#605E5C]">
                  ({step.completionRate}%)
                </span>
              </td>
              <td className="px-3 py-3 sm:px-4">
                {pctBar((step.uniqueVisitors / maxUnique) * 100, "#0078D4")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminLpFunnelPanel() {
  const [days, setDays] = useState<number | null>(30);
  const [data, setData] = useState<LpFunnelReportsResponse | null>(null);
  const [selectedReportKey, setSelectedReportKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resettingLpId, setResettingLpId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = days == null ? "days=all" : `days=${days}`;
      const res = await fetch(`/api/admin/lp-funnel?${query}`);
      const json = (await res.json()) as LpFunnelReportsResponse & {
        error?: string;
      };
      if (!res.ok) {
        setError(json.error ?? "Failed to load LP funnel analytics.");
        return;
      }
      setData(json);
      setSelectedReportKey((prev) => {
        if (prev && json.reports.some((r) => r.reportKey === prev)) return prev;
        return json.reports[0]?.reportKey ?? null;
      });
    } catch {
      setError("Could not load LP funnel analytics.");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleResetLander = useCallback(
    async (lpId: string, label: string) => {
      const confirmed = window.confirm(
        `Reset analytics for ${label} (/lp/${lpId})?\n\nThis clears funnel events for this lander only. Other landers are kept. This cannot be undone.`
      );
      if (!confirmed) return;

      setResettingLpId(lpId);
      setError("");
      try {
        const res = await fetch("/api/admin/lp-funnel/reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lpId }),
        });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error ?? "Reset failed.");
          return;
        }
        await load();
      } catch {
        setError("Could not reset LP funnel analytics.");
      } finally {
        setResettingLpId(null);
      }
    },
    [load]
  );

  const handleRename = useCallback((reportKey: string, label: string) => {
    setData((prev) => {
      if (!prev) return prev;
      const apply = <T extends { reportKey: string; angleLabel: string }>(row: T) =>
        row.reportKey === reportKey ? { ...row, angleLabel: label } : row;
      return {
        ...prev,
        reports: prev.reports.map(apply),
        overview: prev.overview.map(apply),
      };
    });
  }, []);

  const report = useMemo(
    () => data?.reports.find((r) => r.reportKey === selectedReportKey) ?? null,
    [data, selectedReportKey]
  );

  const totals = useMemo(() => {
    if (!data) return null;
    return data.overview.reduce(
      (acc, row) => ({
        pageViews: acc.pageViews + row.totalPageViews,
        visitors: acc.visitors + row.uniqueVisitors,
        subscribes: acc.subscribes + row.subscribes,
      }),
      { pageViews: 0, visitors: 0, subscribes: 0 }
    );
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {DAY_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setDays(opt.value)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                days === opt.value
                  ? "border-[#0078D4] bg-[#EFF6FC] text-[#0078D4]"
                  : "border-[#EDEBE9] bg-white text-[#605E5C] hover:bg-[#FAF9F8]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading || resettingLpId !== null}
            className="rounded-lg border border-[#EDEBE9] bg-white px-4 py-2 text-sm font-semibold text-[#0078D4] shadow-sm hover:bg-[#EFF6FC] disabled:opacity-50"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-[#F1BBBC] bg-[#FDE7E9] px-4 py-3 text-sm text-[#A4262C]">
          {error}
        </div>
      ) : null}

      {loading && !data ? (
        <div className="rounded-xl border border-[#EDEBE9] bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#EDEBE9] border-t-[#0078D4]" />
          <p className="mt-4 text-sm text-[#605E5C]">Loading LP funnel data…</p>
        </div>
      ) : null}

      {data && data.reports.length === 0 ? (
        <div className="rounded-xl border border-[#EDEBE9] bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-sm font-medium text-[#323130]">No LP funnel data yet</p>
          <p className="mt-2 text-sm text-[#605E5C]">
            Visit <code className="text-xs">/lp/3</code> or{" "}
            <code className="text-xs">/lp/4</code> and walk through the funnel.
          </p>
        </div>
      ) : null}

      {data && data.reports.length > 0 && totals ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total page views"
              value={totals.pageViews.toLocaleString()}
              hint="All step views across every LP"
            />
            <SummaryCard
              label="Unique visitors"
              value={totals.visitors.toLocaleString()}
              hint="Sessions that entered any LP funnel"
              accent="#5C2D91"
            />
            <SummaryCard
              label="Subscriptions"
              value={totals.subscribes.toLocaleString()}
              hint="Completed subscribe events"
              accent="#107C10"
            />
            <SummaryCard
              label="Overall conversion"
              value={`${totals.visitors > 0 ? Math.round((totals.subscribes / totals.visitors) * 1000) / 10 : 0}%`}
              hint="Subscribes ÷ unique visitors"
              accent="#CA5010"
            />
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-[#323130]">
              All landers
            </h2>
            <p className="mb-4 text-xs text-[#605E5C]">
              One row per landing page. Click the edit icon to rename how it appears here.
            </p>
            <OverviewTable
              data={data}
              selectedReportKey={selectedReportKey}
              onSelect={setSelectedReportKey}
              onRenamed={handleRename}
              onRenameError={setError}
            />
          </div>

          {report ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {data.reports.map((r) => (
                    <button
                      key={r.reportKey}
                      type="button"
                      onClick={() => setSelectedReportKey(r.reportKey)}
                      className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                        selectedReportKey === r.reportKey
                          ? "border-[#0078D4] bg-[#0078D4] text-white"
                          : "border-[#EDEBE9] bg-white text-[#323130] hover:bg-[#FAF9F8]"
                      }`}
                    >
                      {r.angleLabel}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    void handleResetLander(report.lpId, report.angleLabel)
                  }
                  disabled={loading || resettingLpId !== null}
                  className="rounded-lg border border-[#F1BBBC] bg-white px-4 py-2 text-sm font-semibold text-[#A4262C] shadow-sm hover:bg-[#FDE7E9] disabled:opacity-50"
                >
                  {resettingLpId === report.lpId
                    ? "Resetting…"
                    : `Reset /lp/${report.lpId}`}
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                  label="Page views"
                  value={report.totalPageViews.toLocaleString()}
                  hint={`${report.angleLabel} · /lp/${report.lpId}`}
                />
                <SummaryCard
                  label="Unique visitors"
                  value={report.uniqueVisitors.toLocaleString()}
                  hint="Sessions that started the funnel"
                  accent="#5C2D91"
                />
                <SummaryCard
                  label="Reached checkout"
                  value={`${report.checkoutStartRate}%`}
                  hint={`${report.checkoutStarts.toLocaleString()} visitors`}
                  accent="#CA5010"
                />
                <SummaryCard
                  label="Subscribed"
                  value={`${report.subscribeRate}%`}
                  hint={`${report.subscribes.toLocaleString()} conversions`}
                  accent="#107C10"
                />
              </div>

              {lpFunnelHasKeyMetrics(report.lpId) ? (
                <LpFunnelKeyMetricsPanel report={report} />
              ) : null}

              <div>
                <h2 className="mb-3 text-sm font-semibold text-[#323130]">
                  Page views &amp; fall-off per step · {report.angleLabel}
                </h2>
                <p className="mb-4 text-xs leading-relaxed text-[#605E5C]">
                  <strong>Page views</strong> = every time the step was shown (incl.
                  back navigation). <strong>Visitors</strong> = unique sessions.
                  <strong> % of start</strong> = share of entrants who reached this
                  step. <strong>Step fall-off</strong> = % lost vs. the previous step.
                  <strong> Total fall-off</strong> = % lost since funnel start.
                </p>
                <FunnelTable report={report} />
              </div>

              {data.generatedAt ? (
                <p className="text-xs text-[#605E5C]">
                  Last updated{" "}
                  <time dateTime={data.generatedAt}>
                    {new Date(data.generatedAt).toLocaleString()}
                  </time>
                </p>
              ) : null}
            </>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
