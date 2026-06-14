"use client";

import Link from "next/link";
import SignupLogo, { SignupPrimaryButton } from "@/components/signup/SignupScreen";

export default function SigninPage() {
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-6 pb-8 pt-10 sm:px-8">
      <SignupLogo />
      <div className="mt-10 flex-1">
        <h2 className="text-2xl font-black text-gray-800">Welcome back</h2>
        <p className="mt-2 text-sm text-gray-400">
          Sign in to continue your stories.
        </p>
        <form className="mt-8 space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-2xl border-2 border-border bg-groen-mint/30 px-4 py-3.5 text-sm outline-none focus:border-groen-primary focus:bg-white"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-2xl border-2 border-border bg-groen-mint/30 px-4 py-3.5 text-sm outline-none focus:border-groen-primary focus:bg-white"
          />
          <SignupPrimaryButton href="/library">Sign in</SignupPrimaryButton>
        </form>
      </div>
      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-bold text-groen-primary">
          Create account
        </Link>
      </p>
    </div>
  );
}
