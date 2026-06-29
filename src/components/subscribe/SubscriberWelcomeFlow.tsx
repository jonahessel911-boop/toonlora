"use client";

import { useEffect, useRef, useState } from "react";
import SignupLogo, {
  SignupInput,
  SignupPageBackground,
  SignupStepIndicator,
} from "@/components/signup/SignupScreen";
import {
  SignupCtaButton,
  SignupSuccessState,
} from "@/components/signup/SignupOnboardingUi";
import { deriveDisplayNameFromEmail } from "@/lib/newsletter";
import { trackSubscribe } from "@/lib/analytics/gtag";
import { getSubscriptionPlan } from "@/lib/payments/subscription-plans";
import { apiFetch } from "@/lib/session";
import { useUserStore } from "@/store/useUserStore";

type FlowStep = "welcome" | "email" | "password" | "done";

const PAPER_CARD = "#FFFDF7";
const BORDER = "#E7DDCC";
const TEXT_DARK = "#0E1726";
const MUTED = "#64748B";

interface SubscriberWelcomeFlowProps {
  subscriptionId: string | null;
}

export default function SubscriberWelcomeFlow({
  subscriptionId,
}: SubscriberWelcomeFlowProps) {
  const { setProfile, completeOnboarding } = useUserStore();
  const [step, setStep] = useState<FlowStep>("welcome");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [subscriptionReady, setSubscriptionReady] = useState(false);
  const subscribeTrackedRef = useRef(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordValid = password.length >= 8;
  const stepNumber = step === "welcome" ? 0 : step === "email" ? 1 : step === "password" ? 2 : 3;

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        if (subscriptionId) {
          const res = await apiFetch("/api/stripe/subscription-activate", {
            method: "POST",
            body: JSON.stringify({
              subscriptionId,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(
              typeof data.error === "string"
                ? data.error
                : "Could not verify subscription"
            );
          }
          if (data.status !== "active" && data.status !== "trialing") {
            throw new Error("Subscription is not active yet. Please wait a moment.");
          }
        } else {
          const res = await apiFetch("/api/subscription/status");
          const data = await res.json();
          if (!res.ok || !data.active) {
            throw new Error("No active subscription found.");
          }
        }

        if (!cancelled) setSubscriptionReady(true);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not verify your membership."
          );
        }
      } finally {
        if (!cancelled) setVerifying(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [subscriptionId]);

  useEffect(() => {
    if (!subscriptionReady || subscribeTrackedRef.current) return;
    subscribeTrackedRef.current = true;
    const planId =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("planId") ?? undefined
        : undefined;
    const plan = planId ? getSubscriptionPlan(planId) : undefined;
    trackSubscribe({
      planId: plan?.id,
      planName: plan?.name,
      valueCents: plan?.amountCents,
      subscriptionId: subscriptionId ?? undefined,
    });
  }, [subscriptionReady, subscriptionId]);

  const saveProfile = (address: string, fullName: string, countryCode = "") => {
    setProfile({
      fullName,
      email: address.trim(),
      countryCode,
      onboarded: true,
      agreedToTerms: true,
      wantsWeeklyNewsletter: false,
      newsletterTopics: [],
    });
    completeOnboarding();
  };

  const goBack = () => {
    setError(null);
    if (step === "password") setStep("email");
    else if (step === "email") setStep("welcome");
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid || !passwordValid || submitting) return;

    setSubmitting(true);
    setError(null);
    const trimmedEmail = email.trim();
    const fullName = deriveDisplayNameFromEmail(trimmedEmail);

    try {
      const res = await apiFetch("/api/auth/register-subscriber", {
        method: "POST",
        body: JSON.stringify({
          email: trimmedEmail,
          password,
          subscriptionId,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Could not create account.");
      }

      saveProfile(
        trimmedEmail,
        data.profile?.fullName ?? fullName,
        data.profile?.countryCode ?? ""
      );
      setStep("done");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Registration failed. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const cardClass =
    "rounded-[20px] border p-5 sm:p-7 shadow-[0_4px_24px_rgba(14,23,38,0.06)]";

  if (verifying) {
    return (
      <SignupPageBackground>
        <div className="flex min-h-[100dvh] items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#E7D8FF] border-t-[#5340FF]" />
            <p className="text-sm font-medium" style={{ color: MUTED }}>
              Activating your membership…
            </p>
          </div>
        </div>
      </SignupPageBackground>
    );
  }

  if (!subscriptionReady) {
    return (
      <SignupPageBackground>
        <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center px-6 text-center">
          <SignupLogo />
          <p className="mt-6 text-base font-semibold" style={{ color: TEXT_DARK }}>
            {error ?? "We could not verify your subscription."}
          </p>
          <a
            href="/subscribe"
            className="mt-6 text-sm font-bold text-[#2F80ED] underline"
          >
            Return to membership
          </a>
        </div>
      </SignupPageBackground>
    );
  }

  if (step === "done") {
    return (
      <SignupPageBackground>
        <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-5 pb-10 pt-[max(12px,env(safe-area-inset-top))] sm:px-6">
          <div className="mt-8 flex justify-center">
            <SignupLogo />
          </div>
          <div
            className={`${cardClass} mt-8`}
            style={{ background: PAPER_CARD, borderColor: BORDER }}
          >
            <SignupSuccessState
              continueLabel="Start reading"
              onContinue={() => {
                window.location.href = "/";
              }}
            />
            <p
              className="mt-4 text-center text-sm font-semibold"
              style={{ color: TEXT_DARK }}
            >
              Your account is officially created. Welcome to Toonlora.
            </p>
          </div>
        </div>
      </SignupPageBackground>
    );
  }

  return (
    <SignupPageBackground>
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-5 pb-10 pt-[max(12px,env(safe-area-inset-top))] sm:px-6">
        {step !== "welcome" ? (
          <button
            type="button"
            onClick={goBack}
            className="inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:bg-[#FFFDF7]"
            style={{ borderColor: BORDER, color: MUTED }}
          >
            <span aria-hidden>←</span>
            Back
          </button>
        ) : (
          <span className="h-8" />
        )}

        <div className="mt-4 flex justify-center">
          <SignupLogo />
        </div>

        {step !== "welcome" ? (
          <div className="mt-5">
            <SignupStepIndicator step={stepNumber} total={2} />
          </div>
        ) : null}

        <div
          className={`${cardClass} mt-6`}
          style={{ background: PAPER_CARD, borderColor: BORDER }}
        >
          {step === "welcome" ? (
            <div className="text-center">
              <p
                className="text-xs font-bold uppercase tracking-[0.12em]"
                style={{ color: "#2F80ED" }}
              >
                Membership active
              </p>
              <h1
                className="mt-3 font-heading text-2xl font-extrabold leading-tight sm:text-[1.65rem]"
                style={{ color: TEXT_DARK }}
              >
                Thanks! You are officially one of the 300,000 Toonlora daily readers.
              </h1>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: MUTED }}>
                Your membership is live. Create your account so you can sign in on any
                device and pick up where you left off.
              </p>
              <div className="mt-6">
                <SignupCtaButton onClick={() => setStep("email")}>
                  Continue
                </SignupCtaButton>
              </div>
            </div>
          ) : null}

          {step === "email" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!emailValid) return;
                setError(null);
                setStep("password");
              }}
            >
              <h1
                className="font-heading text-xl font-extrabold sm:text-2xl"
                style={{ color: TEXT_DARK }}
              >
                To continue, fill in your email
              </h1>
              <p className="mt-2 text-sm" style={{ color: MUTED }}>
                We will use this for your login and membership receipts.
              </p>
              <div className="mt-5">
                <SignupInput
                  label="Email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              {error ? (
                <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
              ) : null}
              <div className="mt-6">
                <SignupCtaButton type="submit" disabled={!emailValid}>
                  Continue
                </SignupCtaButton>
              </div>
            </form>
          ) : null}

          {step === "password" ? (
            <form onSubmit={handleCreateAccount}>
              <h1
                className="font-heading text-xl font-extrabold sm:text-2xl"
                style={{ color: TEXT_DARK }}
              >
                Choose a password
              </h1>
              <p className="mt-2 text-sm" style={{ color: MUTED }}>
                At least 8 characters. You will use this with your email to sign in.
              </p>
              <div className="mt-5">
                <SignupInput
                  label="Password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
              {error ? (
                <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
              ) : null}
              <div className="mt-6">
                <SignupCtaButton
                  type="submit"
                  disabled={!passwordValid || submitting}
                >
                  {submitting ? "Creating account…" : "Create my account"}
                </SignupCtaButton>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </SignupPageBackground>
  );
}
