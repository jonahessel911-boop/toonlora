"use client";

import CoverArt from "@/components/ui/CoverArt";
import LPPillButton from "@/components/lp/LPPillButton";

interface ChoiceCardProps {
  variant: "read" | "create";
  title: string;
  subtitle: string;
  cta: string;
  badge: string;
  onSelect: () => void;
  primary?: boolean;
}

export default function ChoiceCard({
  variant,
  title,
  subtitle,
  cta,
  badge,
  onSelect,
  primary = false,
}: ChoiceCardProps) {
  const isRead = variant === "read";

  return (
    <div
      className={`rounded-2xl bg-white p-3 shadow-sm sm:p-4 ${
        primary ? "ring-[3px] ring-lp-yellow" : "ring-1 ring-gray-100"
      }`}
    >
      <div className="flex gap-3">
        <div className="relative h-[4.5rem] w-[4.5rem] flex-shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-20">
          {isRead ? (
            <CoverArt
              gradient="from-fuchsia-500 via-violet-500 to-lp-purple"
              emoji="🌸"
              className="h-full w-full"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-100 to-lp-yellow/40 text-2xl">
              ✨
            </div>
          )}
          <span
            className={`absolute left-1 top-1 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold leading-none sm:text-[10px] ${
              isRead
                ? "bg-lp-yellow text-lp-purple-deep"
                : "bg-lp-purple text-white"
            }`}
          >
            {badge}
          </span>
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          <h3 className="text-sm font-black text-gray-900 sm:text-base">
            {title}
          </h3>
          <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-gray-500 sm:text-sm">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <LPPillButton
          variant={isRead ? "primary" : "secondary"}
          className="lp-pill-btn-compact sm:!min-h-[3.25rem] sm:!text-base"
          onClick={onSelect}
        >
          {cta}
        </LPPillButton>
      </div>
    </div>
  );
}
