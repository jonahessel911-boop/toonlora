"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import SignupLogo, {
  SignupInput,
  SignupPageBackground,
  SignupSubmitButton,
} from "@/components/signup/SignupScreen";
import { sanitizeReturnTo } from "@/lib/reader/nextEpisodeGate";
import { trackLogin, trackSignupFormView } from "@/lib/analytics/gtag";
import { apiFetch } from "@/lib/session";
import { useUserStore } from "@/store/useUserStore";

export default function SigninPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = sanitizeReturnTo(searchParams.get("returnTo"));
  const { setProfile, completeOnboarding } = useUserStore();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    trackSignupFormView({ formType: "signin" });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Sign in failed.");
        return;
      }

      setProfile({
        email: data.profile.email,
        fullName: data.profile.fullName,
        wantsRecommendations: data.profile.wantsRecommendations,
        agreedToTerms: true,
        onboarded: true,
      });
      completeOnboarding();
      trackLogin();
      router.push(returnTo ?? "/library");
    } catch {
      setError("Could not sign in. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SignupPageBackground>
      <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-6 pb-8 pt-10 sm:px-8">
        <SignupLogo />

        <div className="mt-8 flex-1">
          <div className="overflow-hidden rounded-[28px] border border-[#E7D8FF] bg-white p-6 shadow-[0_20px_60px_rgba(83,64,255,0.08)] sm:p-7">
            <h2 className="font-heading text-2xl font-extrabold text-[#2A114B]">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-[#667085]">
              Sign in to continue your stories and saved episodes.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <SignupInput
                type="email"
                label="Email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <SignupInput
                type="password"
                label="Password"
                placeholder="Your password"
                autoComplete="current-password"
              />
              {error ? (
                <p className="text-sm font-medium text-[#D92D20]">{error}</p>
              ) : null}
              <SignupSubmitButton disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </SignupSubmitButton>
            </form>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-[#667085]">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-bold text-[#5340FF] hover:text-[#2A114B]"
          >
            Create account
          </Link>
        </p>
      </div>
    </SignupPageBackground>
  );
}
