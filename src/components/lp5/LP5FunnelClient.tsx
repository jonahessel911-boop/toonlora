"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import LP3Shell from "@/components/lp3/LP3Shell";
import LP3LegalFooter from "@/components/lp3/LP3LegalFooter";
import LP3CheckoutPayments from "@/components/lp3/LP3CheckoutPayments";
import LP3CoverSlideshow from "@/components/lp3/LP3CoverSlideshow";
import LP3MembershipIncludes from "@/components/lp3/LP3MembershipIncludes";
import LP3MoneyBackGuarantee from "@/components/lp3/LP3MoneyBackGuarantee";
import LP3ReviewCarousel from "@/components/lp3/LP3ReviewCarousel";
import WebtoonReader from "@/components/WebtoonReader";
import LP5IntroHero from "@/components/lp5/LP5IntroHero";
import { useLp5IntroCopy } from "@/lib/lp5/useLp5IntroCopy";
import { useLp3FunnelCopy } from "@/lib/lp3/useLp3FunnelCopy";
import {
  useLpFunnelId,
  useLpFunnelStepAnalytics,
} from "@/lib/lp3/useLpFunnelAnalytics";
import { useLpLanderContext } from "@/lib/lp/useLpLanderContext";
import {
  trackLpFunnelStepComplete,
  trackLpFunnelStepClick,
} from "@/lib/analytics/lp-funnel-tracking";
import { LP_FUNNEL_CLICK_TARGETS } from "@/lib/analytics/lp-funnel";
import { resolveLpCoverStoryContext } from "@/lib/lp/resolveLpCoverStory";
import { mergeStoryOptions } from "@/lib/lp3/storyOptions";
import { resolveStoryIdFromCoverTitle } from "@/lib/lp/storyTeasers";
import type { LP5StepId } from "@/lib/lp5/content";
import { fetchPublishedStory } from "@/lib/fetchPublishedStory";
import { episodeToReaderPanels } from "@/lib/readerPanels";
import { getReadableEpisodes } from "@/lib/readableEpisodes";
import { storyToSeriesDetail } from "@/lib/seriesCatalog";
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
import { useCatalog } from "@/hooks/useCatalog";
import { useUserStore } from "@/store/useUserStore";
import type { CatalogSeries } from "@/types/catalog";
import type { Story } from "@/types/story";

interface LP5FunnelClientProps {
  initialCatalog?: CatalogSeries[];
}

function LP5PrimaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-full bg-[#2F80ED] px-6 py-4 text-base font-extrabold text-white shadow-lg transition hover:bg-[#2569C7] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function LP5StoryReader({
  storyId,
  onChapterComplete,
}: {
  storyId: string;
  onChapterComplete: () => void;
}) {
  const t = useTranslations("lp5");
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchPublishedStory(storyId).then((fetched) => {
      if (!cancelled) {
        setStory(fetched);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [storyId]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#08040F]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center text-white">
        <p className="font-heading text-xl font-extrabold">{t("read.unavailableTitle")}</p>
        <p className="mt-2 text-sm text-white/70">{t("read.unavailableBody")}</p>
        <button
          type="button"
          onClick={onChapterComplete}
          className="mt-6 rounded-full bg-[#2F80ED] px-6 py-3 text-sm font-bold text-white"
        >
          {t("read.continueToUnlock")}
        </button>
      </div>
    );
  }

  const seriesDetail = storyToSeriesDetail(story);
  const episode = getReadableEpisodes(story)[0];

  if (!episode) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center text-white">
        <p className="font-heading text-xl font-extrabold">{t("read.unavailableTitle")}</p>
        <p className="mt-2 text-sm text-white/70">{t("read.unavailableBody")}</p>
        <button
          type="button"
          onClick={onChapterComplete}
          className="mt-6 rounded-full bg-[#2F80ED] px-6 py-3 text-sm font-bold text-white"
        >
          {t("read.continueToUnlock")}
        </button>
      </div>
    );
  }

  return (
    <WebtoonReader
      seriesId={storyId}
      seriesTitle={story.title}
      episodeNumber={episode.episodeNumber}
      episodeTitle={episode.title}
      panels={episodeToReaderPanels(episode, story.coverGradient, storyId)}
      genre={seriesDetail.genre}
      coverGradient={story.coverGradient}
      coverArtUrl={seriesDetail.coverArtUrl}
      creatorDisplayName={seriesDetail.creators[0]}
      episodes={seriesDetail.episodes.map((e) => ({
        number: e.number,
        title: e.title,
        coverGradient: e.coverGradient,
        coverArtUrl: e.coverArtUrl,
      }))}
      showControls
      isCatalog
      hideBackButton
      onCatalogNextEpisode={onChapterComplete}
    />
  );
}

