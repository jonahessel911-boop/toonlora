"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import SignupLogo, {
  SignupAvatar,
  SignupBackButton,
  SignupFooterLink,
  SignupInput,
  SignupPageBackground,
  SignupStepIndicator,
  SignupSubmitButton,
} from "@/components/signup/SignupScreen";
import { sanitizeReturnTo } from "@/lib/reader/nextEpisodeGate";
import { apiFetch } from "@/lib/session";
import { useUserStore } from "@/store/useUserStore";

export default function RegisterPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = sanitizeReturnTo(searchParams.get("returnTo"));
  const { setProfile } = useUserStore();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 8 &&
    !submitting;

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
        }),
      });
      const data = await res.json();

      if (res.status === 503) {
        throw new Error(
          data.error ??
            "Database not configured. Create .env.local and visit /api/health/db to test."
        );
      }

      if (!res.ok) {
        throw new Error(data.error ?? "Could not save account to database.");
      }

      setProfile({
        fullName: fullName.trim(),
        email: email.trim(),
        onboarded: true,
        agreedToTerms: true,
      });
      router.push(returnTo ?? "/library");
    } catch (err) {
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError("Could not reach the server. Is npm run dev running?");
      } else {
        setError(
          err instanceof Error ? err.message : "Registration failed. Try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SignupPageBackground>
      <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-6 pb-8 pt-6 sm:px-8">
        <SignupBackButton />

        <div className="mt-2 flex justify-center">
          <SignupLogo />
        </div>

        <div className="mt-6 overflow-hidden rounded-[28px] border border-[#E7D8FF] bg-white p-6 shadow-[0_20px_60px_rgba(83,64,255,0.08)] sm:p-7">
          <h1 className="font-heading text-center text-xl font-extrabold text-[#2A114B] sm:text-2xl">
            Create account
          </h1>
          <p className="mt-1 text-center text-sm text-[#667085]">
            Save episodes, follow stories, and pick up where you left off.
          </p>

          <div className="mt-6">
            <SignupAvatar />
          </div>

          <form onSubmit={handleContinue} className="mt-6 space-y-4">
            <SignupInput
              type="text"
              label="Full name"
              placeholder="Your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />
            <SignupInput
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <SignupInput
              type="password"
              label="Password"
              placeholder="8+ characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />

            {error && (
              <p className="rounded-xl bg-[#FFF1F0] px-3 py-2 text-sm text-[#B42318] ring-1 ring-[#FECDCA]">
                {error}
              </p>
            )}

            <div className="pt-2">
              <SignupStepIndicator step={2} total={2} />
            </div>

            <SignupSubmitButton disabled={!canSubmit}>
              {submitting ? "Creating account…" : "Create account"}
            </SignupSubmitButton>
          </form>
        </div>

        <div className="mt-6">
          <SignupFooterLink />
        </div>

        <p className="mt-4 text-center text-xs text-[#667085]">
          Test your database:{" "}
          <a
            href="/api/health/db"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#5340FF] hover:underline"
          >
            /api/health/db
          </a>
        </p>
      </div>
    </SignupPageBackground>
  );
}
