"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  DEFAULT_SUBSCRIPTION_PLAN_ID,
  ENTREPRENEUR_PLAN,
  FREE_PLAN,
  SUBSCRIPTION_PLANS,
  formatEur,
  type SubscriptionPlan,
} from "@/lib/payments/subscription-plans";
import { EARLY_ACCESS_DAYS } from "@/lib/payments/subscription-access";
import { TIER_BENEFITS } from "@/lib/payments/reading-benefits";
import { trackPaywallCheckoutClick, trackPaywallView } from "@/lib/analytics/gtag";
import { apiFetch } from "@/lib/session";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import { useUserStore } from "@/store/useUserStore";
import { useWeeklyResetCountdown } from "@/hooks/useWeeklyResetCountdown";

interface SubscriptionPaywallProps {
  storyName: string;
  open: boolean;
  onClose: () => void;
  returnPath: string;
  coverArtUrl?: string;
  variant?: "modal" | "page";
  storyId?: string;
  episodeNumber?: number;
  /** Logged-in free user already used their weekly chapter read. */
  weeklyLimitReached?: boolean;
  /** Entrepreneur fast pass — next chapter 1 week before public release. */
  fastPass?: boolean;
  /** Pre-select a plan (e.g. Entrepreneur for fast pass). */
  initialPlanId?: string;
}

