import type { Metadata } from "next";
import SignupLogo, {
  SignupFooterLink,
  SignupHeroIllustration,
  SignupPageBackground,
  SignupPrimaryButton,
  SignupStepIndicator,
} from "@/components/signup/SignupScreen";

export const metadata: Metadata = {
  title: "Sign up — Toonlora",
};

export default function SignupPage() {
  return (
    <SignupPageBackground>
      <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-6 pb-8 pt-10 sm:px-8">
        <SignupLogo />

        <div className="mt-4 flex-1">
          <SignupHeroIllustration />

          <div className="mt-6 text-center">
            <h2 className="font-heading text-[1.65rem] font-extrabold leading-tight tracking-tight text-[#2A114B] sm:text-3xl">
              Join{" "}
              <span className="relative inline-block text-[#5340FF]">
                Toonlora
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  height="8"
                  viewBox="0 0 120 8"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <path
                    d="M2 6C20 2 40 1 60 3C80 5 100 4 118 2"
                    stroke="#FFE033"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-[300px] text-sm leading-relaxed text-[#667085] sm:text-[15px]">
              Create a free account to save your episodes, follow stories, and
              pick up reading where you left off.
            </p>
          </div>
        </div>

        <div className="mt-auto space-y-5 pt-8">
          <SignupStepIndicator step={1} total={2} />
          <SignupPrimaryButton href="/signup/register">
            Create account
          </SignupPrimaryButton>
          <SignupFooterLink />
        </div>
      </div>
    </SignupPageBackground>
  );
}
