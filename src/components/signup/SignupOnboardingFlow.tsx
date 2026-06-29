"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CoverArt from "@/components/ui/CoverArt";
import SignupLogo, {
  SignupCheckbox,
  SignupInput,
  SignupPageBackground,
  SignupStepIndicator,
} from "@/components/signup/SignupScreen";
import { SignupCtaButton } from "@/components/signup/SignupOnboardingUi";
import { trackSignUp, trackSignupFormView } from "@/lib/analytics/gtag";
import {
  deriveDisplayNameFromEmail,
  type NewsletterTopic,
} from "@/lib/newsletter";
import { buildAuthHref } from "@/lib/reader/nextEpisodeGate";
import {
  getStoredAffiliateSlug,
  clearStoredAffiliateSlug,
} from "@/lib/affiliate/client-tracking";
import { useAffiliateSlug } from "@/lib/affiliate/useAffiliateSlug";
import { apiFetch } from "@/lib/session";
import { useUserStore } from "@/store/useUserStore";

export interface SignupStoryContext {
  storyId: string;
  storyTitle: string;
  nextEpisode: number;
  coverArtUrl?: string;
  coverGradient?: string;
  genre?: string;
}

interface SignupOnboardingFlowProps {
  formType: "register" | "reader_continue";
  returnTo?: string | null;
  signinHref?: string;
  backHref?: string;
  storyContext?: SignupStoryContext;
}

type FlowStep = 1 | 2;

const PAPER_CARD = "#FFFDF7";
const BORDER = "#E7DDCC";
const TEXT_DARK = "#0E1726";
const MUTED = "#64748B";

