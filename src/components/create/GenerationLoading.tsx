"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CoverArt from "@/components/ui/CoverArt";

const STEPS = [
  "Understanding your idea",
  "Building your characters",
  "Writing your episode",
  "Creating your comic art",
  "Finalizing your story",
] as const;

const MICROCOPY = [
  "Good stories need a little magic.",
  "Sketching your characters…",
  "Adding the perfect cliffhanger…",
  "Building your first episode…",
  "Preparing your story for reading…",
  "Almost ready to share with the world…",
];

const ACTIVE_LABELS = ["New story", "Characters", "Writing", "Comic art", "Almost ready"];

function Sparkle({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.span
      className={`pointer-events-none absolute text-lg ${className}`}
      animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.15, 0.85], rotate: [0, 15, 0] }}
      transition={{ duration: 2.2, repeat: Infinity, delay, ease: "easeInOut" }}
      aria-hidden
    >
      ✦
    </motion.span>
  );
}

function FloatingCard({
  className,
  gradient,
  delay,
  children,
}: {
  className?: string;
  gradient: string;
  delay?: number;
  children?: ReactNode;
}) {
  return (
    <motion.div
      className={`absolute overflow-hidden rounded-2xl shadow-lg ring-1 ring-white/30 ${className}`}
      animate={{ y: [0, -10, 0], rotate: [-2, 2, -2] }}
      transition={{ duration: 5, repeat: Infinity, delay, ease: "easeInOut" }}
    >
      <div className={`h-full w-full bg-gradient-to-br ${gradient} p-3`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_55%)]" />
        {children}
      </div>
    </motion.div>
  );
}

