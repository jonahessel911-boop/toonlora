"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import OnboardingStepper, {
  OnboardingHeader,
} from "@/components/layout/OnboardingUI";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { useUserStore } from "@/store/useUserStore";

export default function RegisterForm() {
  const router = useRouter();
  const { fullName, email, wantsRecommendations, agreedToTerms, setProfile } =
    useUserStore();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const canContinue =
    fullName.trim() && email.trim() && password.length >= 8 && agreedToTerms;

  const handleContinue = () => {
    setProfile({ onboarded: true });
    router.push("/library");
  };

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-5 pb-8 pt-4">
      <OnboardingHeader title="Create account" backHref="/signup" />

      <div className="mt-6 flex flex-col items-center">
        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-groen-mint/60 blur-xl" />
          <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-violet-400 to-purple-700 shadow-lg">
            <span className="text-4xl">👩‍🎨</span>
          </div>
          <span className="absolute -right-1 -top-1 text-yellow-400">✦</span>
        </div>
      </div>

      <div className="mt-6 flex-1 space-y-4">
        <Field
          icon="👤"
          label="Full name"
          placeholder="Full name"
          hint="Enter your full name"
          value={fullName}
          onChange={(v) => setProfile({ fullName: v })}
        />
        <Field
          icon="✉️"
          label="Email"
          placeholder="Email"
          hint="Enter your email address"
          type="email"
          value={email}
          onChange={(v) => setProfile({ email: v })}
        />
        <div>
          <div className="flex items-center gap-3 rounded-2xl border-2 border-border bg-white px-4 py-3.5 focus-within:border-groen-primary">
            <span className="text-lg opacity-60">🔒</span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400"
              aria-label="Toggle password"
            >
              👁
            </button>
          </div>
          <p className="mt-1.5 px-1 text-xs text-gray-400">
            Use 8 or more characters with a mix of letters, numbers & symbols
          </p>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-groen-mint/50 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-groen-primary text-white">
              ⭐
            </span>
            <div>
              <p className="text-sm font-bold text-gray-800">
                I want story recommendations
              </p>
              <p className="text-xs text-gray-500">
                Get personalized story ideas and tips.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              setProfile({ wantsRecommendations: !wantsRecommendations })
            }
            className={`relative h-7 w-12 rounded-full transition ${
              wantsRecommendations ? "bg-groen-primary" : "bg-gray-200"
            }`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                wantsRecommendations ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </div>

        <label className="flex cursor-pointer items-start gap-3 px-1">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setProfile({ agreedToTerms: e.target.checked })}
            className="mt-1 h-4 w-4 rounded border-gray-300 accent-groen-primary"
          />
          <span className="text-sm text-gray-600">
            I agree to the{" "}
            <span className="font-bold text-groen-primary">Terms & Privacy</span>
          </span>
        </label>
      </div>

      <div className="mt-6 space-y-4">
        <OnboardingStepper step={2} total={2} />
        <PrimaryButton onClick={handleContinue} disabled={!canContinue}>
          Create account
        </PrimaryButton>
        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/signin" className="font-bold text-groen-primary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  icon,
  placeholder,
  hint,
  value,
  onChange,
  type = "text",
}: {
  icon: string;
  label: string;
  placeholder: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 rounded-2xl border-2 border-border bg-white px-4 py-3.5 focus-within:border-groen-primary">
        <span className="text-lg opacity-60">{icon}</span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none"
        />
      </div>
      <p className="mt-1.5 px-1 text-xs text-gray-400">{hint}</p>
    </div>
  );
}