export default function SignupOnboardingFlow({
  formType,
  returnTo,
  signinHref: signinHrefProp,
  backHref,
  storyContext,
}: SignupOnboardingFlowProps) {
  const { setProfile, completeOnboarding } = useUserStore();
  const [step, setStep] = useState<FlowStep>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [wantsWeeklyNewsletter, setWantsWeeklyNewsletter] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const affiliateSlug = useAffiliateSlug();
  const signinHref =
    signinHrefProp ??
    (returnTo ? buildAuthHref("/signin", returnTo) : "/signin");

  useEffect(() => {
    trackSignupFormView({
      formType,
      seriesId: storyContext?.storyId,
      storyTitle: storyContext?.storyTitle,
    });
  }, [formType, storyContext?.storyId, storyContext?.storyTitle]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordValid = password.length >= 8;
  const canSubmit = emailValid && passwordValid && agreedToTerms && !submitting;
  const savedTopics: NewsletterTopic[] = wantsWeeklyNewsletter ? ["business"] : [];

  const finishRedirect = () => {
    window.location.href = returnTo || "/";
  };

  const saveProfile = (address: string, resolvedCountryCode = "") => {
    const fullName = deriveDisplayNameFromEmail(address);
    setProfile({
      fullName,
      email: address.trim(),
      countryCode: resolvedCountryCode,
      onboarded: true,
      agreedToTerms,
      wantsWeeklyNewsletter,
      newsletterTopics: savedTopics,
    });
    completeOnboarding();
  };

  const goBack = () => {
    setError(null);
    if (step > 1) setStep(1);
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid) return;
    setError(null);
    setStep(2);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    const trimmedEmail = email.trim();
    const fullName = deriveDisplayNameFromEmail(trimmedEmail);

    try {
      const affiliateSlug = getStoredAffiliateSlug();
      const res = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName,
          email: trimmedEmail,
          password,
          wantsWeeklyNewsletter,
          newsletterTopics: savedTopics,
          affiliateSlug,
        }),
      });
      const data = await res.json();

      if (res.status === 503) {
        if (formType === "register") {
          throw new Error(
            data.error ??
              "Database not configured. Create .env.local and visit /api/health/db to test."
          );
        }
        saveProfile(trimmedEmail);
        trackSignUp({ formType, seriesId: storyContext?.storyId });
        finishRedirect();
        return;
      }

      if (!res.ok) {
        throw new Error(data.error ?? "Could not create account.");
      }

      saveProfile(trimmedEmail, data.profile?.country_code ?? "");
      if (affiliateSlug) clearStoredAffiliateSlug();
      trackSignUp({ formType, seriesId: storyContext?.storyId });
      finishRedirect();
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

  return (
    <SignupPageBackground>
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-5 pb-10 pt-[max(12px,env(safe-area-inset-top))] sm:px-6">
        {backHref && step === 1 ? (
          <Link
            href={backHref}
            className="inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:bg-[#FFFDF7]"
            style={{ borderColor: BORDER, color: MUTED }}
          >
            <span aria-hidden>←</span>
            Back
          </Link>
        ) : step > 1 ? (
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

        {storyContext ? (
          <div
            className="mt-5 flex items-center gap-3 rounded-2xl p-3 shadow-[0_4px_20px_rgba(7,17,31,0.12)]"
            style={{ background: "#101827" }}
          >
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10">
              {storyContext.coverArtUrl ? (
                <img
                  src={storyContext.coverArtUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <CoverArt
                  gradient={
                    storyContext.coverGradient ??
                    "from-[#07111F] via-[#1e3a5f] to-[#2F80ED]"
                  }
                  genre={storyContext.genre ?? "Business"}
                  title={storyContext.storyTitle}
                  showOverlay={false}
                  className="h-full w-full"
                />
              )}
            </div>
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-bold text-[#F8FAFC]">
                {storyContext.storyTitle}
              </p>
              <p className="text-xs font-semibold text-[#AAB4C3]">
                Chapter {storyContext.nextEpisode} awaits
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex-1">
          {step === 1 ? (
            <div className={cardClass} style={{ background: PAPER_CARD, borderColor: BORDER }}>
              <div className="text-center">
                <h1
                  className="font-heading text-2xl font-extrabold sm:text-[1.75rem]"
                  style={{ color: TEXT_DARK }}
                >
                  Start reading for free
                </h1>
                <p className="mt-3 text-sm leading-relaxed sm:text-[15px]" style={{ color: MUTED }}>
                  Create your account to save progress and unlock weekly chapters.
                </p>
              </div>

              <form onSubmit={handleStep1} className="mt-6 space-y-5">
                <SignupInput
                  type="email"
                  label="Email address"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />

                {error ? (
                  <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
                    {error}
                  </p>
                ) : null}

                <SignupStepIndicator step={1} total={2} />

                <SignupCtaButton type="submit" disabled={!emailValid}>
                  Continue
                </SignupCtaButton>
              </form>
            </div>
          ) : (
            <div className={cardClass} style={{ background: PAPER_CARD, borderColor: BORDER }}>
              <div className="text-center">
                <h1
                  className="font-heading text-xl font-extrabold sm:text-2xl"
                  style={{ color: TEXT_DARK }}
                >
                  Almost there
                </h1>
                <p className="mt-2 text-sm" style={{ color: MUTED }}>
                  Choose a password and you&apos;re ready to read.
                </p>
              </div>

              <form onSubmit={(e) => void handleSignup(e)} className="mt-6 space-y-5">
                <SignupInput
                  type="password"
                  label="Password"
                  placeholder="8+ characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                />

                <div className="space-y-3">
                  <SignupCheckbox
                    checked={agreedToTerms}
                    onChange={setAgreedToTerms}
                    required
                    label={
                      <>
                        I accept the{" "}
                        <Link
                          href="/signup/register"
                          className="font-semibold text-[#2F80ED] hover:underline"
                        >
                          general terms &amp; conditions
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/signup/register"
                          className="font-semibold text-[#2F80ED] hover:underline"
                        >
                          privacy policy
                        </Link>
                      </>
                    }
                  />
                  <SignupCheckbox
                    checked={wantsWeeklyNewsletter}
                    onChange={setWantsWeeklyNewsletter}
                    label={
                      <>
                        I want to receive relevant business stories weekly for
                        free in my email{" "}
                        <span className="text-[#64748B]">(No spam!)</span>
                      </>
                    }
                  />
                </div>

                {error ? (
                  <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
                    {error}
                  </p>
                ) : null}

                <SignupStepIndicator step={2} total={2} />

                <SignupCtaButton type="submit" disabled={!canSubmit}>
                  {submitting ? "Setting things up…" : "Start reading"}
                </SignupCtaButton>
              </form>
            </div>
          )}
        </div>

        <div className="mt-6">
          <p className="text-center text-sm" style={{ color: MUTED }}>
            Already have an account?{" "}
            <Link
              href={signinHref}
              className="font-bold text-[#2F80ED] hover:text-[#1F6FD6]"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </SignupPageBackground>
  );
}
