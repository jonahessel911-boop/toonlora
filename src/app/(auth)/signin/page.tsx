"use client";

import Link from "next/link";
import SignupLogo, {
  SignupInput,
  SignupPageBackground,
  SignupPrimaryButton,
} from "@/components/signup/SignupScreen";

export default function SigninPage() {
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

            <form className="mt-6 space-y-4">
              <SignupInput
                type="email"
                label="Email"
                placeholder="you@example.com"
                autoComplete="email"
              />
              <SignupInput
                type="password"
                label="Password"
                placeholder="Your password"
                autoComplete="current-password"
              />
              <SignupPrimaryButton href="/library">Sign in</SignupPrimaryButton>
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
