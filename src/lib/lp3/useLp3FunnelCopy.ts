"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  LP3_CATEGORY_OPTIONS,
  LP3_DEPTH_OPTIONS,
  LP3_FEEL_OPTIONS,
  LP3_HABIT_OPTIONS,
  LP3_LOADING_TASKS,
  LP3_PROGRESS_STEPS,
  LP4_PROGRESS_STEPS,
  LP3_STORY_WHY_OPTIONS,
  LP3_QUIZ,
  LP3_QUIZ_2,
  LP3_REVIEWS,
  LP3_STAT,
  LP3_TIME_OPTIONS,
  type LP3Review,
  type LP3StepId,
} from "@/lib/lp3/content";

type ArchetypeCopy = {
  title: string;
  description: string;
  traits: string[];
};

type StoryRevealCopy = {
  headline: string;
  record: string;
  real: string;
  tags: string[];
};

const ARCHETYPE_KEYS = [
  "founder_stories",
  "rise_and_fall",
  "empires",
  "heists_and_frauds",
  "default",
] as const;

const REVEAL_KEYS = ["steve-jobs", "elon-musk", "ferrari", "default"] as const;

export function useLp3FunnelCopy() {
  const t = useTranslations("lp3");
  const tCategories = useTranslations("categories");

  return useMemo(() => {
    const stepKeys = [
      ...new Set([...LP3_PROGRESS_STEPS, ...LP4_PROGRESS_STEPS]),
    ] as LP3StepId[];
    const stepLabels = Object.fromEntries(
      stepKeys.map((step) => [step, t(`steps.${step}`)])
    ) as Record<LP3StepId, string>;

    const storyWhyOptions = LP3_STORY_WHY_OPTIONS.map((opt) => ({
      ...opt,
      label: t(`options.storyWhy.${opt.id}`),
    }));

    const categoryOptions = LP3_CATEGORY_OPTIONS.map((cat) => ({
      ...cat,
      label: tCategories(`${cat.id}.label`),
    }));

    const feelOptions = LP3_FEEL_OPTIONS.map((opt) => ({
      ...opt,
      label: t(`options.feel.${opt.id}`),
    }));

    const timeOptions = LP3_TIME_OPTIONS.map((opt) => ({
      ...opt,
      label: t(`options.time.${opt.id}`),
    }));

    const habitOptions = LP3_HABIT_OPTIONS.map((opt) => ({
      ...opt,
      label: t(`options.habit.${opt.id}`),
    }));

    const depthOptions = LP3_DEPTH_OPTIONS.map((opt) => ({
      ...opt,
      label: t(`options.depth.${opt.id}`),
    }));

    const profileArchetypes = Object.fromEntries(
      ARCHETYPE_KEYS.map((key) => [
        key,
        {
          title: t(`archetypes.${key}.title`),
          description: t(`archetypes.${key}.description`),
          traits: t.raw(`archetypes.${key}.traits`) as string[],
        },
      ])
    ) as Record<string, ArchetypeCopy>;

    const storyReveals = Object.fromEntries(
      REVEAL_KEYS.map((key) => [
        key,
        {
          headline: t(`reveals.${key}.headline`),
          record: t(`reveals.${key}.record`),
          real: t(`reveals.${key}.real`),
          tags: t.raw(`reveals.${key}.tags`) as string[],
        },
      ])
    ) as Record<string, StoryRevealCopy>;

    const journeyWeeks = (
      t.raw("journey.weeks") as { label: string; title: string; crown?: boolean }[]
    );

    const reviews = LP3_REVIEWS.map((review, index) => ({
      ...review,
      timeAgo: t(`reviews.${index}.timeAgo`),
      title: t(`reviews.${index}.title`),
      body: t(`reviews.${index}.body`),
    })) as LP3Review[];

    const loadingTasks = LP3_LOADING_TASKS.map((_, index) =>
      t(`loading.tasks.${index}`)
    );

    return {
      stepLabels,
      intro: {
        title: t("intro.title"),
        subtitle: t("intro.subtitle"),
      },
      storyWhy: {
        title: (story: string) => t("storyWhy.title", { story }),
      },
      categories: {
        title: t("categories.title"),
      },
      stories: {
        title: t("stories.title"),
        titleOther: t("stories.titleOther"),
        tapOne: t("stories.tapOne"),
        selected: (count: number) => t("stories.selected", { count }),
        fallbackSubtitle: t("stories.fallbackSubtitle"),
      },
      time: { title: t("time.title") },
      feel: { title: t("feel.title") },
      habit: { title: t("habit.title") },
      depth: { title: t("depth.title") },
      quiz: {
        question: t("quiz1.question"),
        options: LP3_QUIZ.options.map((opt) => ({
          ...opt,
          label: t(`quiz1.options.${opt.id}`),
        })),
        explanation: t("quiz1.explanation"),
      },
      quiz2: {
        question: t("quiz2.question"),
        options: LP3_QUIZ_2.options.map((opt) => ({
          ...opt,
          label: t(`quiz2.options.${opt.id}`),
        })),
        explanation: t("quiz2.explanation"),
      },
      reveal: {
        publicRecord: t("reveal.publicRecord"),
        realStory: t("reveal.realStory"),
      },
      stat: {
        percent: LP3_STAT.percent,
        text: t("stat.text"),
      },
      profile: {
        title: t("profile.title"),
        stats: [
          { n: "340+", l: t("profile.stats.sagas") },
          { n: "5 min", l: t("profile.stats.perChapter") },
          { n: "94%", l: t("profile.stats.match") },
          { n: "6", l: t("profile.stats.categories") },
        ],
        interestMap: t("profile.interestMap"),
      },
      journey: {
        badge: t("journey.badge"),
        title: t("journey.title"),
        subtitle: t("journey.subtitle"),
        weeks: journeyWeeks,
      },
      loading: {
        headline: t("loading.headline"),
        title: t("loading.title"),
        tasks: loadingTasks,
      },
      checkout: {
        readStoriesLike: t("checkout.readStoriesLike"),
        trustedByReaders: t("checkout.trustedByReaders"),
      },
      categoryOptions,
      storyWhyOptions,
      feelOptions,
      timeOptions,
      habitOptions,
      depthOptions,
      profileArchetypes,
      storyReveals,
      reviews,
    };
  }, [t, tCategories]);
}
