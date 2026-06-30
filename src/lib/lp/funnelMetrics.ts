import type { LpFunnelReport } from "@/lib/services/analytics-repository";

export interface LpFunnelKeyMetricDefinition {
  id: string;
  label: string;
  hint: string;
  /** Field on the report used for the count (visitors uses uniqueVisitors). */
  countKey: keyof Pick<
    LpFunnelReport,
    | "uniqueVisitors"
    | "introCtaClicks"
    | "chapter2UnlockClicks"
    | "subscribes"
  >;
  /** Rate vs visitors (shown as % of visitors). */
  rateKey?:
    | "introCtaRate"
    | "chapter2UnlockRate"
    | "subscribeRate";
}

/** Per-`/lp/{n}` key metrics shown at the top of the funnel detail view. */
export const LP_FUNNEL_KEY_METRICS: Record<string, LpFunnelKeyMetricDefinition[]> =
  {
    "5": [
      {
        id: "visitors",
        label: "Visitors",
        hint: "Unique sessions that landed on /lp/5",
        countKey: "uniqueVisitors",
      },
      {
        id: "intro_cta",
        label: "Start reading CTA",
        hint: 'Clicked "Start Chapter 1 Free" on the intro',
        countKey: "introCtaClicks",
        rateKey: "introCtaRate",
      },
      {
        id: "chapter2_unlock",
        label: "Chapter 2 unlock",
        hint: 'Clicked "Unlock" on the Chapter 2 card after reading ch.1',
        countKey: "chapter2UnlockClicks",
        rateKey: "chapter2UnlockRate",
      },
      {
        id: "subscribe",
        label: "Subscribed",
        hint: "Completed a subscription from this funnel",
        countKey: "subscribes",
        rateKey: "subscribeRate",
      },
    ],
  };

export function lpFunnelHasKeyMetrics(lpId: string): boolean {
  return Boolean(LP_FUNNEL_KEY_METRICS[lpId]?.length);
}
