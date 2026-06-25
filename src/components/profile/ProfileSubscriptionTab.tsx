"use client";

import Link from "next/link";
import { useState } from "react";
import CinematicStoryCover from "@/components/home/stream/CinematicStoryCover";
import type { RetentionStory } from "@/lib/profile/retentionStories";
import {
  ACHIEVER_PLAN,
  ENTREPRENEUR_PLAN,
  FREE_PLAN,
  getSubscriptionPlan,
} from "@/lib/payments/subscription-plans";
import { apiFetch } from "@/lib/session";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";

const PAPER_CARD = "#FFFDF7";
const BORDER = "#E7DDCC";
const TEXT_DARK = "#0E1726";
const MUTED = "#64748B";
const BLUE = "#2F80ED";

type CancelStep = "idle" | "choose" | "retention" | "confirm";

interface ProfileSubscriptionTabProps {
  hasPlus: boolean;
  tier: string;
  planId: string | null;
  periodEnd: string | null;
  retentionStories: RetentionStory[];
  onSubscriptionChange: () => void;
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

function planPriceLabel(tier: string, planId: string | null): string {
  if (tier === "free") return FREE_PLAN.priceLabel;
  const plan = planId ? getSubscriptionPlan(planId) : undefined;
  if (plan?.priceLabel) return plan.priceLabel;
  if (tier === "entrepreneur") return ENTREPRENEUR_PLAN.priceLabel;
  if (tier === "achiever") return ACHIEVER_PLAN.priceLabel;
  return FREE_PLAN.priceLabel;
}

function planBenefitSummary(tier: string): string {
  if (tier === "entrepreneur") {
    return "Unlimited access with early chapter releases.";
  }
  if (tier === "achiever") {
    return "Unlimited access to Toonlora Originals.";
  }
  return "Chapter 1 free on every story · 1 extra chapter per week.";
}

function planDisplayName(tier: string, planId: string | null): string {
  if (tier === "free") return "Free plan";
  if (tier === "entrepreneur") return "Entrepreneur plan";
  if (tier === "achiever") return "Plus plan";
  const plan = planId ? getSubscriptionPlan(planId) : undefined;
  return plan?.name ? `${plan.name} plan` : "Plus plan";
}

export default function ProfileSubscriptionTab({
  hasPlus,
  tier,
  planId,
  periodEnd,
  retentionStories,
  onSubscriptionChange,
}: ProfileSubscriptionTabProps) {
  const { setSubscription, status } = useSubscriptionStore();
  const [cancelStep, setCancelStep] = useState<CancelStep>("idle");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const nextPayment = formatDate(periodEnd);
  const planName = planDisplayName(tier, planId);
  const priceLabel = planPriceLabel(hasPlus ? tier : "free", planId);
  const isPaused = status === "paused";

  async function handlePause() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/subscription/pause", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not pause subscription");
      setSubscription({
        status: "paused",
        planId,
        periodEnd: data.resumesAt ?? periodEnd,
      });
      setMessage(
        "Your subscription is paused for 1 month. You keep access until billing resumes."
      );
      setCancelStep("idle");
      onSubscriptionChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ immediate: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not cancel subscription");
      setSubscription({
        status: data.active ? "active" : "cancelled",
        planId,
        periodEnd: data.periodEnd ?? periodEnd,
      });
      setMessage(
        data.status === "cancel_at_period_end" && nextPayment
          ? `Cancellation scheduled. You keep access until ${nextPayment}.`
          : nextPayment
            ? `Subscription cancelled. You keep access until ${nextPayment}.`
            : "Subscription cancelled."
      );
      setCancelStep("idle");
      onSubscriptionChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!hasPlus) {
    return (
      <div>
        <h2
          className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl"
          style={{ color: TEXT_DARK }}
        >
          Subscription
        </h2>

        <p className="mt-6 text-sm font-semibold" style={{ color: MUTED }}>
          Your membership
        </p>

        <div
          className="mt-3 overflow-hidden rounded-2xl"
          style={{ background: PAPER_CARD, border: `1px solid ${BORDER}` }}
        >
          <div className="p-5">
            <span
              className="inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
              style={{ background: "rgba(100,116,139,0.12)", color: MUTED }}
            >
              Current plan
            </span>
            <p
              className="mt-3 font-heading text-lg font-extrabold"
              style={{ color: TEXT_DARK }}
            >
              {planName}
            </p>
            <p
              className="mt-1 font-heading text-2xl font-extrabold"
              style={{ color: TEXT_DARK }}
            >
              {priceLabel}
              <span className="text-base font-semibold" style={{ color: MUTED }}>
                /month
              </span>
            </p>
            <p className="mt-2 text-sm" style={{ color: MUTED }}>
              {planBenefitSummary("free")}
            </p>
          </div>

          <div
            className="border-t px-5 py-4"
            style={{ borderColor: BORDER }}
          >
            <Link
              href="/subscribe"
              className="inline-flex h-[42px] w-full items-center justify-center rounded-full text-sm font-bold text-white sm:w-auto sm:px-6"
              style={{ background: BLUE }}
            >
              Upgrade
            </Link>
            <p className="mt-3 text-xs" style={{ color: MUTED }}>
              Plus from {ACHIEVER_PLAN.priceLabel}/month · Entrepreneur{" "}
              {ENTREPRENEUR_PLAN.priceLabel}/month
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (cancelStep === "choose") {
    return (
      <CancelFlowShell onBack={() => setCancelStep("idle")} title="Manage membership">
        <p className="text-sm" style={{ color: MUTED }}>
          Need a break? Pause billing for 1 month and keep reading, or cancel your
          plan.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <ActionRow
            label="Pause for 1 month"
            description="No charge for 30 days. Access continues."
            onClick={() => void handlePause()}
            disabled={loading}
          />
          <ActionRow
            label="Cancel membership"
            description="End your plan after this billing period."
            onClick={() => setCancelStep("retention")}
            disabled={loading}
          />
        </div>
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      </CancelFlowShell>
    );
  }

  if (cancelStep === "retention") {
    return (
      <CancelFlowShell
        onBack={() => setCancelStep("choose")}
        title="Did you already read these?"
      >
        <p className="text-sm" style={{ color: MUTED }}>
          Pick up a story you started — or one we think you&apos;ll love.
        </p>

        {retentionStories.length > 0 ? (
          <ul className="mt-5 flex flex-col gap-3">
            {retentionStories.map((story) => (
              <li key={story.seriesId}>
                <Link
                  href={story.href}
                  className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-[#F6F1E7]"
                  style={{ border: `1px solid ${BORDER}`, background: PAPER_CARD }}
                >
                  <div className="h-[72px] w-12 shrink-0 overflow-hidden rounded-lg">
                    <CinematicStoryCover
                      coverArtUrl={story.coverArtUrl}
                      title={story.title}
                      sagaLabel={story.sagaLabel}
                      className="h-full w-full"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate font-heading text-sm font-extrabold"
                      style={{ color: TEXT_DARK }}
                    >
                      {story.title}
                    </p>
                    <p className="truncate text-xs" style={{ color: MUTED }}>
                      {story.subtitle}
                    </p>
                    {story.chaptersRead > 0 ? (
                      <p
                        className="mt-0.5 text-[11px] font-semibold"
                        style={{ color: BLUE }}
                      >
                        {story.chaptersRead} chapter
                        {story.chaptersRead === 1 ? "" : "s"} read
                      </p>
                    ) : null}
                  </div>
                  <span className="text-xs font-bold" style={{ color: BLUE }}>
                    Read →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 text-sm" style={{ color: MUTED }}>
            Browse our founder stories and business originals on the homepage.
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setCancelStep("idle")}
            className="inline-flex h-[42px] flex-1 items-center justify-center rounded-full px-5 text-sm font-bold text-white"
            style={{ background: BLUE }}
          >
            Keep membership
          </button>
          <button
            type="button"
            onClick={() => setCancelStep("confirm")}
            className="inline-flex h-[42px] flex-1 items-center justify-center rounded-full border px-5 text-sm font-bold"
            style={{
              borderColor: BORDER,
              color: TEXT_DARK,
              background: PAPER_CARD,
            }}
          >
            Continue canceling
          </button>
        </div>
      </CancelFlowShell>
    );
  }

  if (cancelStep === "confirm") {
    return (
      <CancelFlowShell
        onBack={() => setCancelStep("retention")}
        title="Cancel subscription"
      >
        <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
          {nextPayment
            ? `Your plan stays active until ${nextPayment}. After that you'll lose unlimited access to Toonlora Originals.`
            : "You'll lose unlimited access to Toonlora Originals at the end of your billing period."}
        </p>
        <button
          type="button"
          onClick={() => void handleCancel()}
          disabled={loading}
          className="mt-6 inline-flex h-[42px] w-full items-center justify-center rounded-full border border-red-200 bg-red-50 px-5 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-60 sm:w-auto"
        >
          {loading ? "Cancelling…" : "Cancel subscription"}
        </button>
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      </CancelFlowShell>
    );
  }

  return (
    <div>
      <h2
        className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl"
        style={{ color: TEXT_DARK }}
      >
        Subscription
      </h2>

      {message ? (
        <p
          className="mt-4 rounded-xl px-4 py-3 text-sm"
          style={{ background: "rgba(47,128,237,0.08)", color: TEXT_DARK }}
        >
          {message}
        </p>
      ) : null}

      <p className="mt-6 text-sm font-semibold" style={{ color: MUTED }}>
        Your membership
      </p>

      <div
        className="mt-3 overflow-hidden rounded-2xl"
        style={{ background: PAPER_CARD, border: `1px solid ${BORDER}` }}
      >
        <div className="p-5">
          <span
            className="inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white"
            style={{
              background: isPaused
                ? MUTED
                : "linear-gradient(90deg, #2F80ED, #1F6FD6)",
            }}
          >
            {isPaused ? "Paused" : "Active"}
          </span>
          <p
            className="mt-3 font-heading text-lg font-extrabold"
            style={{ color: TEXT_DARK }}
          >
            {planName}
          </p>
          <p
            className="mt-1 font-heading text-2xl font-extrabold"
            style={{ color: TEXT_DARK }}
          >
            {priceLabel}
            <span className="text-base font-semibold" style={{ color: MUTED }}>
              /month
            </span>
          </p>
          {nextPayment ? (
            <p className="mt-1 text-sm" style={{ color: MUTED }}>
              {isPaused ? "Resumes billing" : "Next payment"}: {nextPayment}
            </p>
          ) : null}
          <p className="mt-2 text-sm" style={{ color: MUTED }}>
            {planBenefitSummary(tier)}
          </p>
        </div>

        {tier === "achiever" ? (
          <div
            className="border-t px-5 py-4"
            style={{ borderColor: BORDER }}
          >
            <Link
              href="/subscribe"
              className="inline-flex h-[42px] w-full items-center justify-center rounded-full text-sm font-bold text-white sm:w-auto sm:px-6"
              style={{ background: BLUE }}
            >
              Upgrade
            </Link>
            <p className="mt-2 text-xs" style={{ color: MUTED }}>
              Entrepreneur {ENTREPRENEUR_PLAN.priceLabel}/month · early access
            </p>
          </div>
        ) : null}

        <Link
          href="/subscribe"
          className="flex items-center justify-between border-t px-5 py-4 text-sm font-semibold transition hover:bg-[#F6F1E7]"
          style={{ borderColor: BORDER, color: TEXT_DARK }}
        >
          Change plan
          <span style={{ color: MUTED }}>›</span>
        </Link>

        <button
          type="button"
          onClick={() => {
            setError(null);
            setCancelStep("choose");
          }}
          className="flex w-full items-center justify-between border-t px-5 py-4 text-left text-sm font-semibold transition hover:bg-[#F6F1E7]"
          style={{ borderColor: BORDER, color: TEXT_DARK }}
        >
          Cancel membership
          <span style={{ color: MUTED }}>›</span>
        </button>
      </div>
    </div>
  );
}

function CancelFlowShell({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold transition hover:text-[#2F80ED]"
        style={{ color: MUTED }}
      >
        ← Back
      </button>
      <h2
        className="font-heading text-2xl font-extrabold tracking-tight"
        style={{ color: TEXT_DARK }}
      >
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function ActionRow({
  label,
  description,
  onClick,
  disabled,
}: {
  label: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-between rounded-xl px-4 py-4 text-left transition hover:bg-[#F6F1E7] disabled:opacity-60"
      style={{ background: PAPER_CARD, border: `1px solid ${BORDER}` }}
    >
      <div>
        <p className="text-sm font-semibold" style={{ color: TEXT_DARK }}>
          {label}
        </p>
        <p className="mt-0.5 text-xs" style={{ color: MUTED }}>
          {description}
        </p>
      </div>
      <span style={{ color: MUTED }}>›</span>
    </button>
  );
}
