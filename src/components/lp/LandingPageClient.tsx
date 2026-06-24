"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import LPTopBar from "@/components/lp/LPTopBar";
import FunnelProgress from "@/components/lp/FunnelProgress";
import ChoiceCard from "@/components/lp/ChoiceCard";
import CategoryCard from "@/components/lp/CategoryCard";
import StoryGrid from "@/components/lp/StoryGrid";
import LPPillButton from "@/components/lp/LPPillButton";
import {
  LP_CATEGORIES,
  lpCategoryToGenre,
  type LPCategory,
} from "@/lib/lpStories";
import { useCatalog } from "@/hooks/useCatalog";
import {
  BRAND_HEADLINE,
  BRAND_SUBHEADLINE,
  BRAND_TAGLINE,
} from "@/lib/brand";

type FunnelStep = 1 | 2;

const TRUST_ITEMS = [
  "Chapter 1 free",
  "In-depth business stories",
  "First story free",
];

export default function LandingPageClient() {
  const router = useRouter();
  const [step, setStep] = useState<FunnelStep>(1);
  const [category, setCategory] = useState<LPCategory>("Trending");

  const { series: stories } = useCatalog({
    genre: lpCategoryToGenre(category),
    sort: "featured",
    limit: 6,
  });
  const progressStep = step === 1 ? 1 : 2;

  const goToRead = () => setStep(2);

  if (step === 1) {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-nav-bg">
        {/* Purple hero — fills viewport */}
        <div className="flex flex-1 flex-col pb-6 lp-hero-curve">
          <LPTopBar onRead={goToRead} />

          <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col justify-center px-4 pb-4 pt-1">
            <FunnelProgress step={progressStep} onPurple />

            <div className="text-center">
              <h1 className="text-[1.625rem] font-black leading-[1.15] tracking-tight text-white sm:text-[2rem]">
                {BRAND_HEADLINE}
              </h1>
              <p className="mx-auto mt-3 max-w-[18rem] text-[0.8125rem] leading-relaxed text-white/80 sm:max-w-sm sm:text-sm">
                {BRAND_SUBHEADLINE}
              </p>
            </div>

            {/* Looping-style glass card */}
            <div className="lp-glass-card mx-auto mt-6 w-full p-4 sm:mt-8 sm:p-5">
              <p className="text-center text-sm font-extrabold text-white sm:text-base">
                What do you want to start with?
              </p>

              <div className="mt-4 space-y-3">
                <ChoiceCard
                  variant="read"
                  title="Read stories"
                  subtitle="Explore in-depth business stories in cartoon form."
                  badge="Free"
                  cta="Start reading"
                  primary
                  onSelect={goToRead}
                />
                <ChoiceCard
                  variant="create"
                  title="Create story"
                  subtitle="Turn a business story into a cartoon chapter."
                  badge="First story free"
                  cta="Start creating"
                  onSelect={() => router.push("/create")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* White trust section — looping curve transition */}
        <div className="-mt-1 flex-shrink-0 bg-white px-4 pb-6 pt-8 sm:pt-10">
          <div className="mx-auto max-w-[640px]">
            <ul className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-2">
              {TRUST_ITEMS.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-600 sm:text-sm"
                >
                  <span className="lp-trust-check text-sm">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-center text-[11px] font-medium text-gray-400">
              Toonlora — {BRAND_TAGLINE}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white">
      <div className="bg-nav-bg pb-5 lp-hero-curve">
        <LPTopBar onRead={() => setStep(2)} />
        <div className="mx-auto w-full max-w-[640px] px-4 pt-1">
          <FunnelProgress step={progressStep} onPurple />
          <button
            type="button"
            onClick={() => setStep(1)}
            className="mb-3 text-sm font-bold text-white/70 hover:text-white"
          >
            ← Back
          </button>
          <div className="text-center">
            <h2 className="text-xl font-black text-white sm:text-2xl">
              What do you want to read?
            </h2>
            <p className="mt-2 text-sm text-white/80">
              Choose a category and start with a free first chapter.
            </p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-[640px] flex-1 px-4 py-5 pb-8"
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
          {LP_CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat}
              category={cat}
              selected={category === cat}
              onSelect={setCategory}
            />
          ))}
        </div>

        <p className="mb-3 mt-6 text-sm font-bold text-lp-purple-deep">
          {category} · {stories.length} stories
        </p>
        <StoryGrid stories={stories} />

        <p className="mt-5 text-center text-xs text-gray-400">
          Chapter 1 is free · Account needed to continue
        </p>

        <div className="mt-4">
          <LPPillButton
            variant="secondary"
            onClick={() => router.push("/create")}
          >
            Create your own story
          </LPPillButton>
        </div>
      </motion.div>
    </div>
  );
}