export default function SubscriptionPaywall({
  storyName,
  open,
  onClose,
  returnPath,
  coverArtUrl,
  variant = "modal",
  storyId,
  episodeNumber,
  weeklyLimitReached = false,
  fastPass = false,
  initialPlanId,
}: SubscriptionPaywallProps) {
  const { email, fullName } = useUserStore();
  const { hasPaidAccess, hydrate: hydrateSubscription } = useSubscriptionStore();
  const loggedIn = Boolean(email);
  const isOnFreePlan = loggedIn && !hasPaidAccess();
  const weeklyResetIn = useWeeklyResetCountdown(weeklyLimitReached);

  const defaultPlanId =
    initialPlanId ??
    (fastPass
      ? ENTREPRENEUR_PLAN.id
      : loggedIn && !hasPaidAccess() && !weeklyLimitReached
        ? FREE_PLAN.id
        : DEFAULT_SUBSCRIPTION_PLAN_ID);

  const [selectedPlanId, setSelectedPlanId] = useState(defaultPlanId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const paywallViewTracked = useRef(false);

  const selectedPlan =
    SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) ?? SUBSCRIPTION_PLANS[1];

  const visiblePlans = weeklyLimitReached || fastPass
    ? SUBSCRIPTION_PLANS.filter((plan) => plan.checkoutEnabled)
    : SUBSCRIPTION_PLANS;

  const selectedTierBenefits =
    selectedPlan.tier === "entrepreneur"
      ? TIER_BENEFITS.entrepreneur
      : selectedPlan.tier === "free"
        ? TIER_BENEFITS.free
        : TIER_BENEFITS.achiever;

  useEffect(() => {
    void hydrateSubscription();
  }, [hydrateSubscription]);

  useEffect(() => {
    if (!open) return;
    if (fastPass) {
      setSelectedPlanId(ENTREPRENEUR_PLAN.id);
      return;
    }
    if (initialPlanId) {
      setSelectedPlanId(initialPlanId);
      return;
    }
    if (isOnFreePlan && !weeklyLimitReached) {
      setSelectedPlanId(FREE_PLAN.id);
    }
  }, [open, fastPass, initialPlanId, isOnFreePlan, weeklyLimitReached]);

  useEffect(() => {
    if (!open || paywallViewTracked.current) return;
    paywallViewTracked.current = true;
    trackPaywallView({
      storyId,
      storyTitle: storyName,
      variant,
      episodeNumber,
    });
  }, [open, storyId, storyName, variant, episodeNumber]);

  const startCheckout = useCallback(async () => {
    if (!selectedPlan.checkoutEnabled) {
      onClose();
      return;
    }

    trackPaywallCheckoutClick({ planId: selectedPlanId, storyId });
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/api/stripe/subscription-checkout", {
        method: "POST",
        body: JSON.stringify({
          planId: selectedPlanId,
          returnPath,
          email: email || undefined,
          fullName: fullName || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      if (data.url) {
        window.location.href = data.url as string;
        return;
      }
      throw new Error("No checkout URL returned");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  }, [selectedPlan.checkoutEnabled, selectedPlanId, returnPath, storyId, onClose, email, fullName]);

  if (!open) return null;

  const shellClass =
    variant === "page"
      ? "relative flex min-h-[100dvh] flex-col bg-background text-primary"
      : "fixed inset-0 z-[120] flex flex-col bg-background text-primary";

  const heroBenefits = selectedTierBenefits;

  return (
    <div className={shellClass}>
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-lg text-muted shadow-sm transition hover:text-accent"
        aria-label="Close"
      >
        ×
      </button>

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="border-b border-border bg-nav-bg px-4 py-6 text-white">
          <div className="mx-auto flex max-w-lg items-start gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
                Toonlora membership
              </p>
              <h1 className="font-heading mt-2 text-2xl font-extrabold leading-tight sm:text-[1.65rem]">
                {weeklyLimitReached
                  ? "Want to read unlimited?"
                  : fastPass
                    ? `Fast pass — ${storyName}`
                    : `Unlock ${storyName}`}
              </h1>
              {weeklyLimitReached ? (
                <div className="mt-3 space-y-1">
                  <p className="text-sm font-semibold text-white">
                    Oops, you hit your weekly read limit
                  </p>
                  <p className="text-sm text-white/80">
                    Here is a special deal for you:
                  </p>
                  <p className="text-sm text-white/70">
                    Weekly read limit reset in:{" "}
                    <span className="font-semibold text-accent">{weeklyResetIn}</span>
                  </p>
                </div>
              ) : fastPass ? (
                <div className="mt-3 space-y-1">
                  <p className="text-sm font-semibold text-white">
                    Read the next chapter {EARLY_ACCESS_DAYS} days before everyone else
                  </p>
                  <p className="text-sm text-white/75">
                    Entrepreneur members get a fast pass to next week&apos;s episode
                    {episodeNumber ? ` — Chapter ${episodeNumber}` : ""}.
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-white/70">
                  In-depth business stories in a cartoon — pick the plan that fits you.
                </p>
              )}
            </div>
            <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl border border-white/15 shadow-lg">
              {coverArtUrl ? (
                <img src={coverArtUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent to-primary text-3xl">
                  ✦
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 py-5">
          <div className="mx-auto max-w-lg space-y-3">
            {visiblePlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                selected={selectedPlanId === plan.id}
                onSelect={() => setSelectedPlanId(plan.id)}
                isCurrentPlan={isOnFreePlan && plan.id === FREE_PLAN.id}
              />
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-lg px-4 pb-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
            With {selectedPlan.name} you get
          </p>
          <ul className="space-y-2">
            {heroBenefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-sm text-primary">
                <span className="mt-0.5 text-accent" aria-hidden>
                  ✓
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <p className="pb-4 text-center text-sm text-muted">
          Cancel anytime · 30-day money-back guarantee
        </p>

        {error ? (
          <p className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </div>

      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-0 left-0 right-0 border-t border-border bg-surface/95 px-4 py-4 shadow-[0_-8px_32px_rgba(10,22,40,0.08)] backdrop-blur-md"
      >
        <div className="mx-auto max-w-lg">
          <button
            type="button"
            disabled={loading}
            onClick={() => void startCheckout()}
            className="btn-coral flex h-14 w-full items-center justify-center rounded-2xl text-base font-extrabold disabled:opacity-60"
          >
            {loading
              ? "Processing…"
              : selectedPlan.id === FREE_PLAN.id
                ? isOnFreePlan
                  ? "Current plan"
                  : "Continue with Free"
                : `Subscribe — ${selectedPlan.priceLabel}/month`}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function PlanCard({
  plan,
  selected,
  onSelect,
  isCurrentPlan = false,
}: {
  plan: SubscriptionPlan;
  selected: boolean;
  onSelect: () => void;
  isCurrentPlan?: boolean;
}) {
  const showDiscount =
    plan.checkoutEnabled &&
    plan.compareAtCents != null &&
    plan.discountPercent != null;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative w-full rounded-xl border-2 p-4 text-left transition ${
        selected
          ? "border-accent bg-surface shadow-[0_4px_24px_rgba(59,158,255,0.12)]"
          : "border-border bg-surface hover:border-accent/40"
      }`}
    >
      {isCurrentPlan ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
          Current plan
        </span>
      ) : plan.popular ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
          Early access
        </span>
      ) : null}

      <div className="flex items-start gap-3">
        <span
          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
            selected ? "border-accent bg-accent" : "border-border bg-surface"
          }`}
        >
          {selected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-heading text-lg font-extrabold text-primary">{plan.name}</p>
              <p className="mt-1 text-sm text-muted">{plan.description}</p>
              <ul className="mt-3 space-y-1">
                {plan.features.slice(0, 3).map((feature) => (
                  <li key={feature} className="text-xs text-muted">
                    · {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="shrink-0 text-right">
              {showDiscount ? (
                <p className="text-xs text-muted line-through">
                  {formatEur(plan.compareAtCents!)}
                </p>
              ) : null}
              <p className="font-heading text-xl font-extrabold text-primary">
                {plan.checkoutEnabled ? formatEur(plan.amountCents) : plan.priceLabel}
              </p>
              <p className="text-[11px] text-muted">
                {plan.billingInterval ? "/ month" : "forever"}
              </p>
              {showDiscount ? (
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-accent">
                  {plan.discountPercent}% off
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
