"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import { useLp3FunnelCopy } from "@/lib/lp3/useLp3FunnelCopy";
import type { LpStoryTeaser } from "@/lib/lp/storyTeasers";
import { resolveStoryFunnelCopy } from "@/lib/lp6/storyFunnelCopy";

/** LP/6 merges LP/3 shell copy with per-story funnel questions. */
export function useLp6FunnelCopy(
  storyId: string,
  storyName: string,
  teaser: LpStoryTeaser
) {
  const locale = useLocale();
  const base = useLp3FunnelCopy();
  const storyCopy = useMemo(
    () => resolveStoryFunnelCopy(storyId, storyName, teaser, locale),
    [storyId, storyName, teaser, locale]
  );

  return useMemo(
    () => ({
      ...base,
      storyWhy: {
        title: () => storyCopy.storyWhy.title,
      },
      storyWhyOptions: storyCopy.storyWhy.options,
      stories: {
        ...base.stories,
        titleOther: storyCopy.stories.title,
        title: storyCopy.stories.title,
      },
      depth: {
        title: storyCopy.depth.title,
      },
      depthOptions: storyCopy.depth.options,
      quiz: storyCopy.quiz,
      quiz2: storyCopy.quiz2,
      storyReveals: {
        ...base.storyReveals,
        [storyId]: storyCopy.reveal,
        default: storyCopy.reveal,
      },
      profileArchetypes: {
        ...base.profileArchetypes,
        default: storyCopy.profile,
        story: storyCopy.profile,
      },
      journey: {
        ...base.journey,
        title: storyCopy.journey.title,
        subtitle: storyCopy.journey.subtitle,
        weeks: storyCopy.journey.weeks,
      },
      loading: {
        ...base.loading,
        headline: storyCopy.loading.headline,
        tasks: storyCopy.loading.tasks,
      },
    }),
    [base, storyCopy, storyId]
  );
}
