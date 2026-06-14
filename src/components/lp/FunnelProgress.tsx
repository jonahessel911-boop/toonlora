"use client";

interface FunnelProgressProps {
  step: 1 | 2 | 3;
  onPurple?: boolean;
}

const LABELS = ["Choose", "Pick category", "Start"];

export default function FunnelProgress({
  step,
  onPurple = true,
}: FunnelProgressProps) {
  return (
    <div className="mb-6">
      <div
        className={`flex items-center justify-between text-xs font-bold ${
          onPurple ? "text-white/60" : "text-gray-400"
        }`}
      >
        <span>Step {step} of 3</span>
        <span>{LABELS[step - 1]}</span>
      </div>
      <div className="mt-2 flex gap-1.5">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              s <= step
                ? onPurple
                  ? "bg-lp-yellow"
                  : "bg-lp-purple"
                : onPurple
                  ? "bg-white/20"
                  : "bg-gray-100"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
