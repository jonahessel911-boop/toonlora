import type { Metadata } from "next";
import SignupLogo, {
  SignupHeroIllustration,
  SignupStepIndicator,
  SignupPrimaryButton,
  SignupFooterLink,
} from "@/components/signup/SignupScreen";

export const metadata: Metadata = {
  title: "Sign up — Toonlora",
};

export default function SignupPage() {
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-6 pb-8 pt-10 sm:px-8">
      <SignupLogo />

      <div className="mt-4 flex-1">
        <SignupHeroIllustration />

        <div className="mt-6 text-center">
          <h2 className="text-[1.65rem] font-black leading-tight tracking-tight text-gray-800 sm:text-3xl">
            Create your own{" "}
            <span className="relative inline-block text-groen-primary">
              cartoon stories
              <svg
                className="absolute -bottom-1 left-0 w-full"
                height="8"
                viewBox="0 0 120 8"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d="M2 6C20 2 40 1 60 3C80 5 100 4 118 2"
                  stroke="#7BC67E"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-[300px] text-sm leading-relaxed text-gray-400 sm:text-[15px]">
            Generate unique stories with AI, save your episodes, and read them
            anywhere, anytime.
          </p>
        </div>
      </div>

      <div className="mt-auto space-y-5 pt-8">
        <SignupStepIndicator step={1} total={6} />
        <SignupPrimaryButton href="/signup/register">
          Create account
        </SignupPrimaryButton>
        <SignupFooterLink />
      </div>
    </div>
  );
}
