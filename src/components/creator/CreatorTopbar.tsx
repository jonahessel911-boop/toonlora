"use client";

import CreditsBadge from "@/components/creator/CreditsBadge";

interface CreatorTopbarProps {
  title?: string;
  onMenuOpen?: () => void;
  onBuyCoins?: () => void;
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
}

export default function CreatorTopbar({
  title = "Toonlora Studio",
  onMenuOpen,
  onBuyCoins,
  primaryAction,
  secondaryAction,
}: CreatorTopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[#E7D8FF] bg-[#FCFAFF]/90 px-4 py-3 backdrop-blur-md md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {onMenuOpen ? (
          <button
            type="button"
            onClick={onMenuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E7D8FF] bg-white text-[#2A114B] md:hidden"
            aria-label="Open menu"
          >
            ☰
          </button>
        ) : null}
        <div className="min-w-0">
          <p className="truncate font-heading text-lg font-extrabold text-[#2A114B] md:text-xl">
            {title}
          </p>
          <p className="hidden text-xs text-[#667085] sm:block">
            Create, edit, and publish digital comics
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="hidden sm:block">
          <CreditsBadge compact onBuyCoins={onBuyCoins} />
        </div>
        {secondaryAction ? (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            className="hidden rounded-2xl border border-[#E7D8FF] bg-white px-4 py-2.5 text-sm font-bold text-[#5340FF] transition hover:bg-[#F3ECFF] sm:inline-flex"
          >
            {secondaryAction.label}
          </button>
        ) : null}
        {primaryAction ? (
          <button
            type="button"
            onClick={primaryAction.onClick}
            className="rounded-2xl bg-[#FF6847] px-4 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(255,104,71,0.35)] transition hover:bg-[#ff5230]"
          >
            {primaryAction.label}
          </button>
        ) : null}
      </div>
    </header>
  );
}
