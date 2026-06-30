"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { resolveStoryTeaser } from "@/lib/lp/storyTeasers";

export interface Lp5IntroCopy {
  category: string;
  hook: string;
  description: string;
  chapterUnlocked: string;
  cta: string;
  riskReversal: string;
}

export function useLp5IntroCopy(
  storyId: string,
  coverTitleParam?: string | null
): Lp5IntroCopy {
  const locale = useLocale();
  const t = useTranslations("lp5.intro");

  return useMemo(() => {
    const teaser = resolveStoryTeaser(storyId, coverTitleParam, locale);

    return {
      category: teaser.category,
      hook: teaser.hook,
      description: teaser.description,
      chapterUnlocked: t("chapterUnlocked"),
      cta: t("startChapterFree"),
      riskReversal: t("riskReversal"),
    };
  }, [storyId, coverTitleParam, locale, t]);
}
