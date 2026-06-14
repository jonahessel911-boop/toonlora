"use client";

import { motion } from "framer-motion";

interface ReaderProgressProps {
  current: number;
  total: number;
  onSelect?: (index: number) => void;
  dark?: boolean;
}

export default function ReaderProgress({
  current,
  total,
  onSelect,
  dark = false,
}: ReaderProgressProps) {
  const pct = total > 0 ? ((current + 1) / total) * 100 : 0;

  return (
    <div
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:bottom-6 sm:left-1/2 sm:right-auto sm:w-[calc(100%-2rem)] sm:max-w-[360px] sm:-translate-x-1/2 sm:px-0 sm:pb-[max(1.5rem,env(safe-area-inset-bottom))]"
    >
      <div
        className={`pointer-events-auto rounded-2xl px-3 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:px-4 sm:py-3 ${
          dark
            ? "border border-white/15 bg-[#1A1028]/92"
            : "border border-[#E7D8FF] bg-white/95 shadow-[0_12px_40px_rgba(83,64,255,0.12)]"
        }`}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <span
            className={`text-[11px] font-bold sm:text-xs ${
              dark ? "text-white" : "text-[#2A114B]"
            }`}
          >
            Page {current + 1}{" "}
            <span className={`font-medium ${dark ? "text-white/55" : "text-[#667085]"}`}>
              / {total}
            </span>
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide sm:text-[10px] ${
              dark
                ? "bg-[#5340FF]/30 text-[#C4B5FD]"
                : "bg-[#F3ECFF] text-[#7C3AED]"
            }`}
          >
            Reading
          </span>
        </div>

        <div
          className={`relative h-1.5 overflow-hidden rounded-full sm:h-2 ${
            dark ? "bg-white/10" : "bg-[#E9D8FD]/60"
          }`}
        >
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#5340FF] to-[#7C3AED]"
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        </div>

        {total <= 12 && (
          <div className="mt-2 flex justify-center gap-1 sm:mt-2.5 sm:gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelect?.(i)}
                aria-label={`Go to page ${i + 1}`}
                className={`rounded-full transition-all ${
                  i === current
                    ? dark
                      ? "h-1.5 w-4 bg-white sm:h-2 sm:w-5"
                      : "h-2 w-5 bg-[#5340FF]"
                    : i < current
                      ? dark
                        ? "h-1.5 w-1.5 bg-white/45 sm:h-2 sm:w-2"
                        : "h-2 w-2 bg-[#7C3AED]/50"
                      : dark
                        ? "h-1.5 w-1.5 bg-white/20 sm:h-2 sm:w-2"
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