function PreviewVisual({ phase }: { phase: number }) {
  const showCover = phase >= 0;
  const showCharacters = phase >= 1;
  const showPanels = phase >= 2;
  const showColor = phase >= 3;

  return (
    <div className="relative mx-auto w-full max-w-[320px]">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -inset-8 rounded-full bg-[#5340FF]/20 blur-3xl" aria-hidden />

      {/* Floating background cards */}
      <FloatingCard
        className="-left-6 top-8 h-20 w-16 opacity-70"
        gradient="from-[#FF4FA3] to-[#FF6847]"
        delay={0.2}
      />
      <FloatingCard
        className="-right-4 top-16 h-16 w-14 opacity-60"
        gradient="from-[#22D3EE] to-[#5340FF]"
        delay={0.8}
      />
      <FloatingCard
        className="-left-2 bottom-20 h-14 w-12 opacity-50"
        gradient="from-[#FFE033] to-[#FF6847]"
        delay={1.2}
      />

      <Sparkle className="left-4 top-2 text-[#FFE033]" delay={0} />
      <Sparkle className="right-6 top-10 text-[#FF4FA3]" delay={0.6} />
      <Sparkle className="bottom-24 left-8 text-white" delay={1.1} />

      {/* Main preview frame */}
      <motion.div
        className="relative overflow-hidden rounded-[28px] bg-white shadow-[0_24px_64px_rgba(83,64,255,0.25)] ring-1 ring-[#E7D8FF]"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Shimmer overlay */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          animate={{ x: ["-120%", "220%"] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 0.8 }}
          aria-hidden
        />

        {/* Cover area */}
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          {showCover && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: showColor ? 1 : 0.55, filter: showColor ? "blur(0px)" : "blur(6px)" }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <CoverArt
                gradient={
                  showColor
                    ? "from-[#5340FF] via-[#6D4CFF] to-[#FF4FA3]"
                    : "from-[#E7D8FF] via-[#C4B5FD] to-[#DDD6FE]"
                }
                genre="Fantasy"
                title={showColor ? "Your Story" : undefined}
                showOverlay={showColor}
                seed={42}
                className="h-full w-full"
              />
            </motion.div>
          )}

          {/* Skeleton overlay early phase */}
          {!showColor && (
            <div className="absolute inset-0 bg-gradient-to-b from-[#F3ECFF]/40 via-transparent to-[#5340FF]/10" />
          )}

          {/* Character silhouettes mid phase */}
          <AnimatePresence>
            {showCharacters && !showColor && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute inset-x-0 bottom-[18%] flex justify-center gap-3"
              >
                {[28, 44, 32].map((size, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.15 }}
                    className="rounded-full bg-[#2A114B]/25 backdrop-blur-sm"
                    style={{ width: size, height: size }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top badges */}
          <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
            <span className="rounded-full bg-[#5340FF] px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
              Episode 01
            </span>
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-[#2A114B] shadow-sm">
              {ACTIVE_LABELS[Math.min(phase, ACTIVE_LABELS.length - 1)]}
            </span>
          </div>
        </div>

        {/* Panel strip */}
        <div className="grid grid-cols-3 gap-1.5 bg-[#F3ECFF]/80 p-2.5">
          {[1, 2, 3].map((n) => (
            <motion.div
              key={n}
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: showPanels ? 1 : 0.35,
                scale: showPanels && phase >= 3 ? 1 : 0.95,
              }}
              transition={{ delay: n * 0.1 }}
              className="relative aspect-[4/5] overflow-hidden rounded-xl ring-1 ring-[#E7D8FF]"
            >
              {showPanels ? (
                <div
                  className={`h-full w-full bg-gradient-to-br ${
                    n === 1
                      ? "from-[#5340FF] to-[#2A114B]"
                      : n === 2
                        ? "from-[#FF4FA3] to-[#FF6847]"
                        : "from-[#22D3EE] to-[#5340FF]"
                  }`}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.2),transparent_60%)]" />
                  <span className="absolute bottom-1 left-1.5 text-[8px] font-bold text-white/80">
                    Panel {n}
                  </span>
                </div>
              ) : (
                <div className="h-full w-full animate-pulse bg-gradient-to-br from-[#E7D8FF] to-[#F3ECFF]" />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function GenerationLoading({ progress = 0 }: { progress?: number }) {
  const [activeStep, setActiveStep] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setActiveStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 2200);
    const tipTimer = setInterval(() => {
      setTipIndex((t) => (t + 1) % MICROCOPY.length);
    }, 2800);
    return () => {
      clearInterval(stepTimer);
      clearInterval(tipTimer);
    };
  }, []);

  const pct = progress || Math.min(((activeStep + 1) / STEPS.length) * 100, 92);

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[#FCFAFF]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#5340FF]/8 via-[#F3ECFF] to-[#FFE033]/10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-[#5340FF]/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[#FF4FA3]/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto flex h-full w-full max-w-[1100px] flex-col overflow-hidden px-4 py-5 md:px-6 md:py-6 lg:py-8">
        {/* Studio label */}
        <p className="shrink-0 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-[#5340FF] md:text-left">
          Toonlora Studio
        </p>

        <div className="mt-4 grid min-h-0 flex-1 gap-6 overflow-hidden md:grid-cols-2 md:items-center md:gap-10 lg:gap-14">
          {/* Left — progress (below preview on mobile via order) */}
          <div className="order-2 flex min-h-0 flex-col justify-center md:order-1">
            <div className="text-center md:text-left">
              <motion.h2
                className="font-heading text-2xl font-bold text-[#101828] md:text-3xl lg:text-4xl"
                animate={{ opacity: [0.92, 1, 0.92] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Creating your story…
              </motion.h2>
              <p className="mt-2 text-sm text-[#667085] md:text-base">
                We&apos;re turning your idea into a cartoon episode.
              </p>
            </div>

            {/* Progress bar */}
            <div className="mt-6 md:mt-8">
              <div className="mb-2 flex items-center justify-between text-xs font-bold">
                <span className="text-[#5340FF]">{STEPS[activeStep]}</span>
                <span className="text-[#667085]">{Math.round(pct)}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[#E7D8FF]/70 shadow-inner">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#5340FF] via-[#6D4CFF] to-[#7C3AED]"
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Step pills */}
            <div className="mt-5 flex flex-wrap gap-2">
              {STEPS.map((step, i) => {
                const done = i < activeStep;
                const active = i === activeStep;
                return (
                  <motion.span
                    key={step}
                    animate={active ? { scale: [1, 1.04, 1] } : {}}
                    transition={{ duration: 1.5, repeat: active ? Infinity : 0 }}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold md:text-[11px] ${
                      done
                        ? "bg-[#5340FF] text-white"
                        : active
                          ? "bg-[#F3ECFF] text-[#5340FF] ring-2 ring-[#5340FF]/30"
                          : "bg-white text-[#667085] ring-1 ring-[#E7D8FF]"
                    }`}
                  >
                    {done ? "✓" : i + 1}
                    <span className="hidden sm:inline">{step.split(" ")[0]}</span>
                  </motion.span>
                );
              })}
            </div>

            {/* Step list — compact beautiful */}
            <ul className="mt-5 hidden space-y-2 sm:block">
              {STEPS.map((step, i) => {
                const done = i < activeStep;
                const active = i === activeStep;
                return (
                  <motion.li
                    key={step}
                    animate={active ? { x: [0, 3, 0] } : {}}
                    transition={{ duration: 1.8, repeat: active ? Infinity : 0 }}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 transition ${
                      active ? "bg-[#F3ECFF] ring-1 ring-[#5340FF]/20" : ""
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        done
                          ? "bg-[#5340FF] text-white"
                          : active
                            ? "bg-[#5340FF] text-white shadow-[0_0_12px_rgba(83,64,255,0.5)]"
                            : "bg-[#E7D8FF] text-[#667085]"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        done || active ? "text-[#101828]" : "text-[#667085]"
                      }`}
                    >
                      {step}
                    </span>
                    {active && (
                      <motion.span
                        className="ml-auto text-[#5340FF]"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1.2 }}
                      >
                        ✦
                      </motion.span>
                    )}
                  </motion.li>
                );
              })}
            </ul>

            {/* Rotating microcopy */}
            <AnimatePresence mode="wait">
              <motion.p
                key={tipIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="mt-5 text-center text-sm font-medium italic text-[#667085] md:mt-6 md:text-left"
              >
                &ldquo;{MICROCOPY[tipIndex]}&rdquo;
              </motion.p>
            </AnimatePresence>

            <p className="mt-3 hidden text-center text-xs text-[#667085]/80 md:block md:text-left">
              This usually takes less than a minute.
            </p>
          </div>

          {/* Right — visual preview */}
          <div className="order-1 flex min-h-0 items-center justify-center md:order-2">
            <PreviewVisual phase={activeStep} />
          </div>
        </div>
      </div>
    </div>
  );
}
