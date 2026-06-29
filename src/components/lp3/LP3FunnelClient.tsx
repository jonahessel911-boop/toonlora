"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import LP3Shell, { LP3FooterDock } from "@/components/lp3/LP3Shell";
import LP3LegalFooter from "@/components/lp3/LP3LegalFooter";
import LP3CheckoutPayments from "@/components/lp3/LP3CheckoutPayments";
import LP3CoverSlideshow from "@/components/lp3/LP3CoverSlideshow";
import LP3CoverThumb from "@/components/lp3/LP3CoverThumb";
import LP3MembershipIncludes from "@/components/lp3/LP3MembershipIncludes";
import LP3MoneyBackGuarantee from "@/components/lp3/LP3MoneyBackGuarantee";
import LP3ReviewCarousel from "@/components/lp3/LP3ReviewCarousel";
import {
  LP3_LOADING_DURATION_MS,
  LP3_LOADING_TASKS,
  LP3_PROGRESS_STEPS,
  type LP3StepId,
} from "@/lib/lp3/content";
import { useLp3FunnelCopy } from "@/lib/lp3/useLp3FunnelCopy";
import {
  useLpFunnelId,
  useLpFunnelStepAnalytics,
} from "@/lib/lp3/useLpFunnelAnalytics";
import {
  trackLpFunnelStepBack,
  trackLpFunnelStepComplete,
} from "@/lib/analytics/lp-funnel-tracking";
import {
  ENTREPRENEUR_PLAN,
  MONTHLY_SUBSCRIPTION_PLANS,
  YEARLY_SUBSCRIPTION_PLANS,
  formatEur,
  getSubscriptionPlan,
  monthlyPlanForTier,
  planIntervalSuffix,
  planPerDayLabel,
  yearlyPlanForTier,
  type SubscriptionPlan,
} from "@/lib/payments/subscription-plans";
import { formatLp3StoryGridLabel } from "@/lib/lp3/story-labels";
import { MOCK_STORY_CATALOG } from "@/lib/mock/businessStoryCatalog";
import { useCatalog } from "@/hooks/useCatalog";
import { useUserStore } from "@/store/useUserStore";
import type { CatalogSeries } from "@/types/catalog";

interface LP3FunnelClientProps {
  initialCatalog?: CatalogSeries[];
  /** LP/4 uses a single hero image on the intro step instead of the cover mosaic. */
  variant?: "lp3" | "lp4";
}

interface StoryOption {
  id: string;
  title: string;
  displayTitle: string;
  subtitle: string;
  coverArtUrl?: string;
  coverGradient: string;
}

function mergeStoryOptions(catalog: CatalogSeries[]): StoryOption[] {
  const fromCatalog = catalog
    .filter((s) => s.coverArtUrl)
    .map((s) => {
      const title = s.title.split("—")[0]?.trim() || s.title;
      return {
        id: s.id,
        title,
        displayTitle: formatLp3StoryGridLabel({
          id: s.id,
          title,
          fullTitle: s.title,
          genre: s.genre,
          sagaSubtitle: s.sagaSubtitle,
        }),
        subtitle: s.synopsis?.slice(0, 60) || s.sagaLabel || "Business story",
        coverArtUrl: s.coverArtUrl,
        coverGradient: s.coverGradient,
      };
    });

  const seen = new Set(fromCatalog.map((s) => s.id));
  const fromMock = MOCK_STORY_CATALOG.flatMap((cat) =>
    cat.stories.map((s) => ({
      id: s.id,
      title: s.title,
      displayTitle: formatLp3StoryGridLabel({
        id: s.id,
        title: s.title,
        fullTitle: s.title,
        genre: cat.id,
        sagaSubtitle: s.subtitle,
      }),
      subtitle: s.subtitle,
      coverArtUrl: s.coverArtUrl,
      coverGradient: "from-[#0A1628] via-[#1e3a5f] to-[#2F80ED]",
    }))
  ).filter((s) => !seen.has(s.id));

  return [...fromCatalog, ...fromMock].slice(0, 12);
}

