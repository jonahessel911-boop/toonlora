"use client";

interface SignupWeeklyStoryBenefitProps {
  selected: boolean;
  onChange: (value: boolean) => void;
}

export default function SignupWeeklyStoryBenefit({
  selected,
  onChange,
}: SignupWeeklyStoryBenefitProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!selected)}
      className={`flex w-full items-start gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
        selected
          ? "border-[#FF6847] bg-gradient-to-r from-[#FFF5F0] to-white shadow-[0_8px_28px_rgba(255,104,71,0.15)]"
          : "border-[#E7D8FF] bg-white hover:border-[#FF6847]/40 hover:shadow-md"
      }`}
    >
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${
          selected ? "bg-[#FF6847]" : "bg-[#FCFAFF]"
        }`}
      >
        📬
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-heading text-base font-extrabold text-[#2A114B]">
          Receive a fresh story every week straight in your email
        </p>
        <p className="mt-0.5 text-sm leading-snug text-[#667085]">
          No spam. Unsubscribe anytime.
        </p>
      </div>
      <span
        className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition ${
          selected
            ? "border-[#FF6847] bg-[#FF6847] text-white"
            : "border-[#E7D8FF] bg-white"
        }`}
        aria-hidden
      >
        {selected ? "✓" : ""}
      </span>
    </button>
  );
}
