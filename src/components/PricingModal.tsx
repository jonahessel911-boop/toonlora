"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CREDIT_PACKAGES } from "@/lib/constants";
import { useCreditsStore } from "@/store/useCreditsStore";

interface PricingModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PricingModal({ open, onClose }: PricingModalProps) {
  const addCredits = useCreditsStore((s) => s.addCredits);

  const handlePurchase = async (credits: number) => {
    await addCredits(credits);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-black text-gray-900">
                Buy Credits
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Each story generation uses 1 credit after your free story.
              </p>
            </div>

            <div className="space-y-3">
              {CREDIT_PACKAGES.map((pkg) => (
                <button
                  key={pkg.credits}
                  type="button"
                  onClick={() => handlePurchase(pkg.credits)}
                  className={`relative flex w-full items-center justify-between rounded-2xl border-2 px-5 py-4 text-left transition hover:border-groen-primary hover:bg-groen-mint ${
                    pkg.popular
                      ? "border-groen-deep bg-groen-mint/50"
                      : "border-border"
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-3 left-4 rounded-full bg-groen-deep px-3 py-0.5 text-xs font-bold text-white">
                      Popular
                    </span>
                  )}
                  <div>
                    <p className="text-lg font-black text-gray-900">
                      {pkg.credits} credits
                    </p>
                    <p className="text-sm text-gray-500">Instant delivery</p>
                  </div>
                  <span className="text-xl font-black text-groen-deep">
                    {pkg.price}
                  </span>
                </button>
              ))}
            </div>

            <p className="mt-4 text-center text-xs text-gray-400">
              Demo only — no real payment processed
            </p>

            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full rounded-full py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
