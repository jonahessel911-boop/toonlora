"use client";

import Link from "next/link";
import ToonloraLogo from "@/components/ui/ToonloraLogo";

interface OnboardingStepperProps {
  step: number;
  total?: number;
  variant?: "dots" | "numbers";
}

export default function OnboardingStepper({
  step,
  total = 6,
  variant = "numbers",
}: OnboardingStepperProps) {
  if (variant === "dots") {
    return (
      <div className="flex items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`rounded-full ${
                i === step - 1
                  ? "h-2.5 w-2.5 bg-groen-primary"
                  : "h-2 w-2 bg-gray-200"
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-semibold text-groen-primary">
          Step {step} of {total}
        </span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-1">
        {Array.from({ length: total }).map((_, i) => {
          const n = i + 1;
          const done = n < step;
          const active = n === step;
          return (
            <div key={n} className="flex flex-1 flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                  done
                    ? "bg-groen-primary text-white"
                    : active
                      ? "border-2 border-groen-primary bg-white text-groen-deep ring-4 ring-groen-primary/20"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2 7L5.5 10.5L12 3"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  n
                )}
              </div>
              {i < total - 1 && (
                <div
                  className={`absolute hidden h-0.5 w-full ${done ? "bg-groen-primary" : "bg-gray-200"}`}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs font-semibold text-groen-primary">
        ✦ Step {step} of {total} ✦
      </p>
    </div>
  );
}

interface OnboardingHeaderProps {
  title: string;
  backHref?: string;
  badge?: string;
}

export function OnboardingHeader({
  title,
  backHref = "/signup",
  badge,
}: OnboardingHeaderProps) {
  return (
    <header className="relative flex items-center justify-center py-2">
      <Link
        href={backHref}
        className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white text-gray-600 shadow-sm"
        aria-label="Go back"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M11 4L6 9L11 14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </Link>
      <h1 className="text-lg font-bold text-gray-800">{title}</h1>
      {badge && (
        <span className="absolute right-0 rounded-full bg-groen-mint px-3 py-1 text-[10px] font-bold text-groen-deep">
          {badge}
        </span>
      )}
    </header>
  );
}

export function SignupLogo({ compact }: { compact?: boolean }) {
  return (
    <div className={`relative flex flex-col items-center ${compact ? "pt-0" : "pt-2"}`}>
      {!compact && (
        <>
          <span className="absolute left-[18%] top-0 text-accent-yellow">✦</span>
          <span className="absolute right-[20%] top-2 text-sm text-accent-yellow opacity-70">
            ✦
          </span>
        </>
      )}
      <ToonloraLogo variant="full" iconSize={compact ? 28 : 40} />
    </div>
  );
}
