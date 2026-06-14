"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SignupLogo, {
  SignupHeroIllustration,
  SignupStepIndicator,
  SignupPrimaryButton,
  SignupFooterLink,
} from "@/components/signup/SignupScreen";

export default function RegisterPageClient() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || password.length < 8) return;
    router.push("/create");
  };

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-6 pb-8 pt-6">
      <Link
        href="/signup"
        className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 text-gray-600"
      >
        ←
      </Link>

      <h1 className="text-center text-lg font-bold text-gray-800">
        Create account
      </h1>

      <div className="mt-6 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-600 text-3xl shadow-lg">
          👩‍🎨
        </div>
      </div>

      <form onSubmit={handleContinue} className="mt-8 flex-1 space-y-4">
        <input
          type="text"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-2xl border-2 border-border px-4 py-3.5 text-sm outline-none focus:border-groen-primary"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-2xl border-2 border-border px-4 py-3.5 text-sm outline-none focus:border-groen-primary"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-2xl border-2 border-border px-4 py-3.5 text-sm outline-none focus:border-groen-primary"
        />

        <div className="pt-4">
          <SignupStepIndicator step={2} total={6} />
        </div>

        <button
          type="submit"
          className="mt-4 flex w-full items-center justify-between rounded-full bg-groen-primary py-4 pl-7 pr-2 font-bold text-white shadow-lg"
        >
          Continue
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-groen-primary">
            →
          </span>
        </button>
      </form>

      <SignupFooterLink />
    </div>
  );
}
