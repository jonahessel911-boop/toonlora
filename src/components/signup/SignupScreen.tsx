import Link from "next/link";
import ToonloraLogo from "@/components/ui/ToonloraLogo";

function Sparkle({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
    >
      <path
        d="M6 0L6.8 4.2L11 5L6.8 5.8L6 10L5.2 5.8L1 5L5.2 4.2L6 0Z"
        fill="#F5C842"
      />
    </svg>
  );
}


export default function SignupLogo() {
  return (
    <div className="relative flex flex-col items-center pt-2">
      <Sparkle className="absolute left-[18%] top-0" />
      <Sparkle className="absolute right-[20%] top-3 h-2 w-2 opacity-80" />
      <Sparkle className="absolute left-[28%] top-8 h-2 w-2 opacity-60" />
      <ToonloraLogo variant="full" iconSize={44} />
    </div>
  );
}

export function SignupHeroIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-[340px] px-2">
      <div className="absolute -inset-x-2 top-6 bottom-0 overflow-hidden rounded-[2.5rem]">
        <div className="absolute -left-10 top-10 h-44 w-44 rounded-full bg-primary-soft/60 blur-2xl" />
        <div className="absolute -right-8 top-20 h-40 w-40 rounded-full bg-accent-pink/20 blur-2xl" />
        <div className="absolute bottom-0 left-1/2 h-28 w-[130%] -translate-x-1/2 rounded-t-[50%] bg-gradient-to-b from-surface-soft to-primary-soft/40" />
      </div>

      <div className="relative mx-auto h-[220px] w-[280px] sm:h-[240px] sm:w-[300px]">
        {/* Green cat panel — top left */}
        <div className="absolute left-0 top-6 z-10 w-[72px] rotate-[-8deg] overflow-hidden rounded-xl border-[3px] border-white bg-gradient-to-br from-accent-yellow to-accent-pink shadow-md">
          <div className="flex aspect-square items-center justify-center text-3xl">
            🐱
          </div>
        </div>

        {/* Magic panel — top */}
        <div className="absolute left-[72px] top-0 z-20 w-[80px] rotate-[4deg] overflow-hidden rounded-xl border-[3px] border-white bg-gradient-to-br from-violet-400 to-purple-600 shadow-md">
          <div className="flex aspect-[4/5] items-center justify-center text-2xl">
            ✨
          </div>
        </div>

        {/* Comic template — top right */}
        <div className="absolute right-0 top-4 z-10 w-[68px] rotate-[6deg] overflow-hidden rounded-xl border-[3px] border-white bg-white shadow-md">
          <div className="grid aspect-square grid-cols-2 gap-0.5 p-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded-sm bg-gray-100" />
            ))}
          </div>
        </div>

        {/* Main character — center */}
        <div className="absolute left-1/2 top-[52px] z-30 w-[110px] -translate-x-1/2">
          <div className="overflow-hidden rounded-2xl border-[3px] border-white bg-gradient-to-b from-violet-500 to-purple-800 shadow-xl">
            <div className="flex aspect-[3/4] flex-col items-center justify-end pb-3 pt-4">
              <div className="mb-1 h-10 w-10 rounded-full bg-purple-300/80" />
              <div className="h-14 w-16 rounded-t-2xl bg-purple-900/90" />
              <div className="mt-1 text-lg">✏️</div>
            </div>
          </div>
        </div>

        {/* Bear panel — bottom left */}
        <div className="absolute bottom-2 left-2 z-10 w-[70px] rotate-[-5deg] overflow-hidden rounded-xl border-[3px] border-white bg-gradient-to-br from-amber-200 to-orange-300 shadow-md">
          <div className="flex aspect-square items-center justify-center text-3xl">
            🐻
          </div>
        </div>

        {/* Hijab girl — bottom right */}
        <div className="absolute bottom-0 right-2 z-10 w-[74px] rotate-[8deg] overflow-hidden rounded-xl border-[3px] border-white bg-gradient-to-br from-sky-300 to-blue-500 shadow-md">
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

export function SignupStepIndicator({ step = 1, total = 6 }: SignupStepProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="flex items-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`rounded-full transition-all ${
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

interface SignupPrimaryButtonProps {
  href: string;
  children: React.ReactNode;
}

export function SignupPrimaryButton({
  href,
  children,
}: SignupPrimaryButtonProps) {
  return (
    <Link
      href={href}
      className="group flex w-full items-center justify-between rounded-full bg-groen-primary py-4 pl-7 pr-2 shadow-lg shadow-primary/25 transition hover:bg-primary active:scale-[0.99]"
    >
      <span className="text-base font-bold text-white">{children}</span>
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/95 shadow-sm">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
          <path
            d="M4 9H14M14 9L10 5M14 9L10 13"
            stroke="#7C3AED"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Link>
  );
}

export function SignupFooterLink() {
  return (
    <p className="text-center text-sm text-gray-500">
      Already have an account?{" "}
      <Link
        href="/signin"
        className="font-bold text-groen-primary hover:text-groen-deep"
      >
        Sign in
      </Link>
    </p>
  );
}
