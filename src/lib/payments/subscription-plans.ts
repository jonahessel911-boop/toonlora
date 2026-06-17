export interface SubscriptionPlan {
  id: string;
  label: string;
  weeks: number;
  amountCents: number;
  compareAtCents: number;
  perWeekCents: number;
  savePercent: number;
  accessLabel: string;
  popular?: boolean;
  bestValue?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "sub-1w",
    label: "1 week",
    weeks: 1,
    amountCents: 599,
    compareAtCents: 789,
    perWeekCents: 599,
    savePercent: 24,
    accessLabel: "FULL ACCESS",
  },
  {
    id: "sub-4w",
    label: "4 weeks",
    weeks: 4,
    amountCents: 1036,
    compareAtCents: 1549,
    perWeekCents: 259,
    savePercent: 33,
    accessLabel: "FULL ACCESS",
  },
  {
    id: "sub-12w",
    label: "12 weeks",
    weeks: 12,
    amountCents: 1908,
    compareAtCents: 3559,
    perWeekCents: 159,
    savePercent: 46,
    popular: true,
    accessLabel: "FULL ACCESS + Uncensored",
  },
  {
    id: "sub-24w",
    label: "24 weeks",
    weeks: 24,
    amountCents: 2952,
    compareAtCents: 6529,
    perWeekCents: 123,
    savePercent: 55,
    bestValue: true,
    accessLabel: "FULL ACCESS + Uncensored",
  },
];

export const DEFAULT_SUBSCRIPTION_PLAN_ID = "sub-12w";

export function getSubscriptionPlan(id: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === id);
}

export function formatEur(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

export function subscriptionStripePriceData(plan: SubscriptionPlan) {
  return {
    currency: "eur" as const,
    unit_amount: plan.amountCents,
    recurring: {
      interval: "week" as const,
      interval_count: plan.weeks,
    },
    product_data: {
      name: `Toonlora VIP — ${plan.label}`,
      description: plan.accessLabel,
    },
  };
}
