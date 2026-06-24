"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CoverArt from "@/components/ui/CoverArt";
import SignupLogo, {
  SignupInput,
  SignupPageBackground,
  SignupStepIndicator,
} from "@/components/signup/SignupScreen";
import { SignupCtaButton } from "@/components/signup/SignupOnboardingUi";
import SignupNewsletterTopicCheckboxes from "@/components/signup/SignupNewsletterTopicCheckboxes";
import SignupWeeklyStoryBenefit from "@/components/signup/SignupWeeklyStoryBenefit";
import { trackSignUp, trackSignupFormView } from "@/lib/analytics/gtag";
import {
  deriveDisplayNameFromEmail,
  normalizeNewsletterTopics,
  type NewsletterTopic,
} from "@/lib/newsletter";
import { buildAuthHref } from "@/lib/reader/nextEpisodeGate";
import { getStoredAffiliateSlug, clearStoredAffiliateSlug, appendAffiliateToHref } from "@/lib/affiliate/client-tracking";
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

type FlowStep = 1 | 2 | 3;

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
  const [newsletterTopics, setNewsletterTopics] = useState<NewsletterTopic[]>(
    []
  );
  const [wantsWeeklyNewsletter, setWantsWeeklyNewsletter] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const affiliateSlug = useAffiliateSlug();
  const baseSigninHref =
    signinHrefProp ??
    (returnTo ? buildAuthHref("/signin", returnTo, affiliateSlug) : "/signin");
  const signinHref = appendAffiliateToHref(baseSigninHref, affiliateSlug);

  useEffect(() => {
    trackSignupFormView({
      formType,
      seriesId: storyContext?.storyId,
      storyTitle: storyContext?.storyTitle,
    });
  }, [formType, storyContext?.storyId, storyContext?.storyTitle]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordValid = password.length >= 8;
  const savedTopics = wantsWeeklyNewsletter
    ? normalizeNewsletterTopics(newsletterTopics)
    : [];

  const finishRedirect = () => {
    if (returnTo) {
      window.location.href = returnTo;
      return;
    }
    window.location.href = "/";
  };

  const saveProfile = (address: string, resolvedCountryCode = "") => {
    const fullName = deriveDisplayNameFromEmail(address);
    setProfile({
      fullName,
      email: address.trim(),
      countryCode: resolvedCountryCode,
      onboarded: true,
      agreedToTerms: true,
      wantsWeeklyNewsletter,
      newsletterTopics: savedTopics,
    });
    completeOnboarding();
  };

  const goBack = () => {
    setError(null);
    setStep((current) => (current > 1 ? ((current - 1) as FlowStep) : current));
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid) return;
    setError(null);
    setStep(2);
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid) return;
    setError(null);
    setStep(3);
  };

  const handleSignup = async () => {
    if (!emailValid || !passwordValid || submitting) return;

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

  return (
    <SignupPageBackground>
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-5 pb-10 pt-[max(12px,env(safe-area-inset-top))] sm:px-6">
        {backHref && step === 1 ? (
          <Link
            href={backHref}
            className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#E7D8FF] bg-white px-3 py-1.5 text-xs font-semibold text-[#5340FF] shadow-sm transition hover:bg-[#F3ECFF]"
          >
            <span aria-hidden>←</span>
            Back
          </Link>
        ) : step > 1 ? (
          <button
            type="button"
            onClick={goBack}
            className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#E7D8FF] bg-white px-3 py-1.5 text-xs font-semibold text-[#5340FF] shadow-sm transition hover:bg-[#F3ECFF]"
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
          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#5340FF] via-[#6B4FFF] to-[#7C3AED] p-3 shadow-[0_8px_28px_rgba(83,64,255,0.25)]">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 border-white/30 shadow-sm">
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
                    "from-[#5340FF] via-[#7C3AED] to-[#8B5CF6]"
                  }
                  genre={storyContext.genre ?? "Romance"}
                  title={storyContext.storyTitle}
                  showOverlay={false}
                  className="h-full w-full"
                />
              )}
            </div>
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-bold text-white">
                {storyContext.storyTitle}
              </p>
              <p className="text-xs font-semibold text-[#E7D8FF]">
                Chapter {storyContext.nextEpisode} awaits ✦
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex-1">
          {step === 1 ? (
            <div className="rounded-[28px] border border-[#E7D8FF] bg-white p-5 shadow-[0_20px_60px_rgba(83,64,255,0.08)] sm:p-7">
              <div className="text-center">
                <h1 className="font-heading text-2xl font-extrabold text-[#2A114B] sm:text-[1.75rem]">
                  Start reading for free
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-[#667085] sm:text-[15px]">
                  Save your progress, get personalized stories, and receive free
                  stories in your inbox.
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
                  <p className="rounded-xl bg-[#FFF1F0] px-3 py-2 text-sm text-[#B42318] ring-1 ring-[#FECDCA]">
                    {error}
                  </p>
                ) : null}

                <SignupStepIndicator step={1} total={3} />

                <SignupCtaButton type="submit" disabled={!emailValid}>
                  Continue
                </SignupCtaButton>
              </form>
            </div>
          ) : step === 2 ? (
            <div className="rounded-[28px] border border-[#E7D8FF] bg-white p-5 shadow-[0_20px_60px_rgba(83,64,255,0.08)] sm:p-7">
              <div className="text-center">
                <h1 className="font-heading text-xl font-extrabold text-[#2A114B] sm:text-2xl">
                  Almost there
                </h1>
                <p className="mt-2 text-sm text-[#667085]">
                  Choose a password to secure your account.
                </p>
              </div>

              <form onSubmit={handleStep2} className="mt-6 space-y-5">
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

                {error ? (
                  <p className="rounded-xl bg-[#FFF1F0] px-3 py-2 text-sm text-[#B42318] ring-1 ring-[#FECDCA]">
                    {error}
                  </p>
                ) : null}

                <SignupStepIndicator step={2} total={3} />

                <SignupCtaButton type="submit" disabled={!passwordValid}>
                  Continue
                </SignupCtaButton>
              </form>
            </div>
          ) : (
            <div className="rounded-[28px] border border-[#E7D8FF] bg-white p-5 shadow-[0_20px_60px_rgba(83,64,255,0.08)] sm:p-7">
              <div className="space-y-5">
                <SignupWeeklyStoryBenefit
                  selected={wantsWeeklyNewsletter}
                  onChange={setWantsWeeklyNewsletter}
                />

                <SignupNewsletterTopicCheckboxes
                  selected={newsletterTopics}
                  onChange={setNewsletterTopics}
                  disabled={!wantsWeeklyNewsletter}
                />

                {error ? (
                  <p className="rounded-xl bg-[#FFF1F0] px-3 py-2 text-sm text-[#B42318] ring-1 ring-[#FECDCA]">
                    {error}
                  </p>
                ) : null}

                <SignupStepIndicator step={3} total={3} />

                <SignupCtaButton
                  type="button"
                  disabled={submitting}
                  onClick={() => void handleSignup()}
                >
                  {submitting ? "Setting things up…" : "Continue reading"}
                </SignupCtaButton>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <p className="text-center text-sm text-[#667085]">
            Already have an account?{" "}
            <Link
              href={signinHref}
              className="font-bold text-[#5340FF] hover:text-[#2A114B]"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </SignupPageBackground>
  );
}
