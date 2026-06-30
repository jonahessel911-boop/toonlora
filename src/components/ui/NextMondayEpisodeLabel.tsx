"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import {
  formatNextMondayShort,
  getNextMondayDate,
} from "@/lib/schedule/nextMonday";

interface NextMondayEpisodeLabelProps {
  className?: string;
}

export default function NextMondayEpisodeLabel({
  className = "",
}: NextMondayEpisodeLabelProps) {
  const t = useTranslations("schedule");
  const locale = useLocale();
  const dateLabel = useMemo(
    () => formatNextMondayShort(getNextMondayDate(), locale),
    [locale]
  );

  return (
    <span
      className={`rounded bg-black/70 px-2 py-1 text-center text-[10px] font-semibold leading-snug text-white backdrop-blur-sm sm:text-[11px] ${className}`}
    >
      {t("nextMondayNewEpisode", { date: dateLabel })}
    </span>
  );
}
