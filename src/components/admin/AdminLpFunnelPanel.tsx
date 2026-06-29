"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  LpFunnelReport,
  LpFunnelReportsResponse,
} from "@/lib/services/analytics-repository";

const DAY_OPTIONS = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
  { label: "All time", value: null },
] as const;

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
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: string;
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
      {hint ? <p className="mt-1 text-xs leading-snug text-[#605E5C]">{hint}</p> : null}
    </div>
  );
}

function OverviewTable({
  data,
  selectedLpId,
  onSelect,
}: {
  data: LpFunnelReportsResponse;
  selectedLpId: string | null;
  onSelect: (lpId: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#EDEBE9] bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-[#EDEBE9] bg-[#FAF9F8] text-xs uppercase tracking-wide text-[#605E5C]">
          <tr>
            <th className="px-4 py-3 font-semibold">Landing page</th>
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
              key={row.lpId}
              className={`cursor-pointer border-b border-[#EDEBE9] last:border-0 hover:bg-[#FAF9F8] ${
                selectedLpId === row.lpId ? "bg-[#EFF6FC]" : ""
              }`}
              onClick={() => onSelect(row.lpId)}
            >
              <td className="px-4 py-3 font-semibold text-[#0078D4]">
                /lp/{row.lpId}
                {row.variant ? (
                  <span className="ml-1.5 text-xs font-normal text-[#605E5C]">
                    ({row.variant})
                  </span>
                ) : null}
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
  const [selectedLpId, setSelectedLpId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      setSelectedLpId((prev) => {
        if (prev && json.reports.some((r) => r.lpId === prev)) return prev;
        return json.reports[0]?.lpId ?? null;
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

  const report = useMemo(
    () => data?.reports.find((r) => r.lpId === selectedLpId) ?? null,
    [data, selectedLpId]
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
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="rounded-lg border border-[#EDEBE9] bg-white px-4 py-2 text-sm font-semibold text-[#0078D4] shadow-sm hover:bg-[#EFF6FC] disabled:opacity-50"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
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
              All landing pages
            </h2>
            <p className="mb-4 text-xs text-[#605E5C]">
              Click a row to see step-by-step page views and fall-off rates.
            </p>
            <OverviewTable
              data={data}
              selectedLpId={selectedLpId}
              onSelect={setSelectedLpId}
            />
          </div>

          {report ? (
            <>
              <div className="flex flex-wrap gap-2">
                {data.reports.map((r) => (
                  <button
                    key={r.lpId}
                    type="button"
                    onClick={() => setSelectedLpId(r.lpId)}
                    className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                      selectedLpId === r.lpId
                        ? "border-[#0078D4] bg-[#0078D4] text-white"
                        : "border-[#EDEBE9] bg-white text-[#323130] hover:bg-[#FAF9F8]"
                    }`}
                  >
                    LP/{r.lpId}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                  label="Page views"
                  value={report.totalPageViews.toLocaleString()}
                  hint={`/lp/${report.lpId} — all step impressions`}
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

              <div>
                <h2 className="mb-3 text-sm font-semibold text-[#323130]">
                  Page views &amp; fall-off per step · LP/{report.lpId}
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
