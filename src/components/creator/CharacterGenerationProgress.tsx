"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COMIC_FACTS = [
  "Webtoons scroll vertically — built for reading on your phone.",
  "Digital comics can release new episodes every week.",
  "Full-color art on every panel is the webtoon standard.",
  "Vertical comics took off in South Korea in the early 2000s.",
  "A good cliffhanger at the end of an episode keeps readers hooked.",
  "Consistent character design matters across hundreds of panels.",
  "Panel size and spacing control the rhythm of a scene.",
  "Sound effects in comics — like WHOOSH or TAP — are called SFX.",
  "Some digital series reach millions of readers around the world.",
  "Episode one is your chance to introduce the world and the cast.",
  "Speech bubbles guide the reader's eye through each panel.",
  "Creators can publish directly online, without a print publisher.",
];

interface CharacterGenerationProgressProps {
  characterName?: string;
  /** 0–100; when undefined, simulates progress up to ~92% */
  progress?: number;
}

export default function CharacterGenerationProgress({
  characterName,
  progress,
}: CharacterGenerationProgressProps) {
  const [factIndex, setFactIndex] = useState(
    () => Math.floor(Math.random() * COMIC_FACTS.length)
  );
  const [simulated, setSimulated] = useState(0);

  const shuffledFacts = useMemo(() => {
    const copy = [...COMIC_FACTS];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setFactIndex((index) => (index + 1) % shuffledFacts.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [shuffledFacts.length]);

  useEffect(() => {
    if (progress !== undefined) return;
    const timer = setInterval(() => {
      setSimulated((value) => {
        if (value >= 92) return value;
        const bump = value < 40 ? 4 : value < 70 ? 2 : 0.8;
        return Math.min(92, value + bump);
      });
    }, 500);
    return () => clearInterval(timer);
  }, [progress]);

  const pct = progress !== undefined ? progress : simulated;
  const label = characterName?.trim() || "your character";

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center px-4 py-12 text-center sm:py-16">
      <p className="font-heading text-xl font-extrabold text-[#2A114B]">
        Creating {label}…
      </p>

      <div className="mt-8 w-full">
        <div className="mb-2 flex justify-end text-xs font-medium text-[#667085]">
          {Math.round(pct)}%
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#E7D8FF]">
          <div
            className="h-full rounded-full bg-[#5340FF] transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-10 min-h-[4.5rem]">
        <AnimatePresence mode="wait">
          <motion.p
            key={factIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="text-sm leading-relaxed text-[#667085]"
          >
            {shuffledFacts[factIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
