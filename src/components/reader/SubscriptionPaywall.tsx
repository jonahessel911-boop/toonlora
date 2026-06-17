"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { loadStripe, type PaymentRequest } from "@stripe/stripe-js";
import {
  DEFAULT_SUBSCRIPTION_PLAN_ID,
  SUBSCRIPTION_PLANS,
  formatEur,
  type SubscriptionPlan,
} from "@/lib/payments/subscription-plans";
import { TOONLORA_READING_BENEFITS } from "@/lib/payments/reading-benefits";
import { apiFetch } from "@/lib/session";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";

interface SubscriptionPaywallProps {
  storyName: string;
  open: boolean;
  onClose: () => void;
  returnPath: string;
  coverArtUrl?: string;
  variant?: "modal" | "page";
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
}: SubscriptionPaywallProps) {
  const [selectedPlanId, setSelectedPlanId] = useState(DEFAULT_SUBSCRIPTION_PLAN_ID);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const { setSubscription } = useSubscriptionStore();
  const { mins, secs } = useCountdown(7 * 60 + 49);

  const selectedPlan =
    SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) ??
    SUBSCRIPTION_PLANS[2];

  const startCheckout = useCallback(async () => {
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
  }, [selectedPlanId, returnPath]);

  useEffect(() => {
    if (!open) return;

    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
    if (!publishableKey) return;

    let cancelled = false;
    let pr: PaymentRequest | null = null;

    async function setupApplePay() {
      const stripe = await loadStripe(publishableKey!);
      if (!stripe || cancelled) return;

      pr = stripe.paymentRequest({
        country: "NL",
        currency: "eur",
        total: {
          label: `Toonlora VIP — ${selectedPlan.label}`,
          amount: selectedPlan.amountCents,
        },
        requestPayerEmail: true,
      });

      const result = await pr.canMakePayment();
      if (cancelled) return;

      if (result?.applePay) {
        setPaymentRequest(pr);

        pr.on("paymentmethod", async (event) => {
          setLoading(true);
          setError("");
          try {
            const res = await apiFetch("/api/stripe/subscription-apple-pay", {
              method: "POST",
              body: JSON.stringify({
                planId: selectedPlanId,
                paymentMethodId: event.paymentMethod.id,
                email: event.payerEmail,
              }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Payment failed");

            setSubscription({
              status: "active",
              planId: data.planId,
              periodEnd: data.periodEnd,
            });
            event.complete("success");
            onClose();
          } catch (err) {
            event.complete("fail");
            setError(err instanceof Error ? err.message : "Payment failed");
          } finally {
            setLoading(false);
          }
        });
      } else {
        setPaymentRequest(null);
      }
    }

    void setupApplePay();

    return () => {
      cancelled = true;
      if (pr) {
        pr.off("paymentmethod");
      }
    };
  }, [open, selectedPlanId, selectedPlan.label, selectedPlan.amountCents, setSubscription, onClose]);

  useEffect(() => {
    if (!paymentRequest) return;
    paymentRequest.update({
      total: {
        label: `Toonlora VIP — ${selectedPlan.label}`,
        amount: selectedPlan.amountCents,
      },
    });
  }, [paymentRequest, selectedPlan]);

  const handleApplePay = () => {
    if (paymentRequest) {
      void paymentRequest.show();
      return;
    }
    void startCheckout();
  };

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

      <div className="flex-1 overflow-y-auto pb-36">
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
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={handleApplePay}
            className="flex h-14 flex-1 items-center justify-center rounded-2xl border border-[#E7D8FF]/25 bg-white transition hover:bg-white/90 disabled:opacity-60"
          >
            <ApplePayMark />
          </button>
          <span className="text-xs text-white/40">or</span>
          <button
            type="button"
            disabled={loading}
            onClick={() => void startCheckout()}
            className="btn-coral flex h-14 flex-[1.2] items-center justify-center rounded-2xl text-base font-extrabold disabled:opacity-60"
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

function ApplePayMark() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 165 64"
      className="h-7 w-auto"
      aria-label="Apple Pay"
    >
      <path
        fill="#000"
        d="M13.8 15.5c-.8 1-2.1 1.8-3.4 1.7-1.6-1.4-2.7-3.5-2.5-5.5 1.5-.1 3.1.8 4 1.9.8 1 1.5 2.6 1.9 3.9zm1.9 3.1c-2-.1-3.7 1.1-4.7 1.1-1 0-2.5-1.1-4.1-1.1-2.1 0-4 1.2-5.1 3.1-2.2 3.8-1.8 9.4.5 12.5 1.1 1.6 2.4 3.4 4.1 3.3 1.6-.1 2.2-1.1 4.2-1.1s2.5 1.1 4.2 1.1c1.7 0 2.8-1.5 3.9-3.1 1.2-1.8 1.7-3.5 1.7-3.6-.1 0-3.3-1.3-3.3-5 0-3.2 2.6-4.7 2.7-4.8-1.5-2.2-3.8-2.5-4.6-2.5zm11.2 1.1v23.4h3.6V33.1h5c4.7 0 8-3.2 8-7.7 0-4.6-3.2-7.8-7.8-7.8h-8.8zm3.6 3h4.3c3.2 0 5 1.7 5 4.8s-1.8 4.8-5 4.8h-4.3V22.7zm22.5 20.6c2.5 0 4.8-1.3 5.8-3.3h.1v3.1h3.4V28.4c0-3.9-3.1-6.4-7.9-6.4-4.4 0-7.7 2.5-7.8 6h3.3c.3-1.7 1.8-2.8 4.2-2.8 2.7 0 4.2 1.4 4.2 3.9v1.7l-5.5.3c-5.1.3-7.8 2.4-7.8 5.7 0 3.4 2.6 5.5 6.2 5.5zm.9-2.8c-2.3 0-3.8-1.1-3.8-2.9 0-1.8 1.5-2.9 4.3-3.1l4.9-.3v1.6c0 2.5-2.3 4.7-5.4 4.7zm15.1 9.1c3.6 0 5.3-1.4 6.8-5.7l6.5-18.2h-3.7l-4.4 14.4h-.1l-4.4-14.4h-3.8l6.2 17.2-.3 1.1c-.6 2-1.6 2.8-3.3 2.8-1 0-1.4-.1-2-.2v2.8c.7.1 1.4.2 2.3.2zm24.8-20.6v3.1h7.4v15.5h3.6V25.8h7.4v-3.1h-18.4zm29.5 20.9c4.5 0 7.5-2.3 7.5-5.7 0-2.9-2.1-4.6-5.9-5.2l-3.5-.5c-2.2-.3-3.2-1.1-3.2-2.5 0-1.6 1.5-2.7 3.7-2.7 2.2 0 3.7 1 4 2.8h3.4c-.2-2.9-2.7-4.9-7.3-4.9-4.2 0-7.2 2.2-7.2 5.5 0 2.8 2.1 4.5 5.7 5.1l3.5.5c2.4.4 3.4 1.2 3.4 2.6 0 1.7-1.6 2.8-4.1 2.8-2.7 0-4.4-1.2-4.7-3.3h-3.5c.2 3.4 3 5.5 7.7 5.5zm18.8 0c4.8 0 7.9-2.5 7.9-6.4v-14h-3.6v13.5c0 2.8-1.5 4.4-4.3 4.4-2.8 0-4.3-1.6-4.3-4.4V25.8h-3.6v14c0 3.9 3.1 6.4 7.9 6.4z"
      />
    </svg>
  );
}
