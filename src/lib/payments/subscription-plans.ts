export type SubscriptionTierId = "free" | "achiever" | "entrepreneur";

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTierId;
  name: string;
  label: string;
  amountCents: number;
  billingInterval: "month" | null;
  priceLabel: string;
  description: string;
  features: readonly string[];
  popular?: boolean;
  /** Paid plans only — Free is display-only on the paywall */
  checkoutEnabled: boolean;
}

export const FREE_PLAN: SubscriptionPlan = {
  id: "sub-free",
  tier: "free",
  name: "Free",
  label: "Free",
  amountCents: 0,
  billingInterval: null,
  priceLabel: "€0",
  description: "1 chapter per week, completely free",
  features: [
    "1 chapter per week on the public release schedule",
    "Browse all categories and story previews",
    "Create stories with credits",
  ],
  checkoutEnabled: false,
};

export const ACHIEVER_PLAN: SubscriptionPlan = {
  id: "sub-achiever",
  tier: "achiever",
  name: "Achiever",
  label: "Achiever",
  amountCents: 799,
  billingInterval: "month",
  priceLabel: "€7,99",
  description: "Read everything in the normal chapter line",
  features: [
    "Unlimited chapters on the public release schedule",
    "Every active business story, every week",
    "Ad-free reading on all devices",
    "Save progress across your library",
  ],
  checkoutEnabled: true,
};

export const ENTREPRENEUR_PLAN: SubscriptionPlan = {
  id: "sub-entrepreneur",
  tier: "entrepreneur",
  name: "Entrepreneur",
  label: "Entrepreneur",
  amountCents: 1299,
  billingInterval: "month",
  priceLabel: "€12,99",
  description: "Read every story 1 week before public release",
  features: [
    "Everything in Achiever",
    "Early access — new chapters 7 days early",
    "First to read flagship founder & business stories",
    "Priority for upcoming Book Drop series",
  ],
  popular: true,
  checkoutEnabled: true,
};

/** Display order on paywall: Free, Achiever, Entrepreneur */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  FREE_PLAN,
  ACHIEVER_PLAN,
  ENTREPRENEUR_PLAN,
];

export const PAID_SUBSCRIPTION_PLANS = SUBSCRIPTION_PLANS.filter(
  (plan) => plan.checkoutEnabled
);

export const DEFAULT_SUBSCRIPTION_PLAN_ID = ACHIEVER_PLAN.id;

export function getSubscriptionPlan(id: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === id);
}

export function getPlanTier(planId: string | null | undefined): SubscriptionTierId {
  if (!planId) return "free";
  const plan = getSubscriptionPlan(planId);
  return plan?.tier ?? "free";
}

export function isPaidTier(tier: SubscriptionTierId): boolean {
  return tier === "achiever" || tier === "entrepreneur";
}

/** Dutch-style euro formatting (€7,99). */
export function formatEur(cents: number): string {
  if (cents === 0) return "€0";
  const euros = (cents / 100).toFixed(2).replace(".", ",");
  return `€${euros}`;
}

export function planMonthlyRevenueCents(plan: SubscriptionPlan): number {
  if (!plan.billingInterval) return 0;
  return plan.amountCents;
}

export function subscriptionStripePriceData(plan: SubscriptionPlan) {
  return {
    currency: "eur" as const,
    unit_amount: plan.amountCents,
    recurring: {
      interval: "month" as const,
      interval_count: 1,
    },
    product_data: {
      name: `Toonlora ${plan.name}`,
      description: plan.description,
    },
  };
}
