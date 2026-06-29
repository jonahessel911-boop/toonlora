"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  DEFAULT_SUBSCRIPTION_PLAN_ID,
  ENTREPRENEUR_PLAN,
  FREE_PLAN,
  PAID_SUBSCRIPTION_PLANS,
  SUBSCRIPTION_PLANS,
  getSubscriptionPlan,
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
  /** When the weekly free claim resets (from episode-access API). */
  weeklyFreeResetsAt?: string | null;
  /** Entrepreneur fast pass — next chapter 1 week before public release. */
  fastPass?: boolean;
  /** Pre-select a plan (e.g. Entrepreneur for fast pass). */
  initialPlanId?: string;
  /** Existing subscriber changing Achiever ↔ Entrepreneur */
  changePlan?: boolean;
  onPlanChanged?: () => void;
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
  weeklyFreeResetsAt = null,
  fastPass = false,
  initialPlanId,
  changePlan = false,
  onPlanChanged,
}: SubscriptionPaywallProps) {
  const t = useTranslations("subscribe");
  const tCommon = useTranslations("common");
  const { email, fullName } = useUserStore();
  const {
    hasPaidAccess,
    planId: currentPlanId,
    hydrate: hydrateSubscription,
  } = useSubscriptionStore();
  const loggedIn = Boolean(email);
  const isOnFreePlan = loggedIn && !hasPaidAccess();
  const weeklyResetIn = useWeeklyResetCountdown(
    weeklyLimitReached,
    weeklyFreeResetsAt
  );

  const defaultPlanId =
    initialPlanId ??
    (changePlan && currentPlanId
      ? currentPlanId
      : fastPass
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

  const changePlanOptions = useMemo(() => {
    if (!changePlan) return [];
    const current = currentPlanId ? getSubscriptionPlan(currentPlanId) : undefined;
    const interval = current?.billingInterval ?? "month";
    return PAID_SUBSCRIPTION_PLANS.filter(
      (plan) => plan.billingInterval === interval
    );
  }, [changePlan, currentPlanId]);

  const visiblePlans =
    changePlan
      ? changePlanOptions
      : weeklyLimitReached || fastPass
        ? SUBSCRIPTION_PLANS.filter((plan) => plan.checkoutEnabled)
        : SUBSCRIPTION_PLANS;

  const selectedTierBenefits = (
    t.raw(`benefits.${selectedPlan.tier}`) as string[]
  ) ?? TIER_BENEFITS[selectedPlan.tier === "entrepreneur" ? "entrepreneur" : selectedPlan.tier === "free" ? "free" : "achiever"];

  const planDisplayName = (plan: SubscriptionPlan) =>
    plan.tier === "free" || plan.tier === "achiever" || plan.tier === "entrepreneur"
      ? t(`plans.${plan.tier}.name`)
      : plan.name;

  useEffect(() => {
    void hydrateSubscription();
  }, [hydrateSubscription]);

  useEffect(() => {
    if (!open) return;
    if (changePlan && currentPlanId) {
      setSelectedPlanId(currentPlanId);
      return;
    }
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
  }, [open, changePlan, currentPlanId, fastPass, initialPlanId, isOnFreePlan, weeklyLimitReached]);

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

  const startPlanChange = useCallback(async () => {
    if (selectedPlanId === currentPlanId) return;

    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/api/subscription/change-plan", {
        method: "POST",
        body: JSON.stringify({ planId: selectedPlanId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : t("planChangeFailed")
        );
      }
      await hydrateSubscription();
      onPlanChanged?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("planChangeFailed"));
      setLoading(false);
    }
  }, [
    selectedPlanId,
    currentPlanId,
    hydrateSubscription,
    onPlanChanged,
    onClose,
    t,
  ]);

  const startCheckout = useCallback(async () => {
    if (changePlan) {
      await startPlanChange();
      return;
    }
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
      if (!res.ok) throw new Error(data.error ?? t("checkoutFailed"));
      if (data.url) {
        window.location.href = data.url as string;
        return;
      }
      throw new Error("No checkout URL returned");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("checkoutFailed"));
      setLoading(false);
    }
  }, [selectedPlan.checkoutEnabled, selectedPlanId, returnPath, storyId, onClose, email, fullName, t, changePlan, startPlanChange]);

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
        aria-label={tCommon("close")}
      >
        ×
      </button>

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="border-b border-border bg-nav-bg px-4 py-6 text-white">
          <div className="mx-auto flex max-w-lg items-start gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
                {t("membership")}
              </p>
              <h1 className="font-heading mt-2 text-2xl font-extrabold leading-tight sm:text-[1.65rem]">
                {changePlan
                  ? t("changePlanTitle")
                  : weeklyLimitReached
                  ? t("wantUnlimited")
                  : fastPass
                    ? t("fastPass", { storyName })
                    : t("unlockStory", { storyName })}
              </h1>
              {changePlan ? (
                <p className="mt-2 text-sm text-white/70">{t("changePlanSubhead")}</p>
              ) : weeklyLimitReached ? (
                <div className="mt-3 space-y-1">
                  <p className="text-sm font-semibold text-white">
                    {t("weeklyLimitHit")}
                  </p>
                  <p className="text-sm text-white/80">
                    {t("specialDeal")}
                  </p>
                  <p className="text-sm text-white/70">
                    {t("weeklyResetIn", { countdown: weeklyResetIn })}
                  </p>
                </div>
              ) : fastPass ? (
                <div className="mt-3 space-y-1">
                  <p className="text-sm font-semibold text-white">
                    {t("fastPassHeadline", { days: EARLY_ACCESS_DAYS })}
                  </p>
                  <p className="text-sm text-white/75">
                    {t("fastPassBody", {
                      chapter: episodeNumber
                        ? t("chapterSuffix", { number: episodeNumber })
                        : "",
                    })}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-white/70">
                  {t("defaultSubhead")}
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
                isCurrentPlan={
                  changePlan
                    ? plan.id === currentPlanId
                    : isOnFreePlan && plan.id === FREE_PLAN.id
                }
              />
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-lg px-4 pb-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
            {t("withPlanYouGet", { planName: planDisplayName(selectedPlan) })}
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
          {t("cancelGuarantee")}
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
            disabled={loading || (changePlan && selectedPlan.id === currentPlanId)}
            onClick={() => void startCheckout()}
            className="btn-coral flex h-14 w-full items-center justify-center rounded-2xl text-base font-extrabold disabled:opacity-60"
          >
            {loading
              ? tCommon("processing")
              : changePlan
                ? selectedPlan.id === currentPlanId
                  ? t("currentPlan")
                  : t("switchPlan", {
                      planName: planDisplayName(selectedPlan),
                      price: selectedPlan.priceLabel,
                    })
                : selectedPlan.id === FREE_PLAN.id
                  ? isOnFreePlan
                    ? t("currentPlan")
                    : t("continueWithFree")
                  : t("subscribePrice", { price: selectedPlan.priceLabel })}
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
  const t = useTranslations("subscribe");
  const planBenefits = (
    t.raw(`benefits.${plan.tier}`) as string[]
  ).slice(0, 3);
  const planName =
    plan.tier === "free" || plan.tier === "achiever" || plan.tier === "entrepreneur"
      ? t(`plans.${plan.tier}.name`)
      : plan.name;
  const planDescription =
    plan.tier === "free" || plan.tier === "achiever" || plan.tier === "entrepreneur"
      ? t(`plans.${plan.tier}.description`)
      : plan.description;
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
          {t("currentPlan")}
        </span>
      ) : plan.popular ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
          {t("earlyAccess")}
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
              <p className="font-heading text-lg font-extrabold text-primary">{planName}</p>
              <p className="mt-1 text-sm text-muted">{planDescription}</p>
              <ul className="mt-3 space-y-1">
                {planBenefits.map((feature) => (
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
                {plan.billingInterval ? t("perMonth") : t("forever")}
              </p>
              {showDiscount ? (
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-accent">
                  {t("percentOff", { percent: plan.discountPercent! })}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
