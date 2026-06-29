export type SubscriptionTierId = "free" | "achiever" | "entrepreneur";

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTierId;
  name: string;
  label: string;
  amountCents: number;
  billingInterval: "month" | "year" | null;
  priceLabel: string;
  /** Full price before paywall promo discount (shown struck-through). */
  compareAtCents?: number;
  /** Promo discount percent (e.g. 49 → 49% off). */
  discountPercent?: number;
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
  description: "Chapter 1 is free to preview. Create an account for 1 chapter per week.",
  features: [
    "Chapter 1 preview on every story (no account needed)",
    "1 extra chapter per week after you sign up",
    "Browse all categories and story previews",
    "Create stories with credits",
  ],
  checkoutEnabled: false,
};

export const ACHIEVER_DISCOUNT_PERCENT = 49;
export const ENTREPRENEUR_DISCOUNT_PERCENT = 69;

/** List price so that `amountCents` equals the discounted monthly price. */
export function listPriceCentsForDiscount(
  saleCents: number,
  discountPercent: number
): number {
  const factor = 1 - discountPercent / 100;
  if (factor <= 0) return saleCents;
  return Math.round(saleCents / factor);
}

export const ACHIEVER_PLAN: SubscriptionPlan = {
  id: "sub-achiever",
  tier: "achiever",
  name: "Achiever",
  label: "Achiever",
  amountCents: 799,
  billingInterval: "month",
  priceLabel: "€7,99",
  compareAtCents: listPriceCentsForDiscount(799, ACHIEVER_DISCOUNT_PERCENT),
  discountPercent: ACHIEVER_DISCOUNT_PERCENT,
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
  compareAtCents: listPriceCentsForDiscount(1299, ENTREPRENEUR_DISCOUNT_PERCENT),
  discountPercent: ENTREPRENEUR_DISCOUNT_PERCENT,
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

export const ACHIEVER_YEARLY_PLAN: SubscriptionPlan = {
  id: "sub-achiever-yearly",
  tier: "achiever",
  name: "Achiever",
  label: "Achiever Yearly",
  amountCents: 5999,
  billingInterval: "year",
  priceLabel: "€59,99",
  compareAtCents: ACHIEVER_PLAN.amountCents * 12,
  discountPercent: Math.round(
    (1 - 5999 / (ACHIEVER_PLAN.amountCents * 12)) * 100
  ),
  description: "Read everything in the normal chapter line",
  features: ACHIEVER_PLAN.features,
  checkoutEnabled: true,
};

export const ENTREPRENEUR_YEARLY_PLAN: SubscriptionPlan = {
  id: "sub-entrepreneur-yearly",
  tier: "entrepreneur",
  name: "Entrepreneur",
  label: "Entrepreneur Yearly",
  amountCents: 9999,
  billingInterval: "year",
  priceLabel: "€99,99",
  compareAtCents: ENTREPRENEUR_PLAN.amountCents * 12,
  discountPercent: Math.round(
    (1 - 9999 / (ENTREPRENEUR_PLAN.amountCents * 12)) * 100
  ),
  description: "Read every story 1 week before public release",
  features: ENTREPRENEUR_PLAN.features,
  popular: true,
  checkoutEnabled: true,
};

/** Display order on paywall: Free, Achiever, Entrepreneur */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  FREE_PLAN,
  ACHIEVER_PLAN,
  ENTREPRENEUR_PLAN,
  ACHIEVER_YEARLY_PLAN,
  ENTREPRENEUR_YEARLY_PLAN,
];

export const MONTHLY_SUBSCRIPTION_PLANS = [ACHIEVER_PLAN, ENTREPRENEUR_PLAN] as const;

export const YEARLY_SUBSCRIPTION_PLANS = [
  ACHIEVER_YEARLY_PLAN,
  ENTREPRENEUR_YEARLY_PLAN,
] as const;

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
  if (plan.billingInterval === "year") return Math.round(plan.amountCents / 12);
  return plan.amountCents;
}

export function planIntervalSuffix(plan: SubscriptionPlan): string {
  if (plan.billingInterval === "year") return "/yr";
  if (plan.billingInterval === "month") return "/mo";
  return "";
}

export function planPerDayLabel(plan: SubscriptionPlan): string {
  const days = plan.billingInterval === "year" ? 365 : 30;
  const perDay = (plan.amountCents / 100 / days).toFixed(2);
  return `€${perDay}/day`;
}

export function yearlyPlanForTier(
  tier: SubscriptionTierId
): SubscriptionPlan | undefined {
  if (tier === "achiever") return ACHIEVER_YEARLY_PLAN;
  if (tier === "entrepreneur") return ENTREPRENEUR_YEARLY_PLAN;
  return undefined;
}

export function monthlyPlanForTier(
  tier: SubscriptionTierId
): SubscriptionPlan | undefined {
  if (tier === "achiever") return ACHIEVER_PLAN;
  if (tier === "entrepreneur") return ENTREPRENEUR_PLAN;
  return undefined;
}

export function subscriptionStripePriceData(plan: SubscriptionPlan) {
  const interval = (plan.billingInterval === "year" ? "year" : "month") as
    | "month"
    | "year";
  return {
    currency: "eur" as const,
    unit_amount: plan.amountCents,
    recurring: {
      interval,
      interval_count: 1,
    },
    product_data: {
      name: `Toonlora ${plan.name}${plan.billingInterval === "year" ? " (Yearly)" : ""}`,
    },
    lookup_key: planStripeLookupKey(plan),
  };
}

export function planStripeLookupKey(plan: SubscriptionPlan): string {
  return `toonlora_${plan.id}`;
}

export function planSubscriptionLabel(plan: SubscriptionPlan): string {
  if (plan.billingInterval === "year") {
    return `${formatEur(plan.amountCents)}/year`;
  }
  return `${formatEur(plan.amountCents)}/month`;
}

export function planApplePayRecurringBilling(plan: SubscriptionPlan) {
  return {
    amount: plan.amountCents,
    label:
      plan.billingInterval === "year"
        ? "Yearly Toonlora subscription"
        : "Monthly Toonlora subscription",
    recurringPaymentIntervalUnit:
      plan.billingInterval === "year" ? ("year" as const) : ("month" as const),
    recurringPaymentIntervalCount: 1,
  };
}
