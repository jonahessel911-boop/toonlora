"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  DEFAULT_SUBSCRIPTION_PLAN_ID,
  SUBSCRIPTION_PLANS,
  formatEur,
  type SubscriptionPlan,
} from "@/lib/payments/subscription-plans";
import { TOONLORA_READING_BENEFITS } from "@/lib/payments/reading-benefits";
import { trackPaywallCheckoutClick, trackPaywallView } from "@/lib/analytics/gtag";
import { apiFetch } from "@/lib/session";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";

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

function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return { mins, secs };
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
  const { mins, secs } = useCountdown(7 * 60 + 49);
  const paywallViewTracked = useRef(false);

  const selectedPlan =
    SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) ??
    SUBSCRIPTION_PLANS[2];

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
  }, [selectedPlanId, returnPath, storyId]);

  if (!open) return null;

  const shellClass =
    variant === "page"
      ? "relative flex min-h-[100dvh] flex-col bg-[#08040F] text-white"
      : "fixed inset-0 z-[120] flex flex-col bg-[#08040F] text-white";

  return (
    <div className={shellClass}>
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#E7D8FF]/20 bg-[#2A114B]/60 text-lg text-white/80 backdrop-blur-sm transition hover:bg-[#5340FF]/40"
        aria-label="Close"
      >
        ×
      </button>

      <div className="flex-1 overflow-y-auto pb-28">
        {/* Promo bar */}
        <div className="border-b border-[#5340FF]/25 bg-[#12081F] px-4 py-2.5">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3 text-xs sm:text-sm">
            <p className="flex items-center gap-2 font-semibold text-[#E7D8FF]">
              <span aria-hidden>✦</span>
              Get up to{" "}
              <span className="text-white/40 line-through">40%</span>{" "}
              <span className="text-[#FF4FA3]">55% off</span> VIP
            </p>
            <p className="shrink-0 tabular-nums text-white/80">
              <span className="font-bold text-[#A78BFA]">{String(mins).padStart(2, "0")}</span>
              <span className="text-white/40">:</span>
              <span className="font-bold text-[#A78BFA]">{String(secs).padStart(2, "0")}</span>
            </p>
          </div>
        </div>

        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#2A114B] via-[#3D2BB8] to-[#5340FF] px-4 py-6">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.18), transparent 50%), radial-gradient(circle at 10% 90%, rgba(167,139,250,0.35), transparent 40%)",
            }}
            aria-hidden
          />
          <div className="relative mx-auto max-w-lg">
            <div className="flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="font-heading text-2xl font-extrabold leading-tight text-white sm:text-[1.65rem]">
                  Read {storyName}
                  <span className="block text-[#E7D8FF]">+ 2,000 other Toons</span>
                </h1>
                <ul className="mt-4 space-y-2.5">
                  {TOONLORA_READING_BENEFITS.map((benefit) => (
                    <li
                      key={benefit}
                      className="flex items-start gap-2.5 text-sm font-medium text-white/95"
                    >
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00DC64] text-[11px] font-extrabold text-[#0A3D1F]"
                        aria-hidden
                      >
                        ✓
                      </span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-white/25 shadow-[0_8px_32px_rgba(83,64,255,0.4)]">
                {coverArtUrl ? (
                  <img src={coverArtUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#5340FF] to-[#7C3AED] text-3xl">
                    ✦
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* VIP label */}
        <div className="px-4 pt-5">
          <div className="mx-auto max-w-lg">
            <div className="rounded-full border border-[#E7D8FF]/30 bg-[#12081F] p-1">
              <div className="font-heading rounded-full bg-gradient-to-r from-[#5340FF]/20 to-[#7C3AED]/20 py-2.5 text-center text-sm font-extrabold text-[#E7D8FF]">
                VIP Membership
              </div>
            </div>
          </div>
        </div>

        {/* Plans */}
        <div className="space-y-3 px-4 py-5">
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

        <p className="text-center text-sm text-[#A78BFA] underline decoration-[#5340FF]/40 underline-offset-4">
          30-day money-back guarantee
        </p>

        {error ? (
          <p className="mx-auto mt-4 max-w-lg rounded-2xl border border-[#FF4FA3]/30 bg-[#FF4FA3]/10 px-4 py-3 text-center text-sm text-[#FFB8D9]">
            {error}
          </p>
        ) : null}
      </div>

      {/* Sticky checkout */}
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-0 left-0 right-0 border-t border-[#5340FF]/20 bg-[#08040F]/95 px-4 py-4 backdrop-blur-md"
      >
        <div className="mx-auto max-w-lg">
          <button
            type="button"
            disabled={loading}
            onClick={() => void startCheckout()}
            className="btn-coral flex h-14 w-full items-center justify-center rounded-2xl text-base font-extrabold disabled:opacity-60"
          >
            {loading ? "Processing…" : "Continue"}
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
      className={`relative w-full rounded-[20px] border-2 p-4 text-left transition ${
        selected
          ? "border-[#5340FF] bg-[#1a1040] shadow-[0_4px_24px_rgba(83,64,255,0.25)]"
          : "border-[#2A114B] bg-[#12081F] hover:border-[#5340FF]/40"
      }`}
    >
      {plan.popular ? (
        <span className="font-heading absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#5340FF] px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-[0_4px_12px_rgba(83,64,255,0.4)]">
          Most popular
        </span>
      ) : null}
      {plan.bestValue ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#2A114B] px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[#E7D8FF]">
          Best value
        </span>
      ) : null}

      <div className="flex items-start gap-3">
        <span
          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
            selected ? "border-[#5340FF] bg-[#5340FF]" : "border-white/25"
          }`}
        >
          {selected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-heading text-lg font-extrabold text-white">{plan.label}</p>
              <p className="mt-0.5 text-sm text-white/55">
                <span className="line-through">{formatEur(plan.compareAtCents)}</span>{" "}
                <span className="font-semibold text-white">
                  {formatEur(plan.amountCents)}
                </span>
                {plan.savePercent >= 40 ? (
                  <span className="ml-1.5 rounded-full bg-[#FF4FA3] px-2 py-0.5 text-[10px] font-bold text-white">
                    Save {plan.savePercent}%
                  </span>
                ) : (
                  <span className="ml-1 text-white/45">/ Save {plan.savePercent}%</span>
                )}
              </p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-[#A78BFA]">
                {plan.accessLabel}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-heading text-xl font-extrabold text-[#E7D8FF]">
                {formatEur(plan.perWeekCents)}
              </p>
              <p className="text-[11px] text-white/45">/per week</p>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