function LP3ContinueButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  const t = useTranslations("common");
  const label = children ?? t("continue");
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-full bg-[#2F80ED] px-6 py-4 text-base font-extrabold text-white shadow-lg transition hover:bg-[#2569C7] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {label}
    </button>
  );
}

function CoverMosaic({ stories }: { stories: StoryOption[] }) {
  const tiles = stories.slice(0, 12);
  return (
    <div className="relative mx-auto max-w-lg overflow-hidden px-2">
      <div className="grid grid-cols-4 gap-1 sm:grid-cols-5 sm:gap-1.5">
        {tiles.map((story, i) => (
          <div
            key={`${story.id}-${i}`}
            className="aspect-[2/3] overflow-hidden rounded-md shadow-sm"
          >
            {story.coverArtUrl ? (
              <LP3CoverThumb
                src={story.coverArtUrl}
                priority={i < 10}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className={`h-full w-full bg-gradient-to-br ${story.coverGradient}`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#F6F1E7] to-transparent" />
    </div>
  );
}

function LP4IntroHero() {
  return (
    <div className="mx-auto w-full max-w-md px-4 pt-2">
      <div className="overflow-hidden rounded-2xl shadow-xl ring-1 ring-[#0A1628]/10">
        <Image
          src="/images/lp4/business-stories-hero.png"
          alt="Business Stories"
          width={1024}
          height={1536}
          priority
          className="h-auto w-full object-cover"
          sizes="(max-width: 512px) 100vw, 448px"
        />
      </div>
    </div>
  );
}

export default function LP3FunnelClient({
  initialCatalog = [],
  variant = "lp3",
}: LP3FunnelClientProps) {
  const { email, fullName } = useUserStore();
  const { series: clientCatalog } = useCatalog({
    index: true,
    limit: 24,
    enabled: initialCatalog.length === 0,
  });
  const catalog = initialCatalog.length > 0 ? initialCatalog : clientCatalog;
  const stories = useMemo(() => mergeStoryOptions(catalog), [catalog]);

  const [step, setStep] = useState<LP3StepId>("intro");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStories, setSelectedStories] = useState<string[]>([]);
  const [selectedFeel, setSelectedFeel] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [selectedDepth, setSelectedDepth] = useState<string | null>(null);
  const [quizChoice, setQuizChoice] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quiz2Choice, setQuiz2Choice] = useState<string | null>(null);
  const [quiz2Submitted, setQuiz2Submitted] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<"month" | "year">("month");
  const [selectedPlanId, setSelectedPlanId] = useState(ENTREPRENEUR_PLAN.id);
  const [checkoutError, setCheckoutError] = useState("");
  const [loadingProgress, setLoadingProgress] = useState<number[]>(
    () => LP3_LOADING_TASKS.map(() => 0)
  );
  const tPaywall = useTranslations("paywall");
  const tLp4 = useTranslations("lp4");
  const copy = useLp3FunnelCopy();
  const lpId = useLpFunnelId(variant);
  useLpFunnelStepAnalytics(lpId, variant, step);

  const progressIndex = LP3_PROGRESS_STEPS.indexOf(step);
  const progressPct =
    progressIndex >= 0
      ? ((progressIndex + 1) / LP3_PROGRESS_STEPS.length) * 100
      : 0;

  const primaryCategory = selectedCategories[0] ?? "founder_stories";
  const profile =
    copy.profileArchetypes[primaryCategory] ?? copy.profileArchetypes.default;
  const revealKey = selectedStories[0] ?? "steve-jobs";
  const reveal =
    copy.storyReveals[revealKey] ?? copy.storyReveals.default;

  const goNext = useCallback(() => {
    trackLpFunnelStepComplete(lpId, step, variant);
    const idx = LP3_PROGRESS_STEPS.indexOf(step);
    if (step === "intro") {
      setStep("categories");
      return;
    }
    if (idx >= 0 && idx < LP3_PROGRESS_STEPS.length - 1) {
      setStep(LP3_PROGRESS_STEPS[idx + 1]!);
    }
  }, [lpId, step, variant]);

  const goBack = useCallback(() => {
    if (step === "intro") return;
    trackLpFunnelStepBack(lpId, step, variant);
    if (step === "categories") {
      setStep("intro");
      return;
    }
    const idx = LP3_PROGRESS_STEPS.indexOf(step);
    if (idx > 0) setStep(LP3_PROGRESS_STEPS[idx - 1]!);
  }, [lpId, step, variant]);

  useEffect(() => {
    if (step !== "loading") return;

    const taskCount = LP3_LOADING_TASKS.length;
    const start = Date.now();
    setLoadingProgress(LP3_LOADING_TASKS.map(() => 0));

    const tickProgress = () => {
      const elapsed = Date.now() - start;
      const segment = LP3_LOADING_DURATION_MS / taskCount;
      const progress = LP3_LOADING_TASKS.map((_, i) => {
        const inSegment = elapsed - i * segment;
        if (inSegment < 0) return 0;
        if (inSegment >= segment) return 100;
        return Math.round((inSegment / segment) * 100);
      });
      setLoadingProgress(progress);

      if (elapsed >= LP3_LOADING_DURATION_MS) {
        clearInterval(tick);
        trackLpFunnelStepComplete(lpId, "loading", variant);
        setStep("checkout");
      }
    };

    tickProgress();
    const tick = setInterval(tickProgress, 80);

    return () => clearInterval(tick);
  }, [lpId, step, variant]);

  const paidPlans: SubscriptionPlan[] =
    billingPeriod === "month"
      ? [...MONTHLY_SUBSCRIPTION_PLANS]
      : [...YEARLY_SUBSCRIPTION_PLANS];

  const selectedPlan =
    getSubscriptionPlan(selectedPlanId) ?? ENTREPRENEUR_PLAN;

  const switchBillingPeriod = (period: "month" | "year") => {
    if (period === billingPeriod) return;
    setBillingPeriod(period);
    const tier = getSubscriptionPlan(selectedPlanId)?.tier ?? "entrepreneur";
    const nextPlan =
      period === "year"
        ? yearlyPlanForTier(tier)
        : monthlyPlanForTier(tier);
    if (nextPlan) setSelectedPlanId(nextPlan.id);
  };

  const toggleStory = (id: string) => {
    setSelectedStories((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  if (step === "intro") {
    const introTitle =
      variant === "lp4" ? tLp4("intro.headline") : copy.intro.title;
    const introSubtitle =
      variant === "lp4" ? tLp4("intro.subtitle") : copy.intro.subtitle;

    return (
      <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-[#F6F1E7]">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-none pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
          {variant === "lp4" ? (
            <div className="mx-auto max-w-lg px-4 pt-4">
              <h1 className="text-center font-heading text-[1.45rem] font-extrabold leading-tight text-[#0A1628] sm:text-[1.6rem]">
                {introTitle}
              </h1>
              <LP4IntroHero />
              <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-snug text-[#475569]">
                {introSubtitle}
              </p>
            </div>
          ) : (
            <>
              <CoverMosaic stories={stories} />
              <div className="mx-auto max-w-lg px-4 pt-2">
                <h1 className="text-center font-heading text-[1.5rem] font-extrabold leading-tight text-[#0A1628] sm:text-[1.65rem]">
                  {introTitle}
                </h1>
                <p className="mx-auto mt-2 max-w-sm text-center text-sm leading-snug text-[#475569]">
                  {introSubtitle}
                </p>
              </div>
            </>
          )}
        </div>
        <LP3FooterDock>
          <LP3ContinueButton onClick={goNext} />
          <LP3LegalFooter />
        </LP3FooterDock>
      </div>
    );
  }

  if (step === "categories") {
    return (
      <LP3Shell
        stepLabel={copy.stepLabels.categories}
        progress={progressPct}
        showBack
        onBack={goBack}
      >
        <h2 className="text-center font-heading text-xl font-extrabold leading-snug text-[#0A1628]">
          {copy.categories.title}
        </h2>
        <div className="mx-auto mt-4 max-w-md space-y-2">
          {copy.categoryOptions.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategories([cat.id]);
                goNext();
              }}
              className="flex w-full items-center gap-3 rounded-full border border-[#E7DDCC] bg-white px-4 py-3 text-left transition hover:border-[#2F80ED]/40 hover:ring-2 hover:ring-[#2F80ED]/20 active:border-[#2F80ED] active:ring-2 active:ring-[#2F80ED]/30"
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="font-semibold text-[#0A1628]">{cat.label}</span>
            </button>
          ))}
        </div>
      </LP3Shell>
    );
  }

  if (step === "stories") {
    const storyCount = selectedStories.length;
    return (
      <LP3Shell
        stepLabel={copy.stepLabels.stories}
        progress={progressPct}
        showBack
        onBack={goBack}
        footer={
          storyCount >= 1 ? (
            <LP3ContinueButton onClick={goNext} />
          ) : null
        }
      >
        <h2 className="text-center font-heading text-xl font-extrabold leading-snug text-[#0A1628]">
          {copy.stories.title}
        </h2>
        <p className="mt-1.5 text-center text-xs text-[#64748B]">
          {storyCount === 0
            ? copy.stories.tapOne
            : copy.stories.selected(storyCount)}
        </p>
        <div className="mx-auto mt-4 grid max-w-md grid-cols-3 gap-2">
          {stories.slice(0, 9).map((story) => {
            const selected = selectedStories.includes(story.id);
            return (
              <button
                key={story.id}
                type="button"
                onClick={() => toggleStory(story.id)}
                className="text-center transition active:scale-95"
              >
                <div
                  className={`mx-auto aspect-square w-full max-w-[72px] overflow-hidden rounded-full transition ${
                    selected
                      ? "ring-2 ring-[#2F80ED] ring-offset-2 ring-offset-[#F6F1E7]"
                      : "ring-1 ring-[#E7DDCC] hover:ring-2 hover:ring-[#2F80ED]/40"
                  }`}
                >
                  {story.coverArtUrl ? (
                    <LP3CoverThumb
                      src={story.coverArtUrl}
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className={`h-full w-full bg-gradient-to-br ${story.coverGradient}`}
                    />
                  )}
                </div>
                <p className="mt-1.5 line-clamp-2 text-[10px] font-semibold leading-snug text-[#0A1628]">
                  {story.displayTitle}
                </p>
              </button>
            );
          })}
        </div>
      </LP3Shell>
    );
  }

  if (step === "time") {
    return (
      <LP3Shell
        stepLabel={copy.stepLabels.time}
        progress={progressPct}
        showBack
        onBack={goBack}
      >
        <h2 className="text-center font-heading text-xl font-extrabold leading-snug text-[#0A1628]">
          {copy.time.title}
        </h2>
        <div className="mx-auto mt-4 max-w-md space-y-2">
          {copy.timeOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setSelectedTime(opt.id);
                goNext();
              }}
              className="flex w-full items-center gap-3 rounded-full border border-[#E7DDCC] bg-white px-4 py-3 text-left transition hover:border-[#2F80ED]/40 active:border-[#2F80ED] active:ring-2 active:ring-[#2F80ED]/30"
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="font-semibold">{opt.label}</span>
            </button>
          ))}
        </div>
      </LP3Shell>
    );
  }

  if (step === "feel") {
    return (
      <LP3Shell
        stepLabel={copy.stepLabels.feel}
        progress={progressPct}
        showBack
        onBack={goBack}
      >
        <h2 className="text-center font-heading text-xl font-extrabold leading-snug text-[#0A1628]">
          {copy.feel.title}
        </h2>
        <div className="mx-auto mt-4 max-w-md space-y-2">
          {copy.feelOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setSelectedFeel(opt.id);
                goNext();
              }}
              className="flex w-full items-center gap-3 rounded-full border border-[#E7DDCC] bg-white px-4 py-3 text-left transition hover:border-[#2F80ED]/40 active:border-[#2F80ED] active:ring-2 active:ring-[#2F80ED]/30"
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="font-semibold">{opt.label}</span>
            </button>
          ))}
        </div>
      </LP3Shell>
    );
  }

  if (step === "habit") {
    return (
      <LP3Shell
        stepLabel={copy.stepLabels.habit}
        progress={progressPct}
        showBack
        onBack={goBack}
      >
        <h2 className="text-center font-heading text-xl font-extrabold leading-snug text-[#0A1628]">
          {copy.habit.title}
        </h2>
        <div className="mx-auto mt-4 max-w-md space-y-2">
          {copy.habitOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setSelectedHabit(opt.id);
                goNext();
              }}
              className="flex w-full items-center gap-3 rounded-full border border-[#E7DDCC] bg-white px-4 py-3 text-left transition hover:border-[#2F80ED]/40 active:border-[#2F80ED] active:ring-2 active:ring-[#2F80ED]/30"
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="font-semibold">{opt.label}</span>
            </button>
          ))}
        </div>
      </LP3Shell>
    );
  }

  if (step === "depth") {
    return (
      <LP3Shell
        stepLabel={copy.stepLabels.depth}
        progress={progressPct}
        showBack
        onBack={goBack}
      >
        <h2 className="text-center font-heading text-xl font-extrabold leading-snug text-[#0A1628]">
          {copy.depth.title}
        </h2>
        <div className="mx-auto mt-4 max-w-md space-y-2">
          {copy.depthOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setSelectedDepth(opt.id);
                goNext();
              }}
              className="flex w-full items-center gap-3 rounded-full border border-[#E7DDCC] bg-white px-4 py-3 text-left transition hover:border-[#2F80ED]/40 active:border-[#2F80ED] active:ring-2 active:ring-[#2F80ED]/30"
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="font-semibold">{opt.label}</span>
            </button>
          ))}
        </div>
      </LP3Shell>
    );
  }

  if (step === "quiz") {
    return (
      <LP3Shell
        stepLabel={copy.stepLabels.quiz}
        progress={progressPct}
        showBack
        onBack={goBack}
      >
        <h2 className="text-center font-heading text-xl font-extrabold leading-snug text-[#0A1628] sm:text-2xl">
          {copy.quiz.question}
        </h2>
        <div className="mx-auto mt-4 max-w-md space-y-2">
          {copy.quiz.options.map((opt) => {
            const picked = quizChoice === opt.id;
            const showResult = quizSubmitted;
            const isCorrect = Boolean(opt.correct);
            let style = "border-[#E7DDCC] bg-white";
            if (showResult && isCorrect) style = "border-emerald-500 bg-emerald-50";
            else if (showResult && picked && !isCorrect)
              style = "border-rose-400 bg-rose-50";
            else if (picked) style = "border-[#2F80ED] bg-white ring-2 ring-[#2F80ED]/30";

            return (
              <button
                key={opt.id}
                type="button"
                disabled={quizSubmitted}
                onClick={() => {
                  if (quizSubmitted) return;
                  setQuizChoice(opt.id);
                  setQuizSubmitted(true);
                  window.setTimeout(() => goNext(), 1400);
                }}
                className={`flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left font-semibold transition ${style}`}
              >
                {opt.label}
                {showResult && isCorrect ? (
                  <span className="text-emerald-600">✓</span>
                ) : null}
                {showResult && picked && !isCorrect ? (
                  <span className="text-rose-500">✕</span>
                ) : null}
              </button>
            );
          })}
        </div>
        {quizSubmitted ? (
          <p className="mx-auto mt-4 max-w-md rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {copy.quiz.explanation}
          </p>
        ) : null}
      </LP3Shell>
    );
  }

  if (step === "quiz2") {
    return (
      <LP3Shell
        stepLabel={copy.stepLabels.quiz2}
        progress={progressPct}
        showBack
        onBack={goBack}
      >
        <h2 className="text-center font-heading text-xl font-extrabold leading-snug text-[#0A1628] sm:text-2xl">
          {copy.quiz2.question}
        </h2>
        <div className="mx-auto mt-4 max-w-md space-y-2">
          {copy.quiz2.options.map((opt) => {
            const picked = quiz2Choice === opt.id;
            const showResult = quiz2Submitted;
            const isCorrect = Boolean(opt.correct);
            let style = "border-[#E7DDCC] bg-white";
            if (showResult && isCorrect) style = "border-emerald-500 bg-emerald-50";
            else if (showResult && picked && !isCorrect)
              style = "border-rose-400 bg-rose-50";
            else if (picked)
              style = "border-[#2F80ED] bg-white ring-2 ring-[#2F80ED]/30";

            return (
              <button
                key={opt.id}
                type="button"
                disabled={quiz2Submitted}
                onClick={() => {
                  if (quiz2Submitted) return;
                  setQuiz2Choice(opt.id);
                  setQuiz2Submitted(true);
                  window.setTimeout(() => goNext(), 1400);
                }}
                className={`flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left font-semibold transition ${style}`}
              >
                {opt.label}
                {showResult && isCorrect ? (
                  <span className="text-emerald-600">✓</span>
                ) : null}
                {showResult && picked && !isCorrect ? (
                  <span className="text-rose-500">✕</span>
                ) : null}
              </button>
            );
          })}
        </div>
        {quiz2Submitted ? (
          <p className="mx-auto mt-4 max-w-md rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {copy.quiz2.explanation}
          </p>
        ) : null}
      </LP3Shell>
    );
  }

  if (step === "reveal") {
    return (
      <LP3Shell
        stepLabel={copy.stepLabels.reveal}
        progress={progressPct}
        showBack
        onBack={goBack}
        footer={
          <>
            <LP3ContinueButton onClick={goNext} />
            <LP3LegalFooter />
          </>
        }
      >
        <h2 className="text-center font-heading text-xl font-extrabold leading-snug text-[#0A1628] sm:text-2xl">
          {reveal.headline}
        </h2>
        <div className="mx-auto mt-4 max-w-md space-y-3">
          <div className="overflow-hidden rounded-2xl border border-[#E7DDCC] bg-white">
            <div className="bg-gradient-to-r from-[#64748B] to-[#475569] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
              📋 {copy.reveal.publicRecord}
            </div>
            <p className="px-4 py-4 text-sm leading-relaxed text-[#475569]">
              {reveal.record}
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-[#2F80ED]/30 bg-white">
            <div className="bg-gradient-to-r from-[#2F80ED] to-[#0A1628] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
              ⚡ {copy.reveal.realStory}
            </div>
            <p className="px-4 py-4 text-sm leading-relaxed text-[#0A1628]">
              {reveal.real}
            </p>
            <div className="flex flex-wrap gap-2 px-4 pb-4">
              {reveal.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#2F80ED]/30 px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#2F80ED]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </LP3Shell>
    );
  }

  if (step === "stat") {
    return (
      <LP3Shell
        stepLabel={copy.stepLabels.stat}
        progress={progressPct}
        showBack
        onBack={goBack}
        footer={
          <>
            <LP3ContinueButton onClick={goNext} />
            <LP3LegalFooter />
          </>
        }
      >
        <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center text-center">
          <p className="font-heading text-6xl font-black text-[#2F80ED]">
            {copy.stat.percent}%
          </p>
          <p className="mt-4 text-lg font-semibold leading-relaxed text-[#0A1628]">
            {copy.stat.text}
          </p>
        </div>
      </LP3Shell>
    );
  }

  if (step === "profile") {
    return (
      <LP3Shell
        stepLabel={copy.stepLabels.profile}
        progress={progressPct}
        showBack
        onBack={goBack}
        showLogo
        footer={
          <>
            <LP3ContinueButton onClick={goNext} />
            <LP3LegalFooter />
          </>
        }
      >
        <h2 className="mt-2 text-center font-heading text-xl font-extrabold text-[#0A1628]">
          {copy.profile.title}
        </h2>
        <div className="mx-auto mt-3 max-w-md rounded-2xl border-2 border-[#2F80ED]/20 bg-white p-4">
          <h3 className="font-heading text-xl font-extrabold text-[#0A1628]">
            {profile.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#475569]">
            {profile.description}
          </p>
        </div>
        <div className="mx-auto mt-3 grid max-w-md grid-cols-2 gap-2">
          {copy.profile.stats.map((stat) => (
            <div
              key={stat.l}
              className="rounded-xl border border-[#E7DDCC] bg-white px-4 py-3 text-center"
            >
              <p className="text-xl font-extrabold text-[#0A1628]">{stat.n}</p>
              <p className="text-xs text-[#64748B]">{stat.l}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-3 max-w-md text-center text-sm font-bold text-[#0A1628]">
          {copy.profile.interestMap}
        </p>
        <div className="mx-auto mt-2 flex max-w-xs flex-wrap justify-center gap-1.5">
          {profile.traits.map((trait) => (
            <span
              key={trait}
              className="rounded-full bg-[#2F80ED]/10 px-3 py-1 text-xs font-semibold text-[#2F80ED]"
            >
              {trait}
            </span>
          ))}
        </div>
      </LP3Shell>
    );
  }

  if (step === "journey") {
    return (
      <LP3Shell
        stepLabel={copy.stepLabels.journey}
        progress={progressPct}
        showBack
        onBack={goBack}
        showLogo
        footer={
          <>
            <LP3ContinueButton onClick={goNext} />
            <LP3LegalFooter />
          </>
        }
      >
        <span className="mx-auto block w-fit rounded-full bg-[#2F80ED] px-4 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          {copy.journey.badge}
        </span>
        <h2 className="mt-2 text-center font-heading text-xl font-extrabold leading-snug text-[#0A1628]">
          {copy.journey.title}
        </h2>
        <p className="mt-1 text-center text-xs text-[#64748B]">
          {copy.journey.subtitle}
        </p>
        <div className="mx-auto mt-4 max-w-md rounded-2xl border border-[#E7DDCC] bg-white p-3">
          <svg viewBox="0 0 320 160" className="h-28 w-full">
            <defs>
              <linearGradient id="lp3Fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2F80ED" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#2F80ED" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 20 130 Q 80 120 120 90 T 200 50 T 300 20 L 300 150 L 20 150 Z"
              fill="url(#lp3Fill)"
            />
            <path
              d="M 20 130 Q 80 120 120 90 T 200 50 T 300 20"
              fill="none"
              stroke="#2F80ED"
              strokeWidth="3"
            />
            {[
              [20, 130],
              [100, 100],
              [200, 50],
              [300, 20],
            ].map(([cx, cy], i) => (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={i === 3 ? 8 : 5}
                fill={i === 3 ? "#0A1628" : "#2F80ED"}
              />
            ))}
          </svg>
          <div className="mt-2 grid grid-cols-4 gap-1 text-center text-[10px] font-semibold text-[#64748B]">
            {copy.journey.weeks.map((w) => (
              <span key={w.label}>{w.label}</span>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-3 max-w-md space-y-1.5">
          {copy.journey.weeks.map((week) => (
            <div
              key={week.label}
              className="flex items-center gap-2.5 rounded-xl border border-[#E7DDCC] bg-white px-3 py-2"
            >
              <span className="text-lg">{week.crown ? "👑" : "📖"}</span>
              <div>
                <p className="text-xs font-bold uppercase text-[#2F80ED]">
                  {week.label}
                </p>
                <p className="text-sm font-semibold text-[#0A1628]">
                  {week.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </LP3Shell>
    );
  }

  if (step === "loading") {
    return (
      <LP3Shell showLogo progress={progressPct} contentBottomPadding="none">
        <h2 className="mt-2 text-center font-heading text-xl font-extrabold text-[#0A1628]">
          {copy.loading.headline}
        </h2>
        <div className="mx-auto mt-5 max-w-md space-y-3">
          {copy.loading.tasks.map((task, i) => {
            const pct = loadingProgress[i] ?? 0;
            const done = pct >= 100;
            return (
              <div key={task} className="border-b border-[#E7DDCC] pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                        done
                          ? "bg-[#0A1628] text-white"
                          : "bg-[#E7DDCC] text-[#64748B]"
                      }`}
                    >
                      {done ? "✓" : ""}
                    </span>
                    <span className="text-sm font-semibold text-[#0A1628]">
                      {task}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#64748B]">
                    {Math.round(pct)}%
                  </span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#0A1628]/10">
                  <motion.div
                    className="h-full rounded-full bg-[#2F80ED]"
                    initial={{ width: "0%" }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </LP3Shell>
    );
  }

  return (
    <LP3Shell showLogo compactLogo>
      <div className="mx-auto w-full max-w-lg">
        <h1 className="text-center font-heading text-[1.2rem] font-extrabold leading-snug text-[#0A1628] sm:text-[1.35rem]">
          {tPaywall("headline")}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-center text-sm font-normal leading-relaxed text-[#475569]">
          {tPaywall("subhead")}
        </p>

        <LP3CoverSlideshow
          stories={stories}
          label={copy.checkout.readStoriesLike}
        />

        <div>
        <h2 className="mt-3 text-center font-heading text-base font-extrabold text-[#0A1628]">
          {tPaywall("chooseMembership")}
        </h2>

        <div className="mx-auto mt-3 flex max-w-xs rounded-full border border-[#E7DDCC] bg-white p-1">
          <button
            type="button"
            onClick={() => switchBillingPeriod("month")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-bold transition ${
              billingPeriod === "month"
                ? "bg-[#0A1628] text-white"
                : "text-[#64748B]"
            }`}
          >
            {tPaywall("monthly")}
          </button>
          <button
            type="button"
            onClick={() => switchBillingPeriod("year")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-bold transition ${
              billingPeriod === "year"
                ? "bg-[#0A1628] text-white"
                : "text-[#64748B]"
            }`}
          >
            {tPaywall("yearly")}
            <span className="ml-1 text-[10px] font-extrabold uppercase text-[#3B9EFF]">
              {tPaywall("savePercent")}
            </span>
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {paidPlans.map((plan) => {
            const selected = selectedPlanId === plan.id;
            const perDay = planPerDayLabel(plan);
            const intervalSuffix = planIntervalSuffix(plan);
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlanId(plan.id)}
                className={`relative w-full rounded-xl border-2 bg-white p-3 text-left transition ${
                  selected
                    ? "border-[#2F80ED] shadow-md"
                    : "border-[#E7DDCC]"
                }`}
              >
                {plan.popular ? (
                  <span className="absolute -top-2.5 left-3 rounded-full bg-[#2F80ED] px-2 py-0.5 text-[9px] font-bold uppercase text-white">
                    {tPaywall("mostPopular")}
                  </span>
                ) : null}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full border-2 text-[10px] ${
                        selected
                          ? "border-[#2F80ED] bg-[#2F80ED] text-white"
                          : "border-[#CBD5E1]"
                      }`}
                    >
                      {selected ? "✓" : ""}
                    </span>
                    <div>
                      <p className="text-sm font-extrabold text-[#0A1628]">
                        {plan.name}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        {plan.compareAtCents ? (
                          <>
                            <span className="line-through">
                              {formatEur(plan.compareAtCents)}
                            </span>{" "}
                          </>
                        ) : null}
                        {plan.priceLabel}
                        {intervalSuffix}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#0A1628] px-2 py-0.5 text-[10px] font-bold text-white">
                    {perDay}
                  </span>
                </div>
                {selected &&
                (plan.tier === "achiever" || plan.tier === "entrepreneur") ? (
                  <ul className="mt-2.5 space-y-1 border-t border-[#E7DDCC]/80 pt-2.5">
                    {(
                      tPaywall.raw(`planHighlights.${plan.tier}`) as string[]
                    ).map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-[11px] font-medium leading-snug text-[#475569]"
                      >
                        <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#00B67A] text-[8px] font-bold text-white">
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </button>
            );
          })}
        </div>

        <LP3CheckoutPayments
          lpId={lpId}
          funnelVariant={variant}
          plan={selectedPlan}
          email={email || undefined}
          fullName={fullName || undefined}
          checkoutError={checkoutError}
          onError={setCheckoutError}
          continueButton={LP3ContinueButton}
          legalFooter={<LP3LegalFooter />}
        />

        <LP3MoneyBackGuarantee />
        </div>

        <LP3MembershipIncludes />

        <div className="mt-5 pb-2">
          <p className="text-center text-xs font-bold uppercase tracking-[0.12em] text-[#64748B]">
            {copy.checkout.trustedByReaders}
          </p>
          <div className="mt-3">
            <LP3ReviewCarousel reviews={copy.reviews} alwaysCarousel />
          </div>
        </div>
      </div>
    </LP3Shell>
  );
}
