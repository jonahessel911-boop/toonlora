"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  DEFAULT_SUBSCRIPTION_PLAN_ID,
  FREE_PLAN,
  SUBSCRIPTION_PLANS,
  formatEur,
  type SubscriptionPlan,
} from "@/lib/payments/subscription-plans";
import { TIER_BENEFITS } from "@/lib/payments/reading-benefits";
import { trackPaywallCheckoutClick, trackPaywallView } from "@/lib/analytics/gtag";
import { apiFetch } from "@/lib/session";

interface SubscriptionPaywallProps {
  storyName: string;
  open: boolean;
  onClose: () => void;
  returnPath: string;
  coverArtUrl?: string;
  variant?: "modal" | "page";
  storyId?: string;
  episodeNumber?: number;
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
}: SubscriptionPaywallProps) {
  const [selectedPlanId, setSelectedPlanId] = useState(DEFAULT_SUBSCRIPTION_PLAN_ID);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const paywallViewTracked = useRef(false);

  const selectedPlan =
    SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) ?? SUBSCRIPTION_PLANS[1];

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
        body: JSON.stringify({ planId: selectedPlanId, returnPath }),
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
  }, [selectedPlan.checkoutEnabled, selectedPlanId, returnPath, storyId, onClose]);

  if (!open) return null;

  const shellClass =
    variant === "page"
      ? "relative flex min-h-[100dvh] flex-col bg-background text-primary"
      : "fixed inset-0 z-[120] flex flex-col bg-background text-primary";

  const heroBenefits = TIER_BENEFITS.achiever;

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
                Unlock {storyName}
              </h1>
              <p className="mt-2 text-sm text-white/70">
                In-depth business stories in a cartoon — pick the plan that fits you.
              </p>
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
            {SUBSCRIPTION_PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                selected={selectedPlanId === plan.id}
                onSelect={() => setSelectedPlanId(plan.id)}
              />
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-lg px-4 pb-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
            With Achiever you get
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
                ? "Continue with Free"
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
}: {
  plan: SubscriptionPlan;
  selected: boolean;
  onSelect: () => void;
}) {
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
      {plan.popular ? (
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
              <p className="font-heading text-xl font-extrabold text-primary">
                {plan.checkoutEnabled ? formatEur(plan.amountCents) : plan.priceLabel}
              </p>
              <p className="text-[11px] text-muted">
                {plan.billingInterval ? "/ month" : "forever"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
