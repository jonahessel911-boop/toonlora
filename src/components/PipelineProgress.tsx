"use client";

import { motion } from "framer-motion";
import type { PipelineStepStatus } from "@/types/pipeline";

interface PipelineProgressProps {
  steps: PipelineStepStatus[];
  currentMessage?: string;
}

export default function PipelineProgress({
  steps,
  currentMessage = "Story-to-Webtoon Engine running…",
}: PipelineProgressProps) {
  const doneCount = steps.filter((s) => s.status === "done").length;
  const progress = Math.round((doneCount / steps.length) * 100);

  return (
    <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-border">
      <div className="mb-6 text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-groen-primary">
          Story-to-Webtoon Engine
        </p>
        <motion.p
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-2 text-lg font-black text-groen-deep"
        >
          {currentMessage}
        </motion.p>
        <p className="mt-1 text-sm text-gray-500">
          Prompt → Bible → Script → Panels → Image → Overlay
        </p>
      </div>

      <div className="mb-6 h-2 overflow-hidden rounded-full bg-groen-mint">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-groen-primary to-groen-deep"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li
            key={step.id}
            className={`flex items-start gap-3 rounded-xl px-3 py-2 transition ${
              step.status === "running"
                ? "bg-groen-mint ring-1 ring-groen-primary/30"
                : step.status === "done"
                  ? "opacity-70"
                  : ""
            }`}
          >
            <span
              className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-black ${
                step.status === "done"
                  ? "bg-groen-deep text-white"
                  : step.status === "running"
                    ? "bg-groen-primary text-white"
                    : step.status === "error"
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 text-gray-400"
              }`}
            >
              {step.status === "done" ? "✓" : step.status === "running" ? "…" : i}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-800">{step.label}</p>
              <p className="text-xs text-gray-400">{step.model}</p>
              {step.message && (
                <p className="mt-0.5 text-xs text-red-500">{step.message}</p>
              )}
            </div>
            {step.status === "running" && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mt-1 h-4 w-4 flex-shrink-0 rounded-full border-2 border-groen-mint border-t-groen-deep"
              />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
