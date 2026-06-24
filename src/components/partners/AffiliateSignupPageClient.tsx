"use client";

import Link from "next/link";
import { useState } from "react";
import SignupLogo, {
  SignupInput,
  SignupPageBackground,
} from "@/components/signup/SignupScreen";
import { SignupCtaButton } from "@/components/signup/SignupOnboardingUi";

const SOURCE_OPTIONS = [
  { id: "meta", label: "Meta" },
  { id: "tiktok", label: "TikTok" },
  { id: "reddit", label: "Reddit" },
] as const;

export default function AffiliateSignupPageClient() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = emailValid && sources.length > 0 && !submitting;

  const toggleSource = (id: string) => {
    setSources((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/affiliate/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          company: company.trim() || undefined,
          description: description.trim() || undefined,
          sources,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SignupPageBackground>
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col px-4 pb-8 pt-6 sm:px-6 sm:pb-10 sm:pt-8">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#E7D8FF] bg-white px-3 py-1.5 text-xs font-semibold text-[#5340FF] shadow-sm"
        >
          ← Back
        </Link>

        <div className="mt-5 flex justify-center sm:mt-6">
          <SignupLogo />
        </div>

        <div className="mt-5 w-full rounded-[24px] border border-[#E7D8FF] bg-white p-4 shadow-[0_20px_60px_rgba(83,64,255,0.08)] sm:mt-6 sm:rounded-[28px] sm:p-7">
          {done ? (
            <div className="text-center">
              <p className="text-4xl">✉️</p>
              <h1 className="font-heading mt-4 text-xl font-extrabold text-[#2A114B]">
                You&apos;re on the list!
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-[#667085]">
                Check your inbox for the Earnings Kit with commission rates and
                estimated earnings per 1M views.
              </p>
              <div className="mt-6">
                <Link
                  href="/"
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#5340FF] px-6 text-sm font-bold text-white"
                >
                  Back to Toonlora
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-wide text-[#5340FF]">
                  Partners · Affiliate
                </p>
                <h1 className="font-heading mt-2 text-xl font-extrabold text-[#2A114B] sm:text-2xl">
                  Earn money for every signup
                </h1>
                <p className="mt-3 text-sm text-[#667085]">
                  Receive the <strong>Earnings Kit</strong> when you sign up
                  below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <SignupInput
                  type="email"
                  label="Email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <SignupInput
                  type="text"
                  label="Company (optional)"
                  placeholder="Your brand or company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />

                <div>
                  <p className="mb-2 px-1 text-xs font-bold text-[#667085]">
                    Sources
                  </p>
                  <div className="space-y-2">
                    {SOURCE_OPTIONS.map((source) => (
                      <label
                        key={source.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition ${
                          sources.includes(source.id)
                            ? "border-[#5340FF] bg-[#F3ECFF]"
                            : "border-[#E7D8FF] bg-white"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={sources.includes(source.id)}
                          onChange={() => toggleSource(source.id)}
                          className="h-4 w-4 rounded border-[#C4B5FD] text-[#5340FF]"
                        />
                        <span className="text-sm font-semibold text-[#2A114B]">
                          {source.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block px-1 text-xs font-bold text-[#667085]">
                    Short description (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Tell us about your audience or channels…"
                    className="w-full rounded-2xl border-2 border-[#E7D8FF] bg-white px-4 py-3.5 text-sm text-[#101828] outline-none transition placeholder:text-[#667085]/60 focus:border-[#5340FF] focus:ring-4 focus:ring-[#5340FF]/10"
                  />
                </div>

                {error ? (
                  <p className="rounded-xl bg-[#FFF1F0] px-3 py-2 text-sm text-[#B42318]">
                    {error}
                  </p>
                ) : null}

                <SignupCtaButton type="submit" disabled={!canSubmit}>
                  {submitting ? "Submitting…" : "Get Earnings Kit"}
                </SignupCtaButton>
              </form>
            </>
          )}
        </div>
      </div>
    </SignupPageBackground>
  );
}
