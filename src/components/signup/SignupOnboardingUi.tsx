"use client";

import type { ReactNode } from "react";

export function SignupCtaButton({
  children,
  disabled,
  type = "button",
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="group flex h-14 w-full items-center justify-center rounded-full bg-[#2F80ED] px-6 shadow-[0_4px_16px_rgba(47,128,237,0.28)] transition hover:bg-[#1F6FD6] active:scale-[0.99] disabled:opacity-50"
    >
      <span className="font-heading text-base font-extrabold text-white sm:text-lg">
        {children}
      </span>
    </button>
  );
}

export function SignupSuccessState({
  onContinue,
  continueLabel = "Start reading now",
}: {
  onContinue: () => void;
  continueLabel?: string;
}) {
  return (
    <div className="text-center">
      <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
        <div
          className="absolute inset-0 animate-pulse rounded-full bg-[#5340FF]/20 blur-xl"
          aria-hidden
        />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#5340FF] to-[#7C3AED] text-4xl shadow-[0_12px_40px_rgba(83,64,255,0.35)]">
          🎉
        </div>
      </div>
      <h1 className="font-heading mt-6 text-2xl font-extrabold text-[#2A114B] sm:text-[1.75rem]">
        You&apos;re in!
      </h1>
      <p className="mt-2 text-base font-semibold text-[#5340FF]">
        Your first story is ready.
      </p>
      <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-[#667085]">
        Your progress is saved and your picks are set. Time to dive in.
      </p>
      <div className="mt-8">
        <SignupCtaButton type="button" onClick={onContinue}>
          {continueLabel}
        </SignupCtaButton>
      </div>
    </div>
  );
}
