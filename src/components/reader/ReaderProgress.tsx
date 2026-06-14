"use client";

import { motion } from "framer-motion";

interface ReaderProgressProps {
  current: number;
  total: number;
  onSelect?: (index: number) => void;
}

export default function ReaderProgress({
  current,
  total,
  onSelect,
}: ReaderProgressProps) {
  const pct = total > 0 ? ((current + 1) / total) * 100 : 0;

  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-[360px] -translate-x-1/2 sm:bottom-6">
      <div className="pointer-events-auto rounded-2xl border border-[#E7D8FF] bg-white/95 px-4 py-3 shadow-[0_12px_40px_rgba(83,64,255,0.12)] backdrop-blur-xl">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-[#2A114B]">
            Panel {current + 1}{" "}
            <span className="font-medium text-[#667085]">/ {total}</span>
          </span>
          <span className="rounded-full bg-[#F3ECFF] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#7C3AED]">
            Reading
          </span>
        </div>

        <div className="relative h-2 overflow-hidden rounded-full bg-[#E9D8FD]/60">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#5340FF] to-[#7C3AED]"
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        </div>

        {total <= 12 && (
          <div className="mt-2.5 flex justify-center gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelect?.(i)}
                aria-label={`Go to panel ${i + 1}`}
                className={`rounded-full transition-all ${
                  i === current
                    ? "h-2 w-5 bg-[#5340FF]"
                    : i < current
                      ? "h-2 w-2 bg-[#7C3AED]/50"
                      : "h-2 w-2 bg-[#E7D8FF] hover:bg-[#C4B5FD]"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
