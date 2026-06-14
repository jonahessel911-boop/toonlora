"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CoverArt from "@/components/ui/CoverArt";

const STEPS = [
  "Understanding your idea",
  "Building your characters",
  "Writing your episode",
  "Creating your comic art",
  "Finalizing your story",
];

const TIPS = [
  "Good stories need a little magic.",
  "Adding visual style makes your story more unique.",
  "You'll be able to continue this series later.",
  "Share your episode with one tap when it's ready.",
];

export default function GenerationLoading({ progress = 0 }: { progress?: number }) {
  const [activeStep, setActiveStep] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setActiveStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 1800);
    const tipTimer = setInterval(() => {
      setTipIndex((t) => (t + 1) % TIPS.length);
    }, 3200);
    return () => {
      clearInterval(stepTimer);
      clearInterval(tipTimer);
    };
  }, []);

  const pct = progress || Math.min(((activeStep + 1) / STEPS.length) * 100, 95);

  return (
    <div className="mx-auto max-w-lg rounded-3xl bg-white p-8 shadow-sm ring-1 ring-border sm:p-10">
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-groen-mint text-3xl"
        >
          ✨
        </motion.div>
        <h2 className="text-2xl font-black text-gray-900">
          Creating your story...
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          We&apos;re turning your idea into a story episode.
        </p>
      </div>

      <div className="mt-8 h-2 overflow-hidden rounded-full bg-groen-mint">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-groen-primary to-groen-deep"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>

      <ol className="mt-8 space-y-3">
        {STEPS.map((step, i) => {
          const done = i < activeStep;
          const active = i === activeStep;
          return (
            <li
              key={step}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                active ? "bg-groen-mint ring-1 ring-groen-primary/30" : ""
              }`}
            >
              <span
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  done
                    ? "bg-groen-deep text-white"
                    : active
                      ? "bg-groen-primary text-white"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={`text-sm font-semibold ${
                  done || active ? "text-gray-800" : "text-gray-400"
                }`}
              >
                {step}
              </span>
              {active && (
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="ml-auto text-groen-primary"
                >
                  …
                </motion.span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl ring-1 ring-border"
          >
            <CoverArt
              gradient={
                i === 0
                  ? "from-violet-400 to-purple-600"
                  : i === 1
                    ? "from-primary to-violet-500"
                    : "from-pink-400 to-rose-500"
              }
              emoji={i === 0 ? "👩" : i === 1 ? "📖" : "✨"}
              className="aspect-square animate-pulse"
            />
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={tipIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="mt-6 text-center text-sm italic text-gray-500"
        >
          &ldquo;{TIPS[tipIndex]}&rdquo;
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
