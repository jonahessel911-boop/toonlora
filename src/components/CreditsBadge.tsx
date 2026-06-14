"use client";

import { useEffect, useState } from "react";
import { useCreditsStore } from "@/store/useCreditsStore";
import PricingModal from "@/components/PricingModal";

export default function CreditsBadge() {
  const { credits, hydrate, hydrated } = useCreditsStore();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!hydrated) return null;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-border sm:p-5">
        <div>
          <p className="text-sm font-medium text-gray-500">Your balance</p>
          <p className="text-2xl font-black text-groen-deep">
            Credits:{" "}
            <span className="text-primary">{credits}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="rounded-full bg-groen-deep px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/20 transition hover:opacity-90"
        >
          Buy credits
        </button>
      </div>

      <PricingModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
