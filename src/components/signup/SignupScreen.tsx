import Link from "next/link";
import type { InputHTMLAttributes, ReactNode } from "react";
import ToonloraLogo from "@/components/ui/ToonloraLogo";

function Sparkle({ className }: { className?: string }) {
  return (
    <span className={`text-[#FFE033] ${className}`} aria-hidden>
      ✦
    </span>
  );
}

/** Lavender ambient background for auth pages */
export function SignupPageBackground({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[100dvh] bg-[#FCFAFF]">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#F3ECFF]/70 via-[#FCFAFF] to-[#FCFAFF]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 top-20 h-56 w-56 rounded-full bg-[#5340FF]/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-12 top-1/3 h-48 w-48 rounded-full bg-[#FF4FA3]/8 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-20 left-1/4 h-40 w-40 rounded-full bg-[#22D3EE]/8 blur-3xl"
        aria-hidden
      />
      <div className="relative">{children}</div>
    </div>
  );
}

export function SignupBackButton({ href = "/signup" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-[#E7D8FF] bg-white text-[#5340FF] shadow-sm transition hover:bg-[#F3ECFF]"
      aria-label="Go back"
    >
      ←
    </Link>
  );
}

export default function SignupLogo() {
  return (
    <div className="relative flex flex-col items-center pt-2">
      <Sparkle className="absolute left-[18%] top-0 text-sm" />
      <Sparkle className="absolute right-[20%] top-3 text-xs opacity-80" />
      <Sparkle className="absolute left-[28%] top-8 text-xs opacity-60" />
      <ToonloraLogo variant="full" iconSize={44} />
    </div>
  );
}

export function SignupHeroIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-[340px] px-2">
      <div className="absolute -inset-x-2 top-6 bottom-0 overflow-hidden rounded-[2.5rem]">
        <div className="absolute -left-10 top-10 h-44 w-44 rounded-full bg-[#5340FF]/15 blur-2xl" />
        <div className="absolute -right-8 top-20 h-40 w-40 rounded-full bg-[#FF4FA3]/12 blur-2xl" />
        <div className="absolute bottom-0 left-1/2 h-28 w-[130%] -translate-x-1/2 rounded-t-[50%] bg-gradient-to-b from-[#F3ECFF] to-[#E9D8FD]/40" />
      </div>

      <div className="relative mx-auto h-[220px] w-[280px] sm:h-[240px] sm:w-[300px]">
        <div className="absolute left-0 top-6 z-10 w-[72px] rotate-[-8deg] overflow-hidden rounded-xl border-[3px] border-white bg-gradient-to-br from-[#FFE033] to-[#FF4FA3] shadow-md">
          <div className="flex aspect-square items-center justify-center text-3xl">
            🐱
          </div>
        </div>

        <div className="absolute left-[72px] top-0 z-20 w-[80px] rotate-[4deg] overflow-hidden rounded-xl border-[3px] border-white bg-gradient-to-br from-[#5340FF] to-[#7C3AED] shadow-md">
          <div className="flex aspect-[4/5] items-center justify-center text-2xl">
            ✨
          </div>
        </div>

        <div className="absolute right-0 top-4 z-10 w-[68px] rotate-[6deg] overflow-hidden rounded-xl border-[3px] border-white bg-white shadow-md">
          <div className="grid aspect-square grid-cols-2 gap-0.5 p-1.5">
            {["#5340FF", "#FF6847", "#22D3EE", "#FFE033"].map((c) => (
              <div
                key={c}
                className="rounded-sm"
                style={{ background: `linear-gradient(135deg, ${c}, ${c}88)` }}
              />
            ))}
          </div>
        </div>

        <div className="absolute left-1/2 top-[52px] z-30 w-[110px] -translate-x-1/2">
          <div className="overflow-hidden rounded-2xl border-[3px] border-white bg-gradient-to-b from-[#5340FF] to-[#2A114B] shadow-xl">
            <div className="flex aspect-[3/4] flex-col items-center justify-end pb-3 pt-4">
              <div className="mb-1 h-10 w-10 rounded-full bg-[#E9D8FD]/80" />
              <div className="h-14 w-16 rounded-t-2xl bg-[#2A114B]/90" />
              <div className="mt-1 text-lg">✏️</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-2 left-2 z-10 w-[70px] rotate-[-5deg] overflow-hidden rounded-xl border-[3px] border-white bg-gradient-to-br from-[#FF6847] to-[#FFE033] shadow-md">
          <div className="flex aspect-square items-center justify-center text-3xl">
            🐻
          </div>
        </div>

        <div className="absolute bottom-0 right-2 z-10 w-[74px] rotate-[8deg] overflow-hidden rounded-xl border-[3px] border-white bg-gradient-to-br from-[#22D3EE] to-[#5340FF] shadow-md">
          <div className="flex aspect-[4/5] items-center justify-center text-3xl">
            💫
          </div>
        </div>
      </div>
    </div>
  );
}

interface SignupStepProps {
  step?: number;
  total?: number;
}

export function SignupStepIndicator({ step = 1, total = 2 }: SignupStepProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="flex items-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`rounded-full transition-all ${
              i === step - 1
                ? "h-2.5 w-6 bg-[#5340FF]"
                : i < step - 1
                  ? "h-2 w-2 bg-[#7C3AED]/50"
                  : "h-2 w-2 bg-[#E7D8FF]"
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-bold text-[#5340FF]">
        Step {step} of {total}
      </span>
    </div>
  );
}

export function SignupInput({
  label,
  labelClassName,
  tone = "light",
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  labelClassName?: string;
  tone?: "light" | "dark";
}) {
  const inputClass =
    tone === "dark"
      ? "w-full rounded-2xl border-2 border-[#5340FF]/30 bg-[#1a1040] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#5340FF] focus:bg-[#1a1040] focus:ring-4 focus:ring-[#5340FF]/20"
      : "w-full rounded-2xl border-2 border-[#E7D8FF] bg-white px-4 py-3.5 text-sm text-[#101828] outline-none transition placeholder:text-[#667085]/60 focus:border-[#5340FF] focus:bg-[#FCFAFF] focus:ring-4 focus:ring-[#5340FF]/10";

  return (
    <div>
      {label && (
        <label
          className={`mb-1.5 block px-1 text-xs font-bold text-[#667085] ${labelClassName ?? ""}`}
        >
          {label}
        </label>
      )}
      <input {...props} className={`${inputClass} ${className ?? ""}`} />
    </div>
  );
}

export function SignupSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Select…",
  required,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { code: string; name: string }[];
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      {label ? (
        <label className="mb-1.5 block px-1 text-xs font-bold text-[#667085]">
          {label}
        </label>
      ) : null}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full appearance-none rounded-2xl border-2 border-[#E7D8FF] bg-white bg-[length:16px] bg-[right_1rem_center] bg-no-repeat px-4 py-3.5 text-sm text-[#101828] outline-none transition focus:border-[#5340FF] focus:bg-[#FCFAFF] focus:ring-4 focus:ring-[#5340FF]/10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 24 24' stroke='%23667085'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        }}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.code} value={option.code}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}

interface SignupPrimaryButtonProps {
  href: string;
  children: ReactNode;
}

export function SignupPrimaryButton({ href, children }: SignupPrimaryButtonProps) {
  return (
    <Link
      href={href}
      className="btn-coral group flex w-full items-center justify-between py-4 pl-7 pr-2 transition active:scale-[0.99]"
    >
      <span className="text-base font-extrabold text-white">{children}</span>
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/95 shadow-sm">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
          <path
            d="M4 9H14M14 9L10 5M14 9L10 13"
            stroke="#5340FF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Link>
  );
}

export function SignupSubmitButton({
  children,
  disabled,
}: {
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="btn-coral group flex w-full items-center justify-between py-4 pl-7 pr-2 transition active:scale-[0.99] disabled:opacity-50"
    >
      <span className="text-base font-extrabold text-white">{children}</span>
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/95 shadow-sm">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
          <path
            d="M4 9H14M14 9L10 5M14 9L10 13"
            stroke="#5340FF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
}

export function SignupFooterLink() {
  return (
    <p className="text-center text-sm text-[#667085]">
      Already have an account?{" "}
      <Link
        href="/signin"
        className="font-bold text-[#5340FF] hover:text-[#2A114B]"
      >
        Sign in
      </Link>
    </p>
  );
}

export function SignupAvatar() {
  return (
    <div className="relative mx-auto flex justify-center">
      <div
        className="pointer-events-none absolute -inset-3 rounded-full bg-[#5340FF]/15 blur-xl"
        aria-hidden
      />
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-[#5340FF] to-[#7C3AED] text-3xl shadow-[0_12px_32px_rgba(83,64,255,0.3)] ring-2 ring-[#E7D8FF]">
        👩‍🎨
      </div>
      <span className="absolute -right-1 top-0 text-sm text-[#FFE033]">✦</span>
    </div>
  );
}
