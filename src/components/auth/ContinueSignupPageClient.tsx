"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CoverArt from "@/components/ui/CoverArt";
import SignupLogo, {
  SignupInput,
  SignupPageBackground,
  SignupSubmitButton,
} from "@/components/signup/SignupScreen";
import { fetchPublishedStory } from "@/lib/fetchPublishedStory";
import {
  buildAuthHref,
  buildPaywallPath,
  sanitizeReturnTo,
} from "@/lib/reader/nextEpisodeGate";
import { trackSignUp, trackSignupFormView } from "@/lib/analytics/gtag";
import { storyToSeriesDetail } from "@/lib/seriesCatalog";
import { apiFetch } from "@/lib/session";
import { useStoryStore } from "@/store/useStoryStore";
import { useUserStore } from "@/store/useUserStore";

export default function ContinueSignupPageClient() {
  const searchParams = useSearchParams();
  const storyId = searchParams.get("storyId") ?? "";
  const storyTitle = searchParams.get("storyTitle") ?? "this story";
  const nextEpisode = Math.max(2, Number(searchParams.get("ep") ?? 2) || 2);
  const returnTo =
    sanitizeReturnTo(searchParams.get("returnTo")) ??
    (storyId ? buildPaywallPath(storyId, nextEpisode, storyTitle) : null);
  const { getStoryById } = useStoryStore();
  const { setProfile, completeOnboarding } = useUserStore();
  const [coverArtUrl, setCoverArtUrl] = useState<string | undefined>();
  const [coverGradient, setCoverGradient] = useState(
    "from-[#5340FF] via-[#7C3AED] to-[#8B5CF6]"
  );
  const [genre, setGenre] = useState("Romance");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    trackSignupFormView({
      formType: "reader_continue",
      seriesId: storyId || undefined,
      storyTitle: storyTitle || undefined,
    });
  }, [storyId, storyTitle]);

  useEffect(() => {
    if (!storyId) return;

    const local = getStoryById(storyId);
    if (local) {
      const detail = storyToSeriesDetail(local);
      setCoverArtUrl(detail.coverArtUrl);
      setCoverGradient(local.coverGradient);
      setGenre(detail.genre);
      return;
    }

    let cancelled = false;
    void fetchPublishedStory(storyId).then((story) => {
      if (cancelled || !story) return;
      const detail = storyToSeriesDetail(story);
      setCoverArtUrl(detail.coverArtUrl);
      setCoverGradient(story.coverGradient);
      setGenre(detail.genre);
    });

    return () => {
      cancelled = true;
    };
  }, [storyId, getStoryById]);

  const redirectAfterSignup = () => {
    window.location.href = returnTo ?? "/library";
  };

  const saveLocalProfile = () => {
    setProfile({
      fullName: username.trim(),
      email: email.trim(),
      onboarded: true,
      agreedToTerms: true,
    });
    completeOnboarding();
  };

  const canSubmit =
    username.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 8 &&
    agreedToTerms &&
    !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName: username.trim(),
          email: email.trim(),
        }),
      });
      const data = await res.json();

      if (res.status === 503) {
        saveLocalProfile();
        trackSignUp({
          formType: "reader_continue",
          seriesId: storyId || undefined,
        });
        redirectAfterSignup();
        return;
      }

      if (!res.ok) {
        throw new Error(data.error ?? "Could not create account.");
      }

      saveLocalProfile();
      trackSignUp({
        formType: "reader_continue",
        seriesId: storyId || undefined,
      });
      redirectAfterSignup();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Registration failed. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const readerHref = storyId ? `/story/${storyId}/read` : "/";
  const signinHref = returnTo
    ? buildAuthHref("/signin", returnTo)
    : "/signin";

  return (
    <SignupPageBackground>
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-5 pb-10 pt-[max(12px,env(safe-area-inset-top))] sm:px-6">
        <Link
          href={readerHref}
          className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#E7D8FF] bg-white px-3 py-1.5 text-xs font-semibold text-[#5340FF] shadow-sm transition hover:bg-[#F3ECFF]"
        >
          <span aria-hidden>←</span>
          Back
        </Link>

        <div className="mt-4 flex justify-center">
          <SignupLogo />
        </div>

        <div className="mt-6 text-center">
          <h1 className="font-heading text-2xl font-extrabold text-[#2A114B] sm:text-[1.75rem]">
            Create account
          </h1>
          <p className="mt-2 text-sm text-[#667085]">
            Continue{" "}
            <span className="font-bold text-[#5340FF]">{storyTitle}</span>
            {" · "}Episode {nextEpisode}
          </p>
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#5340FF] via-[#6B4FFF] to-[#7C3AED] p-3 shadow-[0_8px_28px_rgba(83,64,255,0.25)]">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 border-white/30 shadow-sm">
            {coverArtUrl ? (
              <img
                src={coverArtUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <CoverArt
                gradient={coverGradient}
                genre={genre}
                title={storyTitle}
                showOverlay={false}
                className="h-full w-full"
              />
            )}
          </div>
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-bold text-white">{storyTitle}</p>
            <p className="text-xs font-semibold text-[#E7D8FF]">
              Episode {nextEpisode} awaits ✦
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 rounded-[28px] border border-[#E7D8FF] bg-white p-5 shadow-[0_20px_60px_rgba(83,64,255,0.08)] sm:p-6"
        >
          <SignupInput
            type="text"
            label="Username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
          <SignupInput
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
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

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#E7D8FF] bg-[#FCFAFF] px-4 py-3">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#C4B5FD] text-[#5340FF] focus:ring-[#5340FF]"
            />
            <span className="text-sm leading-snug text-[#667085]">
              I accept the{" "}
              <span className="font-semibold text-[#5340FF]">
                general terms and conditions
              </span>
            </span>
          </label>

          {error ? (
            <p className="rounded-xl bg-[#FFF1F0] px-3 py-2 text-sm text-[#B42318] ring-1 ring-[#FECDCA]">
              {error}
            </p>
          ) : null}

          <SignupSubmitButton disabled={!canSubmit}>
            {submitting ? "Creating account…" : "Continue"}
          </SignupSubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-[#667085]">
          Already have an account?{" "}
          <Link
            href={signinHref}
            className="font-bold text-[#5340FF] hover:text-[#2A114B]"
          >
            Sign in
          </Link>
        </p>
      </div>
    </SignupPageBackground>
  );
}