export default function LP5FunnelClient({
  initialCatalog = [],
}: LP5FunnelClientProps) {
  const { email, fullName } = useUserStore();
  const { series: clientCatalog } = useCatalog({
    index: true,
    limit: 24,
    enabled: initialCatalog.length === 0,
  });
  const catalog = initialCatalog.length > 0 ? initialCatalog : clientCatalog;
  const searchParams = useSearchParams();
  const coverTitleParam = searchParams.get("cover_title");
  const pinnedStoryId = useMemo(
    () => resolveStoryIdFromCoverTitle(coverTitleParam),
    [coverTitleParam]
  );
  const stories = useMemo(
    () =>
      mergeStoryOptions(catalog, pinnedStoryId ? [pinnedStoryId] : []),
    [catalog, pinnedStoryId]
  );
  const coverContext = useMemo(
    () =>
      resolveLpCoverStoryContext(
        stories,
        coverTitleParam,
        "elon-musk",
        catalog
      ),
    [stories, coverTitleParam, catalog]
  );
  const {
    readerStoryId: activeStoryId,
    storyName: activeStoryLabel,
    heroStory,
    checkoutStories,
    hasCoverTitle,
  } = coverContext;

  const [step, setStep] = useState<LP5StepId>("intro");
  const [billingPeriod, setBillingPeriod] = useState<"month" | "year">("month");
  const [selectedPlanId, setSelectedPlanId] = useState(ENTREPRENEUR_PLAN.id);
  const [checkoutError, setCheckoutError] = useState("");

  const tLp5 = useTranslations("lp5");
  const tLp3 = useTranslations("lp3");
  const tPaywall = useTranslations("paywall");
  const copy = useLp3FunnelCopy();
  const introCopy = useLp5IntroCopy(
    coverContext.canonicalStoryId,
    coverTitleParam
  );
  const lpId = useLpFunnelId("lp5");
  const lander = useLpLanderContext(lpId);
  useLpFunnelStepAnalytics("lp5", step);

  const goToRead = useCallback(() => {
    trackLpFunnelStepClick(
      lander,
      "intro",
      LP_FUNNEL_CLICK_TARGETS.introCta,
      "lp5"
    );
    trackLpFunnelStepComplete(lander, "intro", "lp5");
    setStep("read");
  }, [lander]);

  const goToCheckout = useCallback(() => {
    trackLpFunnelStepComplete(lander, "read", "lp5");
    setStep("checkout");
  }, [lander]);

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

  const [inlineCtaVisible, setInlineCtaVisible] = useState(true);

  if (step === "intro") {
    return (
      <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-[#F6F1E7]">
        <div
          className={`min-h-0 flex-1 overflow-y-auto overscroll-y-none ${
            inlineCtaVisible
              ? "pb-4"
              : "pb-[calc(6.5rem+env(safe-area-inset-bottom))]"
          }`}
        >
          <LP5IntroHero
            copy={introCopy}
            story={heroStory}
            onStart={goToRead}
            ctaButton={LP5PrimaryButton}
            onInlineCtaVisibleChange={setInlineCtaVisible}
          />
        </div>
        <div
          className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 transition duration-300 ${
            inlineCtaVisible
              ? "translate-y-full opacity-0"
              : "translate-y-0 opacity-100"
          }`}
        >
          <div className="pointer-events-auto border-t border-[#E7DDCC]/80 bg-[#F6F1E7]/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(10,22,40,0.06)] backdrop-blur-md">
            <div className="mx-auto w-full max-w-lg space-y-2">
              <p className="text-center text-[10px] font-bold uppercase tracking-[0.12em] text-[#2F80ED]">
                {introCopy.chapterUnlocked}
              </p>
              <LP5PrimaryButton onClick={goToRead}>
                {introCopy.cta}
              </LP5PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "read") {
    return (
      <div className="min-h-[100dvh] bg-[#08040F]">
        <LP5StoryReader
          storyId={activeStoryId}
          onChapterComplete={goToCheckout}
        />
      </div>
    );
  }

  return (
    <LP3Shell showLogo compactLogo>
      <div className="mx-auto w-full max-w-lg">
        <h1 className="text-center font-heading text-[1.15rem] font-extrabold leading-snug text-[#0A1628] sm:text-[1.3rem]">
          {tLp5("checkout.headline", { story: activeStoryLabel })}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-center text-sm font-normal leading-relaxed text-[#475569]">
          {tPaywall("subhead")}
        </p>

        <LP3CoverSlideshow
          stories={checkoutStories}
          label={
            hasCoverTitle
              ? tLp3("checkout.readStoryAndMore", { story: activeStoryLabel })
              : copy.checkout.readStoriesLike
          }
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
            lander={lander}
            funnelVariant="lp5"
            plan={selectedPlan}
            email={email || undefined}
            fullName={fullName || undefined}
            checkoutError={checkoutError}
            onError={setCheckoutError}
            continueButton={LP5PrimaryButton}
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
