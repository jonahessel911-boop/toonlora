"use client";

import { useEffect } from "react";
import { useCreditsStore } from "@/store/useCreditsStore";
import { formatCreditCost } from "@/lib/creator/credits";

interface CreditsBadgeProps {
  compact?: boolean;
  onBuyCoins?: () => void;
}

export default function CreditsBadge({ compact, onBuyCoins }: CreditsBadgeProps) {
  const { credits, hydrate } = useCreditsStore();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (compact) {
    return (
      <button
        type="button"
        onClick={onBuyCoins}
        className="inline-flex items-center gap-1.5 rounded-full bg-[#F3ECFF] px-3 py-1.5 text-xs font-bold text-[#5340FF] transition hover:bg-[#E7D8FF]"
      >
        <span className="text-[#FFE033]">✦</span>
        {credits} coins
      </button>
    );
  }

  return (
    <div className="rounded-2xl bg-[#F3ECFF] p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#667085]">
        Coins
      </p>
      <p className="mt-1 font-heading text-2xl font-extrabold text-[#5340FF]">
        {credits}
      </p>
      <button
        type="button"
        onClick={onBuyCoins}
        className="mt-2 w-full rounded-xl bg-[#5340FF] py-2 text-xs font-bold text-white hover:bg-[#4330e8]"
      >
        Buy coins
      </button>
      <p className="mt-2 text-[10px] text-[#667085]">
        {formatCreditCost(8)} · 4 panels
      </p>
    </div>
  );
}
